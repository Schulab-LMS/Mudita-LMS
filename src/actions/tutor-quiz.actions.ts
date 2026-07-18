"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { isInPreviewMode, PREVIEW_WRITE_BLOCKED_MESSAGE } from "@/lib/view-as.server";
import { createNotification } from "@/services/notification.service";

const answerSchema = z.object({
  text: z.string().trim().min(1, "Every answer needs text").max(500),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  text: z.string().trim().min(1, "Every question needs text").max(2_000),
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
  points: z.coerce.number().int().min(1).max(100),
  explanation: z.string().trim().max(2_000).optional().nullable(),
  answers: z.array(answerSchema).min(1).max(8),
}).superRefine((question, ctx) => {
  const correctCount = question.answers.filter((answer) => answer.isCorrect).length;
  if (correctCount === 0) {
    ctx.addIssue({ code: "custom", path: ["answers"], message: "Every question needs a correct answer" });
  }
  if (question.type === "TRUE_FALSE" && question.answers.length !== 2) {
    ctx.addIssue({ code: "custom", path: ["answers"], message: "True/false questions need exactly two answers" });
  }
  if (question.type === "MULTIPLE_CHOICE" && question.answers.length < 2) {
    ctx.addIssue({ code: "custom", path: ["answers"], message: "Multiple-choice questions need at least two answers" });
  }
  if (question.type !== "SHORT_ANSWER" && correctCount !== 1) {
    ctx.addIssue({ code: "custom", path: ["answers"], message: "Choose exactly one correct answer" });
  }
});

const createTutorQuizSchema = z.object({
  studentId: z.string().min(1),
  courseId: z.string().min(1),
  lessonId: z.string().optional().nullable(),
  title: z.string().trim().min(1, "Title is required").max(160),
  instructions: z.string().trim().min(1, "Instructions are required").max(10_000),
  dueAt: z.string().optional().nullable(),
  passingScore: z.coerce.number().int().min(0).max(100),
  questions: z.array(questionSchema).min(1, "Add at least one question").max(20),
});

const submitTutorQuizSchema = z.object({
  assignmentId: z.string().min(1),
  answers: z.record(z.string(), z.string().max(2_000)),
});

export type CreateTutorQuizInput = z.input<typeof createTutorQuizSchema>;

const normaliseText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

export async function createTutorQuiz(input: CreateTutorQuizInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (await isInPreviewMode()) return { success: false, error: PREVIEW_WRITE_BLOCKED_MESSAGE };

  const parsed = createTutorQuizSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const data = parsed.data;

  const tutor = await db.tutorProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      bookings: { where: { studentId: data.studentId }, take: 1, select: { id: true } },
      courseAssignments: { where: { courseId: data.courseId }, take: 1, select: { id: true } },
    },
  });
  if (!tutor || tutor.bookings.length === 0) {
    return { success: false, error: "You can only assign quizzes to your booked learners" };
  }
  if (tutor.courseAssignments.length === 0) {
    return { success: false, error: "You are not assigned to teach this course" };
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
  const totalPoints = data.questions.reduce((sum, question) => sum + question.points, 0);

  const assignment = await db.tutorAssignment.create({
    data: {
      tutorId: tutor.id,
      studentId: data.studentId,
      courseId: data.courseId,
      lessonId: data.lessonId || null,
      title: sanitizeText(data.title),
      instructions: sanitizeText(data.instructions),
      kind: "QUIZ",
      status: "PUBLISHED",
      dueAt,
      maxPoints: totalPoints,
      passingScore: data.passingScore,
      quizQuestions: {
        create: data.questions.map((question, questionIndex) => ({
          text: sanitizeText(question.text),
          type: question.type,
          points: question.points,
          order: questionIndex,
          explanation: question.explanation ? sanitizeText(question.explanation) : null,
          answers: {
            create: question.answers.map((answer, answerIndex) => ({
              text: sanitizeText(answer.text),
              isCorrect: answer.isCorrect,
              order: answerIndex,
            })),
          },
        })),
      },
    },
    select: { id: true, title: true },
  });

  await audit({
    actorId: session.user.id,
    action: "tutor.quiz_create",
    resource: "TutorAssignment",
    resourceId: assignment.id,
    metadata: { studentId: data.studentId, courseId: data.courseId, questionCount: data.questions.length, totalPoints },
  });
  await createNotification(data.studentId, {
    title: "New quiz",
    message: assignment.title,
    type: "ASSIGNMENT",
    link: `/student/assignments/${assignment.id}/quiz`,
  });
  revalidatePath("/tutor/teaching");
  revalidatePath("/student/assignments");
  revalidatePath(`/parent/children/${data.studentId}`);
  return { success: true, assignmentId: assignment.id };
}

