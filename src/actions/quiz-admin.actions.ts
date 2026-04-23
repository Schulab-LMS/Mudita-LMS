"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { audit } from "@/lib/audit";
import {
  createQuizSchema,
  updateQuizSchema,
  deleteQuizSchema,
  createQuestionSchema,
  updateQuestionSchema,
  deleteQuestionSchema,
} from "@/validators/action.schemas";

// ── Quiz CRUD ───────────────────────────────────────────────────────────

export async function createQuiz(data: {
  lessonId: string;
  title: string;
  passingScore: number;
  timeLimit?: number;
}) {
  try {
    const session = await requireAdmin();
    const parsed = createQuizSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const existing = await db.quiz.findUnique({ where: { lessonId: parsed.data.lessonId } });
    if (existing) return { success: false, error: "This lesson already has a quiz" };

    const quiz = await db.quiz.create({
      data: {
        lessonId: parsed.data.lessonId,
        title: parsed.data.title,
        passingScore: parsed.data.passingScore,
        timeLimit: parsed.data.timeLimit || null,
      },
    });
    await audit({
      actorId: session.user!.id,
      action: "quiz.create",
      resource: "Quiz",
      resourceId: quiz.id,
      metadata: {
        lessonId: parsed.data.lessonId,
        passingScore: parsed.data.passingScore,
      },
    });

    return { success: true, quizId: quiz.id };
  } catch (error) {
    console.error("createQuiz error:", error);
    return { success: false, error: "Failed to create quiz" };
  }
}

export async function updateQuiz(data: {
  quizId: string;
  title: string;
  passingScore: number;
  timeLimit?: number;
}) {
  try {
    const session = await requireAdmin();
    const parsed = updateQuizSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await db.quiz.update({
      where: { id: parsed.data.quizId },
      data: {
        title: parsed.data.title,
        passingScore: parsed.data.passingScore,
        timeLimit: parsed.data.timeLimit || null,
      },
    });
    await audit({
      actorId: session.user!.id,
      action: "quiz.update",
      resource: "Quiz",
      resourceId: parsed.data.quizId,
      metadata: { passingScore: parsed.data.passingScore },
    });

    return { success: true };
  } catch (error) {
    console.error("updateQuiz error:", error);
    return { success: false, error: "Failed to update quiz" };
  }
}

export async function deleteQuiz(quizId: string) {
  try {
    const session = await requireAdmin();
    const parsed = deleteQuizSchema.safeParse({ quizId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await db.quiz.delete({ where: { id: parsed.data.quizId } });
    await audit({
      actorId: session.user!.id,
      action: "quiz.delete",
      resource: "Quiz",
      resourceId: parsed.data.quizId,
    });
    return { success: true };
  } catch (error) {
    console.error("deleteQuiz error:", error);
    return { success: false, error: "Failed to delete quiz" };
  }
}

// ── Question CRUD ───────────────────────────────────────────────────────

export async function createQuestion(data: {
  quizId: string;
  text: string;
  textAr?: string;
  textDe?: string;
  type: string;
  points: number;
  order: number;
  explanation?: string;
  answers: { text: string; textAr?: string; textDe?: string; isCorrect: boolean }[];
}) {
  try {
    const session = await requireAdmin();
    const parsed = createQuestionSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const question = await db.question.create({
      data: {
        quizId: parsed.data.quizId,
        text: parsed.data.text,
        textAr: parsed.data.textAr || null,
        textDe: parsed.data.textDe || null,
        type: parsed.data.type as never,
        points: parsed.data.points,
        order: parsed.data.order,
        explanation: parsed.data.explanation || null,
        answers: {
          create: parsed.data.answers.map((a, i) => ({
            text: a.text,
            textAr: a.textAr || null,
            textDe: a.textDe || null,
            isCorrect: a.isCorrect,
            order: i,
          })),
        },
      },
      select: { id: true },
    });
    await audit({
      actorId: session.user!.id,
      action: "question.create",
      resource: "Question",
      resourceId: question.id,
      metadata: {
        quizId: parsed.data.quizId,
        type: parsed.data.type,
        answerCount: parsed.data.answers.length,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("createQuestion error:", error);
    return { success: false, error: "Failed to create question" };
  }
}

export async function updateQuestion(data: {
  questionId: string;
  text: string;
  textAr?: string;
  textDe?: string;
  type: string;
  points: number;
  order?: number;
  explanation?: string;
  answers: { id?: string; text: string; textAr?: string; textDe?: string; isCorrect: boolean }[];
}) {
  try {
    const session = await requireAdmin();
    const parsed = updateQuestionSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await db.$transaction(async (tx) => {
      // Update the question
      await tx.question.update({
        where: { id: parsed.data.questionId },
        data: {
          text: parsed.data.text,
          textAr: parsed.data.textAr || null,
          textDe: parsed.data.textDe || null,
          type: parsed.data.type as never,
          points: parsed.data.points,
          ...(parsed.data.order !== undefined && { order: parsed.data.order }),
          explanation: parsed.data.explanation || null,
        },
      });

      // Delete all existing answers and recreate
      await tx.answer.deleteMany({ where: { questionId: parsed.data.questionId } });
      await tx.answer.createMany({
        data: parsed.data.answers.map((a, i) => ({
          questionId: parsed.data.questionId,
          text: a.text,
          textAr: a.textAr || null,
          textDe: a.textDe || null,
          isCorrect: a.isCorrect,
          order: i,
        })),
      });
    });
    await audit({
      actorId: session.user!.id,
      action: "question.update",
      resource: "Question",
      resourceId: parsed.data.questionId,
      metadata: { type: parsed.data.type, answerCount: parsed.data.answers.length },
    });

    return { success: true };
  } catch (error) {
    console.error("updateQuestion error:", error);
    return { success: false, error: "Failed to update question" };
  }
}

export async function deleteQuestion(questionId: string) {
  try {
    const session = await requireAdmin();
    const parsed = deleteQuestionSchema.safeParse({ questionId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await db.question.delete({ where: { id: parsed.data.questionId } });
    await audit({
      actorId: session.user!.id,
      action: "question.delete",
      resource: "Question",
      resourceId: parsed.data.questionId,
    });
    return { success: true };
  } catch (error) {
    console.error("deleteQuestion error:", error);
    return { success: false, error: "Failed to delete question" };
  }
}

// ── Queries ─────────────────────────────────────────────────────────────

export async function getQuizForLesson(lessonId: string) {
  try {
    await requireAdmin();
    return await db.quiz.findUnique({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: { answers: { orderBy: { order: "asc" } } },
        },
        _count: { select: { attempts: true } },
      },
    });
  } catch {
    return null;
  }
}
