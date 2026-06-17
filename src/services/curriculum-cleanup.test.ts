import { describe, it, expect, vi } from "vitest";
import { reapRemovedCurriculum } from "@/services/curriculum-cleanup.service";
import type { PrismaClient } from "@/generated/prisma/client";

// Exercises the destructive reap path with an in-memory Prisma stub. The
// contract under test: a dead (REMOVED, or under a REMOVED module) row is
// hard-deleted ONLY when it carries no learner data; everything else is
// preserved. Getting this wrong destroys student progress, so the safety
// branches are pinned here.

type DeadLesson = { id: string; title: string; moduleId: string };
type RefKind = "progress" | "attempts" | "submissions" | "notes" | "questions" | "bookings";

function makeDb(opts: {
  deadLessons: DeadLesson[];
  removedModules: { id: string }[];
  refs?: Record<string, Partial<Record<RefKind, number>>>;
}) {
  const refs = opts.refs ?? {};
  const deletedLessons: string[] = [];
  const deletedModules: string[] = [];

  // Resolve the lessonId from either a direct {lessonId} filter or the
  // QuizAttempt {quiz:{lessonId}} relation filter, then return its ref count.
  const countFor = (kind: RefKind) =>
    vi.fn(async ({ where }: { where: { lessonId?: string; quiz?: { lessonId?: string } } }) => {
      const lessonId = where.lessonId ?? where.quiz?.lessonId ?? "";
      return refs[lessonId]?.[kind] ?? 0;
    });

  const db = {
    course: { findMany: vi.fn(async () => [{ id: "c1" }]) },
    lesson: {
      findMany: vi.fn(async () => opts.deadLessons),
      delete: vi.fn(async ({ where }: { where: { id: string } }) => {
        deletedLessons.push(where.id);
      }),
    },
    module: {
      findMany: vi.fn(async () => opts.removedModules),
      delete: vi.fn(async ({ where }: { where: { id: string } }) => {
        deletedModules.push(where.id);
      }),
    },
    lessonProgress: { count: countFor("progress") },
    quizAttempt: { count: countFor("attempts") },
    activitySubmission: { count: countFor("submissions") },
    lessonNote: { count: countFor("notes") },
    lessonQuestion: { count: countFor("questions") },
    booking: { count: countFor("bookings") },
  };

  return { db: db as unknown as PrismaClient, deletedLessons, deletedModules };
}

describe("reapRemovedCurriculum", () => {
  it("deletes a dead lesson and its empty REMOVED module when there are no refs", async () => {
    const { db, deletedLessons, deletedModules } = makeDb({
      deadLessons: [{ id: "l1", title: "Old Scratch Basics", moduleId: "m1" }],
      removedModules: [{ id: "m1" }],
    });

    const report = await reapRemovedCurriculum(db);

    expect(deletedLessons).toEqual(["l1"]);
    expect(deletedModules).toEqual(["m1"]);
    expect(report.lessonsDeleted).toBe(1);
    expect(report.modulesDeleted).toBe(1);
    expect(report.lessonsKept).toBe(0);
  });

  it("preserves a lesson with learner progress and keeps its module", async () => {
    const { db, deletedLessons, deletedModules } = makeDb({
      deadLessons: [{ id: "l1", title: "Touched Lesson", moduleId: "m1" }],
      removedModules: [{ id: "m1" }],
      refs: { l1: { progress: 3 } },
    });

    const report = await reapRemovedCurriculum(db);

    expect(deletedLessons).toEqual([]);
    expect(deletedModules).toEqual([]); // module blocked by the kept lesson
    expect(report.lessonsKept).toBe(1);
    expect(report.modulesKept).toBe(1);
    expect(report.kept[0]).toMatchObject({ id: "l1", reason: expect.stringContaining("progress") });
  });

  it("treats quiz attempts (via the lesson's quiz) as a keep reason", async () => {
    const { db, deletedLessons } = makeDb({
      deadLessons: [{ id: "l1", title: "Quizzed", moduleId: "m1" }],
      removedModules: [],
      refs: { l1: { attempts: 1 } },
    });

    const report = await reapRemovedCurriculum(db);

    expect(deletedLessons).toEqual([]);
    expect(report.kept[0].reason).toContain("quiz attempt");
  });

  it("reaps an unreferenced lesson but keeps the module that also holds a referenced one", async () => {
    const { db, deletedLessons, deletedModules } = makeDb({
      deadLessons: [
        { id: "l1", title: "Clean", moduleId: "m1" },
        { id: "l2", title: "Has notes", moduleId: "m1" },
      ],
      removedModules: [{ id: "m1" }],
      refs: { l2: { notes: 2 } },
    });

    const report = await reapRemovedCurriculum(db);

    expect(deletedLessons).toEqual(["l1"]);
    expect(deletedModules).toEqual([]); // m1 still holds kept l2
    expect(report.lessonsDeleted).toBe(1);
    expect(report.lessonsKept).toBe(1);
    expect(report.modulesKept).toBe(1);
  });

  it("dry-run computes the report without issuing any deletes", async () => {
    const { db, deletedLessons, deletedModules } = makeDb({
      deadLessons: [{ id: "l1", title: "Clean", moduleId: "m1" }],
      removedModules: [{ id: "m1" }],
    });

    const report = await reapRemovedCurriculum(db, { dryRun: true });

    expect(deletedLessons).toEqual([]);
    expect(deletedModules).toEqual([]);
    expect(report.lessonsDeleted).toBe(1);
    expect(report.modulesDeleted).toBe(1);
  });
});
