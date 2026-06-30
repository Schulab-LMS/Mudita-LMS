import { describe, it, expect } from "vitest";
import {
  scoreLessonHealth,
  DEFAULT_HEALTH_THRESHOLDS,
  type LessonHealthMetrics,
} from "./content-health.service";

function metrics(over: Partial<LessonHealthMetrics> = {}): LessonHealthMetrics {
  return {
    lessonId: "l1",
    lessonTitle: "Lesson",
    courseId: "c1",
    courseTitle: "Course",
    learnersStarted: 100,
    learnersCompleted: 90,
    completionRate: 0.9,
    quizAttempts: 100,
    quizPassRate: 0.9,
    questionCount: 2,
    ...over,
  };
}

describe("scoreLessonHealth", () => {
  it("a healthy lesson is not weak", () => {
    const v = scoreLessonHealth(metrics());
    expect(v.weak).toBe(false);
    expect(v.reasons).toEqual([]);
    expect(v.severity).toBe(0);
  });

  it("flags a low quiz pass rate", () => {
    const v = scoreLessonHealth(metrics({ quizPassRate: 0.3 }));
    expect(v.weak).toBe(true);
    expect(v.reasons.some((r) => r.includes("quiz pass rate"))).toBe(true);
  });

  it("flags low completion (drop-off)", () => {
    const v = scoreLessonHealth(metrics({ completionRate: 0.2, learnersCompleted: 20 }));
    expect(v.reasons.some((r) => r.includes("completion"))).toBe(true);
  });

  it("flags high question volume per completion", () => {
    const v = scoreLessonHealth(metrics({ questionCount: 80, learnersCompleted: 90 }));
    expect(v.reasons.some((r) => r.includes("question volume"))).toBe(true);
  });

  it("stacks reasons and severity for a very weak lesson", () => {
    const v = scoreLessonHealth(
      metrics({
        quizPassRate: 0.2,
        completionRate: 0.3,
        learnersCompleted: 30,
        questionCount: 60,
      })
    );
    expect(v.severity).toBe(3);
    expect(v.reasons).toHaveLength(3);
  });

  it("never flags below the minimum sample size (noise guard)", () => {
    // Terrible ratios but only 2 learners — too little data to judge.
    const v = scoreLessonHealth(
      metrics({
        learnersStarted: 2,
        learnersCompleted: 0,
        completionRate: 0,
        quizAttempts: 2,
        quizPassRate: 0,
        questionCount: 4,
      })
    );
    expect(v.weak).toBe(false);
  });

  it("ignores quiz signal when the lesson has no quiz (passRate null)", () => {
    const v = scoreLessonHealth(metrics({ quizPassRate: null, quizAttempts: 0 }));
    expect(v.reasons.some((r) => r.includes("quiz"))).toBe(false);
  });

  it("respects custom thresholds", () => {
    const strict = { ...DEFAULT_HEALTH_THRESHOLDS, minQuizPassRate: 0.95 };
    expect(scoreLessonHealth(metrics({ quizPassRate: 0.9 }), strict).weak).toBe(true);
    expect(scoreLessonHealth(metrics({ quizPassRate: 0.9 })).weak).toBe(false);
  });
});
