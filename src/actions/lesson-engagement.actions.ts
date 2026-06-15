"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdminRole } from "@/lib/auth-helpers";
import { isInPreviewMode } from "@/lib/view-as.server";
import { sanitizeText } from "@/lib/sanitize";

// Stable error codes (not user-facing prose). The client maps these to
// localized strings under `lesson.qa.errors`, so wording lives in the message
// catalogs, not here.
export type LessonEngagementError =
  | "unauthenticated"
  | "previewBlocked"
  | "notEnrolled"
  | "lessonNotFound"
  | "questionNotFound"
  | "answerNotFound"
  | "notStaff"
  | "notAllowedDelete"
  | "emptyQuestion"
  | "emptyAnswer"
  | "generic";

type ActionResult =
  | { success: true }
  | { success: false; error: LessonEngagementError };

const NOTE_MAX = 20_000;
const QA_MAX = 4_000;

const saveNoteSchema = z.object({
  lessonId: z.string().min(1),
  content: z.string().max(NOTE_MAX),
});

const askSchema = z.object({
  lessonId: z.string().min(1),
  body: z.string().min(1).max(QA_MAX),
});

const answerSchema = z.object({
  questionId: z.string().min(1),
  body: z.string().min(1).max(QA_MAX),
});

// Resolve the course that owns a lesson and whether `userId` may participate in
// it (enrolled, course is free, or platform staff). Used to gate Q&A writes so
// only people who can see the lesson can post on it.
async function lessonAccess(lessonId: string, userId: string, role?: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, module: { select: { course: { select: { id: true, isFree: true } } } } },
  });
  if (!lesson) return { ok: false as const, error: "lessonNotFound" as const };
  const course = lesson.module.course;
  if (isAdminRole(role) || course.isFree) {
    return { ok: true as const, courseId: course.id };
  }
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
    select: { id: true },
  });
  if (!enrollment) return { ok: false as const, error: "notEnrolled" as const };
  return { ok: true as const, courseId: course.id };
}

// Persist (or clear) a learner's private note for a lesson. Idempotent upsert;
// an empty note deletes the row so the Notes tab reads as "empty" again.
export async function saveLessonNote(input: {
  lessonId: string;
  content: string;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "unauthenticated" };
  if (await isInPreviewMode()) {
    return { success: false, error: "previewBlocked" };
  }

  const parsed = saveNoteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "generic" };

  const content = sanitizeText(parsed.data.content).slice(0, NOTE_MAX);
  const userId = session.user.id;
  const { lessonId } = parsed.data;

  if (!content.trim()) {
    await db.lessonNote.deleteMany({ where: { userId, lessonId } });
    return { success: true };
  }

  await db.lessonNote.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, content },
    update: { content },
  });
  return { success: true };
}

// A learner posts a public question on a lesson.
export async function askLessonQuestion(input: {
  lessonId: string;
  body: string;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "unauthenticated" };
  if (await isInPreviewMode()) {
    return { success: false, error: "previewBlocked" };
  }

  const parsed = askSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "emptyQuestion" };

  const access = await lessonAccess(parsed.data.lessonId, session.user.id, session.user.role);
  if (!access.ok) return { success: false, error: access.error };

  const body = sanitizeText(parsed.data.body).slice(0, QA_MAX);
  if (!body.trim()) return { success: false, error: "emptyQuestion" };

  await db.lessonQuestion.create({
    data: { lessonId: parsed.data.lessonId, authorId: session.user.id, body },
  });
  revalidatePath("/student/learn", "layout");
  return { success: true };
}

// A tutor or admin answers a question.
export async function answerLessonQuestion(input: {
  questionId: string;
  body: string;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "unauthenticated" };
  if (await isInPreviewMode()) {
    return { success: false, error: "previewBlocked" };
  }

  const role = session.user.role;
  if (!isAdminRole(role) && role !== "TUTOR") {
    return { success: false, error: "notStaff" };
  }

  const parsed = answerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "emptyAnswer" };

  const question = await db.lessonQuestion.findUnique({
    where: { id: parsed.data.questionId },
    select: { id: true },
  });
  if (!question) return { success: false, error: "questionNotFound" };

  const body = sanitizeText(parsed.data.body).slice(0, QA_MAX);
  if (!body.trim()) return { success: false, error: "emptyAnswer" };

  await db.lessonAnswer.create({
    data: { questionId: parsed.data.questionId, authorId: session.user.id, body },
  });
  revalidatePath("/student/learn", "layout");
  return { success: true };
}

// Delete a question (author or admin). Answers cascade with it.
export async function deleteLessonQuestion(questionId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "unauthenticated" };
  if (await isInPreviewMode()) {
    return { success: false, error: "previewBlocked" };
  }

  const question = await db.lessonQuestion.findUnique({
    where: { id: questionId },
    select: { authorId: true },
  });
  if (!question) return { success: false, error: "questionNotFound" };
  if (question.authorId !== session.user.id && !isAdminRole(session.user.role)) {
    return { success: false, error: "notAllowedDelete" };
  }

  await db.lessonQuestion.delete({ where: { id: questionId } });
  revalidatePath("/student/learn", "layout");
  return { success: true };
}

// Delete an answer (its author or admin).
export async function deleteLessonAnswer(answerId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "unauthenticated" };
  if (await isInPreviewMode()) {
    return { success: false, error: "previewBlocked" };
  }

  const answer = await db.lessonAnswer.findUnique({
    where: { id: answerId },
    select: { authorId: true },
  });
  if (!answer) return { success: false, error: "answerNotFound" };
  if (answer.authorId !== session.user.id && !isAdminRole(session.user.role)) {
    return { success: false, error: "notAllowedDelete" };
  }

  await db.lessonAnswer.delete({ where: { id: answerId } });
  revalidatePath("/student/learn", "layout");
  return { success: true };
}
