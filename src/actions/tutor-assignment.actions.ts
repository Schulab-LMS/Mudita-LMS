"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizeText } from "@/lib/sanitize";
import { createNotification } from "@/services/notification.service";

const createSchema = z.object({
  studentId: z.string().min(1),
  courseId: z.string().min(1),
  lessonId: z.string().optional().nullable(),
  title: z.string().trim().min(1, "Title is required").max(160),
  instructions: z.string().trim().min(1, "Instructions are required").max(10_000),
  kind: z.enum(["ASSIGNMENT", "QUIZ", "PROJECT"]),
  dueAt: z.string().optional().nullable(),
  maxPoints: z.coerce.number().int().min(1).max(10_000),
});

const submitSchema = z.object({
  assignmentId: z.string().min(1),
  content: z.string().trim().min(1, "Write something before submitting").max(10_000),
});

const gradeSchema = z.object({
  submissionId: z.string().min(1),
  points: z.coerce.number().int().min(0).optional().nullable(),
  feedback: z.string().trim().min(1, "Feedback is required").max(10_000),
  outcome: z.enum(["REVIEWED", "RETURNED"]),
});

export type CreateTutorAssignmentInput = z.input<typeof createSchema>;

export async function createTutorAssignment(input: CreateTutorAssignmentInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const data = parsed.data;

  const tutor = await db.tutorProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      bookings: { where: { studentId: data.studentId }, take: 1, select: { id: true } },
    },
  });
  if (!tutor || tutor.bookings.length === 0) {
    return { success: false, error: "You can only assign work to your booked learners" };
  }

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: data.studentId, courseId: data.courseId } },
    select: { status: true },
  });
  if (!enrollment || !["ACTIVE", "COMPLETED"].includes(enrollment.status)) {
    return { success: false, error: "The learner is not enrolled in this course" };
  }

  if (data.lessonId) {
    const lesson = await db.lesson.findFirst({
      where: { id: data.lessonId, module: { courseId: data.courseId } },
      select: { id: true },
    });
    if (!lesson) return { success: false, error: "The selected lesson is not in this course" };
  }

  let dueAt: Date | null = null;
  if (data.dueAt) {
    dueAt = new Date(data.dueAt);
    if (Number.isNaN(dueAt.getTime())) return { success: false, error: "Enter a valid due date" };
  }

  const assignment = await db.tutorAssignment.create({
    data: {
      tutorId: tutor.id,
      studentId: data.studentId,
      courseId: data.courseId,
      lessonId: data.lessonId || null,
      title: sanitizeText(data.title),
      instructions: sanitizeText(data.instructions),
      kind: data.kind,
      dueAt,
      maxPoints: data.maxPoints,
      status: "PUBLISHED",
    },
    select: { id: true, title: true },
  });

  await createNotification(data.studentId, {
    title: "New assignment",
    message: assignment.title,
    type: "ASSIGNMENT",
    link: "/student/assignments",
  });
  revalidatePath("/tutor/teaching");
  revalidatePath("/student/assignments");
  return { success: true, assignmentId: assignment.id };
}

export async function submitTutorAssignment(input: z.input<typeof submitSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const assignment = await db.tutorAssignment.findFirst({
    where: {
      id: parsed.data.assignmentId,
      studentId: session.user.id,
      status: "PUBLISHED",
    },
    select: { id: true, studentId: true, title: true, tutor: { select: { userId: true } } },
  });
  if (!assignment) return { success: false, error: "Assignment not found or not open" };

  await db.tutorAssignmentSubmission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId: assignment.id,
        studentId: session.user.id,
      },
    },
    create: {
      assignmentId: assignment.id,
      studentId: session.user.id,
      content: sanitizeText(parsed.data.content),
    },
    update: {
      content: sanitizeText(parsed.data.content),
      status: "SUBMITTED",
      points: null,
      feedback: null,
      feedbackById: null,
      feedbackAt: null,
      submittedAt: new Date(),
    },
  });

  await createNotification(assignment.tutor.userId, {
    title: "Assignment submitted",
    message: assignment.title,
    type: "ASSIGNMENT",
    link: "/tutor/teaching",
  });
  revalidatePath("/student/assignments");
  revalidatePath("/tutor/teaching");
  return { success: true };
}

export async function gradeTutorAssignment(input: z.input<typeof gradeSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  const parsed = gradeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const submission = await db.tutorAssignmentSubmission.findFirst({
    where: {
      id: parsed.data.submissionId,
      assignment: { tutor: { userId: session.user.id } },
    },
    select: {
      id: true,
      studentId: true,
      assignment: { select: { id: true, title: true, maxPoints: true } },
    },
  });
  if (!submission) return { success: false, error: "Submission not found" };

  const points = parsed.data.outcome === "REVIEWED" ? parsed.data.points : null;
  if (parsed.data.outcome === "REVIEWED" && points == null) {
    return { success: false, error: "Points are required when marking reviewed" };
  }
  if (points != null && points > submission.assignment.maxPoints) {
    return { success: false, error: `Points cannot exceed ${submission.assignment.maxPoints}` };
  }

  await db.tutorAssignmentSubmission.update({
    where: { id: submission.id },
    data: {
      status: parsed.data.outcome,
      points,
      feedback: sanitizeText(parsed.data.feedback),
      feedbackById: session.user.id,
      feedbackAt: new Date(),
    },
  });

  await createNotification(submission.studentId, {
    title: parsed.data.outcome === "REVIEWED" ? "Assignment graded" : "Assignment returned",
    message: submission.assignment.title,
    type: "ASSIGNMENT",
    link: "/student/assignments",
  });
  revalidatePath(`/tutor/teaching/assignments/${submission.assignment.id}`);
  revalidatePath("/tutor/teaching");
  revalidatePath("/student/assignments");
  revalidatePath(`/parent/children/${submission.studentId}`);
  return { success: true };
}