export async function submitTutorQuiz(input: z.input<typeof submitTutorQuizSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (await isInPreviewMode()) return { success: false, error: PREVIEW_WRITE_BLOCKED_MESSAGE };
  const parsed = submitTutorQuizSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const limit = await rateLimit(`tutor-quiz:${session.user.id}:${parsed.data.assignmentId}`, {
    maxRequests: 10,
    windowSeconds: 60,
  });
  if (!limit.success) return { success: false, error: `Too many attempts. Try again in ${limit.retryAfterSeconds}s.` };

  const assignment = await db.tutorAssignment.findFirst({
    where: {
      id: parsed.data.assignmentId,
      studentId: session.user.id,
      kind: "QUIZ",
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      passingScore: true,
      tutor: { select: { userId: true } },
      quizQuestions: {
        orderBy: { order: "asc" },
        include: { answers: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!assignment) return { success: false, error: "Quiz not found or not open" };

  for (const question of assignment.quizQuestions) {
    if (!parsed.data.answers[question.id]?.trim()) {
      return { success: false, error: "Answer every question before submitting" };
    }
  }

  let totalPoints = 0;
  let earnedPoints = 0;
  const questionResults = assignment.quizQuestions.map((question) => {
    totalPoints += question.points;
    const selected = parsed.data.answers[question.id].trim();
    const correctAnswers = question.answers.filter((answer) => answer.isCorrect);
    const correct = question.type === "SHORT_ANSWER"
      ? correctAnswers.some((answer) => normaliseText(answer.text) === normaliseText(selected))
      : correctAnswers.some((answer) => answer.id === selected);
    if (correct) earnedPoints += question.points;
    const selectedAnswer = question.answers.find((answer) => answer.id === selected);
    return {
      questionId: question.id,
      selectedAnswerId: question.type === "SHORT_ANSWER" ? null : selected,
      selectedAnswerText: question.type === "SHORT_ANSWER" ? sanitizeText(selected) : selectedAnswer?.text ?? "",
      correctAnswerId: question.type === "SHORT_ANSWER" ? null : correctAnswers[0]?.id ?? null,
      correctAnswerText: correctAnswers[0]?.text ?? "",
      correct,
      points: correct ? question.points : 0,
      explanation: question.explanation,
    };
  });
  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passingScore = assignment.passingScore ?? 70;
  const passed = score >= passingScore;

  const attempt = await db.tutorQuizAttempt.create({
    data: {
      assignmentId: assignment.id,
      studentId: session.user.id,
      score,
      earnedPoints,
      totalPoints,
      passed,
      answers: questionResults,
    },
    select: { id: true, submittedAt: true },
  });

  await audit({
    actorId: session.user.id,
    action: "student.tutor_quiz_submit",
    resource: "TutorQuizAttempt",
    resourceId: attempt.id,
    metadata: { assignmentId: assignment.id, score, passed },
  });
  await createNotification(assignment.tutor.userId, {
    title: "Quiz completed",
    message: `${assignment.title}: ${score}%`,
    type: "ASSIGNMENT",
    link: `/tutor/teaching/assignments/${assignment.id}`,
  });
  revalidatePath(`/student/assignments/${assignment.id}/quiz`);
  revalidatePath("/student/assignments");
  revalidatePath("/tutor/teaching");
  revalidatePath(`/tutor/teaching/assignments/${assignment.id}`);
  revalidatePath(`/parent/children/${session.user.id}`);

  return {
    success: true,
    data: {
      attemptId: attempt.id,
      submittedAt: attempt.submittedAt,
      score,
      passed,
      passingScore,
      earnedPoints,
      totalPoints,
      questionResults,
    },
  };
}
