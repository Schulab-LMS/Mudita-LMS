import { db } from "@/lib/db";

// Read helpers for the lesson learning page's interactive tabs: a learner's
// private Notes and the public Q&A thread. Resources live on the lesson row
// itself (synced from resources.md) so they need no service here.

// A learner's private note for a lesson, or null when they haven't written one.
export async function getLessonNote(
  userId: string,
  lessonId: string
): Promise<string | null> {
  const note = await db.lessonNote.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { content: true },
  });
  return note?.content ?? null;
}

const QUESTION_AUTHOR_SELECT = {
  select: { id: true, name: true, avatar: true, role: true },
} as const;

export interface LessonAnswerView {
  id: string;
  body: string;
  createdAt: Date;
  author: { id: string; name: string; avatar: string | null; role: string };
}

export interface LessonQuestionView {
  id: string;
  body: string;
  createdAt: Date;
  author: { id: string; name: string; avatar: string | null; role: string };
  answers: LessonAnswerView[];
}

// All questions on a lesson (newest first), each with its staff answers
// (oldest first). Visible to everyone enrolled in the course.
export async function getLessonQuestions(
  lessonId: string
): Promise<LessonQuestionView[]> {
  const questions = await db.lessonQuestion.findMany({
    where: { lessonId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: QUESTION_AUTHOR_SELECT,
      answers: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          author: QUESTION_AUTHOR_SELECT,
        },
      },
    },
  });
  return questions;
}
