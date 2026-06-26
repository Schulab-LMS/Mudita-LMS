"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdminRole } from "@/lib/auth-helpers";
import { isInPreviewMode, PREVIEW_WRITE_BLOCKED_MESSAGE } from "@/lib/view-as.server";
import { sanitizeText } from "@/lib/sanitize";
import { isEnrolledInBundle } from "@/services/bundle.service";
import { submitBundleProjectSchema } from "@/validators/action.schemas";

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

  if (await isInPreviewMode()) {
    return { success: false, error: PREVIEW_WRITE_BLOCKED_MESSAGE };
  }

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

// Student submits (or updates) their capstone/portfolio project for a bundle.
// One submission per (student, bundle); resubmitting resets it to SUBMITTED.
export async function submitBundleProject(data: { bundleId: string; content: string }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  if (await isInPreviewMode()) {
    return { success: false, error: PREVIEW_WRITE_BLOCKED_MESSAGE };
  }

  const parsed = submitBundleProjectSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const content = sanitizeText(parsed.data.content).slice(0, MAX_LEN);
  if (!content) return { success: false, error: "Write something before submitting" };

  const bundle = await db.bundle.findUnique({
    where: { id: parsed.data.bundleId },
    select: { id: true },
  });
  if (!bundle) return { success: false, error: "Bundle not found" };

  // Capstones are for learners working through the bundle — require enrolment
  // in at least one of its courses.
  if (!(await isEnrolledInBundle(session.user.id, parsed.data.bundleId))) {
    return { success: false, error: "Enrol in this bundle's courses before submitting its project" };
  }

  await db.activitySubmission.upsert({
    where: { studentId_bundleId: { studentId: session.user.id, bundleId: parsed.data.bundleId } },
    create: {
      bundleId: parsed.data.bundleId,
      studentId: session.user.id,
      content,
      status: "SUBMITTED",
    },
    update: {
      content,
      status: "SUBMITTED",
      feedback: null,
      feedbackById: null,
      feedbackAt: null,
    },
  });

  revalidatePath("/student/portfolio");
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
  if (!authorized && submission.lessonId) {
    // Lesson submissions: a tutor with a booking for this student on this
    // lesson may review. Bundle capstone submissions (lessonId null) have no
    // lesson booking, so they're admin-review-only.
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
