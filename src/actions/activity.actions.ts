"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdminRole } from "@/lib/auth-helpers";
import { sanitizeText } from "@/lib/sanitize";

const MAX_LEN = 5000;

// Student submits (or updates) their response to a lesson's activity. One
// submission per (student, lesson); resubmitting resets it to SUBMITTED so the
// tutor knows to re-review.
export async function submitActivity(data: {
  lessonId: string;
  content: string;
  bookingId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const content = sanitizeText(data.content).slice(0, MAX_LEN);
  if (!content) return { success: false, error: "Write something before submitting" };

  const lesson = await db.lesson.findUnique({
    where: { id: data.lessonId },
    select: { id: true },
  });
  if (!lesson) return { success: false, error: "Lesson not found" };

  await db.activitySubmission.upsert({
    where: { studentId_lessonId: { studentId: session.user.id, lessonId: data.lessonId } },
    create: {
      lessonId: data.lessonId,
      studentId: session.user.id,
      bookingId: data.bookingId ?? null,
      content,
      status: "SUBMITTED",
    },
    update: {
      content,
      status: "SUBMITTED",
      bookingId: data.bookingId ?? null,
      feedback: null,
      feedbackById: null,
      feedbackAt: null,
    },
  });

  if (data.bookingId) revalidatePath(`/session/${data.bookingId}`);
  return { success: true };
}

// Tutor (with a booking for this student+lesson) or admin leaves feedback.
export async function giveActivityFeedback(submissionId: string, feedback: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const text = sanitizeText(feedback).slice(0, MAX_LEN);
  if (!text) return { success: false, error: "Write feedback before sending" };

  const submission = await db.activitySubmission.findUnique({
    where: { id: submissionId },
    select: { id: true, lessonId: true, studentId: true, bookingId: true },
  });
  if (!submission) return { success: false, error: "Submission not found" };

  let authorized = isAdminRole(session.user.role);
  if (!authorized) {
    // Must be a tutor with a booking for this student on this lesson.
    const booking = await db.booking.findFirst({
      where: {
        studentId: submission.studentId,
        lessonId: submission.lessonId,
        tutor: { userId: session.user.id },
      },
      select: { id: true },
    });
    authorized = Boolean(booking);
  }
  if (!authorized) return { success: false, error: "Not allowed to review this submission" };

  await db.activitySubmission.update({
    where: { id: submissionId },
    data: {
      feedback: text,
      feedbackById: session.user.id,
      feedbackAt: new Date(),
      status: "REVIEWED",
    },
  });

  if (submission.bookingId) revalidatePath(`/session/${submission.bookingId}`);
  return { success: true };
}
