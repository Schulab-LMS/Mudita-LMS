import type { PrismaClient } from "@/generated/prisma/client";

// ── Curriculum orphan reaping ────────────────────────────────────────────
//
// The curriculum sync keys modules/lessons on their repo folder path
// (`sourcePath`). When a folder is renamed/restructured in the STEM-Curricula
// repo, the sync inserts the new path as a fresh row and SOFT-ARCHIVES the old
// one (syncStatus = "REMOVED") — it never deletes. Course readers hide REMOVED
// rows, but they'd otherwise pile up forever (and rendered as duplicates before
// the readers were taught to filter).
//
// This module hard-deletes those dead rows — but ONLY when they carry no
// learner data. Anything a student or tutor touched is preserved (left REMOVED,
// hidden by the readers). Deleting referenced rows would also fail at the DB
// level: LessonProgress→Lesson and QuizAttempt→Quiz use the default RESTRICT
// referential action, and ActivitySubmission / LessonNote / LessonQuestion
// cascade — so a naive delete would silently destroy learner data.
//
// Dependency-injected `db` (rather than importing @/lib/db) so the same logic
// runs both inside the Next app (curriculum sync) and from a plain `tsx`
// maintenance script, which does not resolve the `@/` path alias.

// The slice of PrismaClient this module touches. The app singleton and a
// script-owned PrismaClient both satisfy it.
type Db = Pick<
  PrismaClient,
  | "course"
  | "lesson"
  | "module"
  | "lessonProgress"
  | "quizAttempt"
  | "activitySubmission"
  | "lessonNote"
  | "lessonQuestion"
  | "booking"
>;

export interface ReapReport {
  scannedCourses: number;
  modulesDeleted: number;
  modulesKept: number;
  lessonsDeleted: number;
  lessonsKept: number;
  // Dead rows deliberately preserved because they still carry learner data.
  kept: { kind: "lesson"; id: string; title: string; reason: string }[];
}

// Returns a human-readable reason to KEEP a lesson (it carries learner data),
// or null when the lesson is safe to hard-delete.
async function lessonKeepReason(db: Db, lessonId: string): Promise<string | null> {
  const [progress, attempts, submissions, notes, questions, bookings] =
    await Promise.all([
      db.lessonProgress.count({ where: { lessonId } }),
      db.quizAttempt.count({ where: { quiz: { lessonId } } }),
      db.activitySubmission.count({ where: { lessonId } }),
      db.lessonNote.count({ where: { lessonId } }),
      db.lessonQuestion.count({ where: { lessonId } }),
      db.booking.count({ where: { lessonId } }),
    ]);
  if (progress) return `${progress} learner progress record(s)`;
  if (attempts) return `${attempts} quiz attempt(s)`;
  if (submissions) return `${submissions} activity submission(s)`;
  if (notes) return `${notes} private note(s)`;
  if (questions) return `${questions} Q&A thread(s)`;
  if (bookings) return `${bookings} linked booking(s)`;
  return null;
}

/**
 * Hard-delete soft-archived (REMOVED) curriculum modules/lessons that carry no
 * learner data, across all Git-managed courses. Dead = the row is REMOVED, or
 * its parent module is REMOVED (a renamed module strands its old lessons as
 * still-ACTIVE rows). Idempotent and safe to run repeatedly.
 *
 * Pass `{ dryRun: true }` to compute the report without deleting anything.
 */
export async function reapRemovedCurriculum(
  db: Db,
  opts: { dryRun?: boolean } = {}
): Promise<ReapReport> {
  const dryRun = opts.dryRun ?? false;
  const report: ReapReport = {
    scannedCourses: 0,
    modulesDeleted: 0,
    modulesKept: 0,
    lessonsDeleted: 0,
    lessonsKept: 0,
    kept: [],
  };

  const managed = await db.course.findMany({
    where: { managedByGit: true },
    select: { id: true },
  });
  report.scannedCourses = managed.length;
  if (managed.length === 0) return report;
  const courseIds = managed.map((c) => c.id);

  // Every dead lesson in a managed course.
  const deadLessons = await db.lesson.findMany({
    where: {
      module: { courseId: { in: courseIds } },
      OR: [{ syncStatus: "REMOVED" }, { module: { syncStatus: "REMOVED" } }],
    },
    select: { id: true, title: true, moduleId: true },
  });

  // Modules we must NOT delete because they still hold a referenced lesson.
  const blockedModuleIds = new Set<string>();

  for (const lesson of deadLessons) {
    const reason = await lessonKeepReason(db, lesson.id);
    if (reason) {
      report.lessonsKept += 1;
      report.kept.push({ kind: "lesson", id: lesson.id, title: lesson.title, reason });
      blockedModuleIds.add(lesson.moduleId);
      continue;
    }
    // Deleting a lesson cascades to its Quiz → Question → Answer (content only;
    // we verified there are no attempts above). Safe.
    if (!dryRun) await db.lesson.delete({ where: { id: lesson.id } });
    report.lessonsDeleted += 1;
  }

  // A REMOVED module is reapable once none of its (all-dead) lessons were kept —
  // i.e. it is, or has become, empty. Deleting it then removes only a stale
  // container.
  const removedModules = await db.module.findMany({
    where: { courseId: { in: courseIds }, syncStatus: "REMOVED" },
    select: { id: true },
  });
  for (const mod of removedModules) {
    if (blockedModuleIds.has(mod.id)) {
      report.modulesKept += 1;
      continue;
    }
    if (!dryRun) await db.module.delete({ where: { id: mod.id } });
    report.modulesDeleted += 1;
  }

  return report;
}
