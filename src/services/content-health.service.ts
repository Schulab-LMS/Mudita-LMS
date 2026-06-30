// Content-health feedback loop (Task 8). Aggregates existing learner signals —
// lesson completion, quiz pass rate, and learner-question volume — into a
// per-lesson health score, and surfaces the weakest lessons. This is the input
// to the Improvement pass (docs/curriculum-production, step 14): the curriculum
// team (or, later, the agent pipeline) revisits flagged lessons.
//
// The scoring is a pure function (scoreLessonHealth) so it's unit-testable
// without a DB; the aggregation (listWeakLessons) runs cheap groupBy queries.

import { db } from "@/lib/db";

export interface LessonHealthMetrics {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  /** Distinct learners who started the lesson (LessonProgress rows). */
  learnersStarted: number;
  learnersCompleted: number;
  /** completed / started, in [0,1]; 0 when nobody started. */
  completionRate: number;
  quizAttempts: number;
  /** passed / attempts, in [0,1]; null when the lesson has no quiz attempts. */
  quizPassRate: number | null;
  /** LessonQuestion volume — a proxy for confusion. */
  questionCount: number;
}

export interface HealthThresholds {
  /** Ignore lessons with fewer signals than this (avoids noise on thin data). */
  minSampleSize: number;
  /** Quiz pass rate below this is "too hard / unclear". */
  minQuizPassRate: number;
  /** Completion below this signals drop-off. */
  minCompletionRate: number;
  /** Questions-per-completion above this signals a confusing lesson. */
  maxQuestionsPerCompletion: number;
}

export const DEFAULT_HEALTH_THRESHOLDS: HealthThresholds = {
  minSampleSize: 5,
  minQuizPassRate: 0.5,
  minCompletionRate: 0.5,
  maxQuestionsPerCompletion: 0.5,
};

export interface HealthVerdict {
  weak: boolean;
  reasons: string[];
  /** Number of failing signals — higher = more urgent. */
  severity: number;
}

/**
 * Score one lesson's health against thresholds. Pure. Each check is gated on a
 * minimum sample size so lessons with too little data are never flagged.
 */
export function scoreLessonHealth(
  m: LessonHealthMetrics,
  t: HealthThresholds = DEFAULT_HEALTH_THRESHOLDS
): HealthVerdict {
  const reasons: string[] = [];

  if (
    m.quizPassRate !== null &&
    m.quizAttempts >= t.minSampleSize &&
    m.quizPassRate < t.minQuizPassRate
  ) {
    reasons.push(`low quiz pass rate (${Math.round(m.quizPassRate * 100)}%)`);
  }

  if (m.learnersStarted >= t.minSampleSize && m.completionRate < t.minCompletionRate) {
    reasons.push(`low completion (${Math.round(m.completionRate * 100)}%)`);
  }

  if (
    m.learnersCompleted >= t.minSampleSize &&
    m.questionCount / m.learnersCompleted > t.maxQuestionsPerCompletion
  ) {
    reasons.push(`high question volume (${m.questionCount} for ${m.learnersCompleted} completions)`);
  }

  return { weak: reasons.length > 0, reasons, severity: reasons.length };
}

export interface WeakLesson extends LessonHealthMetrics {
  reasons: string[];
  severity: number;
}

/**
 * Aggregate learner signals and return lessons flagged weak, most-severe first.
 * Cheap groupBy queries joined in memory. Only lessons with at least one signal
 * (progress / quiz attempt / question) are considered.
 */
export async function listWeakLessons(
  thresholds: HealthThresholds = DEFAULT_HEALTH_THRESHOLDS
): Promise<WeakLesson[]> {
  const [progressAll, progressDone, questions, quizzes] = await Promise.all([
    db.lessonProgress.groupBy({ by: ["lessonId"], _count: { _all: true } }),
    db.lessonProgress.groupBy({
      by: ["lessonId"],
      where: { completed: true },
      _count: { _all: true },
    }),
    db.lessonQuestion.groupBy({ by: ["lessonId"], _count: { _all: true } }),
    db.quiz.findMany({ select: { id: true, lessonId: true } }),
  ]);

  const quizIds = quizzes.map((q) => q.id);
  const [attemptsAll, attemptsPassed] = await Promise.all([
    quizIds.length
      ? db.quizAttempt.groupBy({
          by: ["quizId"],
          where: { quizId: { in: quizIds } },
          _count: { _all: true },
        })
      : Promise.resolve([] as { quizId: string; _count: { _all: number } }[]),
    quizIds.length
      ? db.quizAttempt.groupBy({
          by: ["quizId"],
          where: { quizId: { in: quizIds }, passed: true },
          _count: { _all: true },
        })
      : Promise.resolve([] as { quizId: string; _count: { _all: number } }[]),
  ]);

  // Index signals by lessonId.
  const started = new Map(progressAll.map((r) => [r.lessonId, r._count._all]));
  const completed = new Map(progressDone.map((r) => [r.lessonId, r._count._all]));
  const questionCount = new Map(questions.map((r) => [r.lessonId, r._count._all]));
  const quizByLesson = new Map(quizzes.map((q) => [q.lessonId, q.id]));
  const attemptTotal = new Map(attemptsAll.map((r) => [r.quizId, r._count._all]));
  const attemptPass = new Map(attemptsPassed.map((r) => [r.quizId, r._count._all]));

  // The set of lessons that have any signal worth scoring.
  const lessonIds = new Set<string>([
    ...started.keys(),
    ...questionCount.keys(),
    ...quizByLesson.keys(),
  ]);
  if (lessonIds.size === 0) return [];

  const lessons = await db.lesson.findMany({
    where: { id: { in: Array.from(lessonIds) } },
    select: {
      id: true,
      title: true,
      module: { select: { course: { select: { id: true, title: true } } } },
    },
  });

  const weak: WeakLesson[] = [];
  for (const lesson of lessons) {
    const learnersStarted = started.get(lesson.id) ?? 0;
    const learnersCompleted = completed.get(lesson.id) ?? 0;
    const quizId = quizByLesson.get(lesson.id);
    const quizAttempts = quizId ? attemptTotal.get(quizId) ?? 0 : 0;
    const quizPassRate =
      quizId && quizAttempts > 0 ? (attemptPass.get(quizId) ?? 0) / quizAttempts : null;

    const metrics: LessonHealthMetrics = {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      courseId: lesson.module.course.id,
      courseTitle: lesson.module.course.title,
      learnersStarted,
      learnersCompleted,
      completionRate: learnersStarted > 0 ? learnersCompleted / learnersStarted : 0,
      quizAttempts,
      quizPassRate,
      questionCount: questionCount.get(lesson.id) ?? 0,
    };

    const verdict = scoreLessonHealth(metrics, thresholds);
    if (verdict.weak) {
      weak.push({ ...metrics, reasons: verdict.reasons, severity: verdict.severity });
    }
  }

  return weak.sort((a, b) => b.severity - a.severity);
}
