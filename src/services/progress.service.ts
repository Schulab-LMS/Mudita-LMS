import { db } from "@/lib/db";
import { generateCertificate } from "./certificate.service";

export async function markLessonComplete(userId: string, lessonId: string) {
  try {
    const progress = await db.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        completed: true,
        lastAccess: new Date(),
      },
      create: {
        userId,
        lessonId,
        completed: true,
        lastAccess: new Date(),
      },
    });
    return progress;
  } catch (error) {
    console.error("Failed to mark lesson complete:", error);
    return null;
  }
}

export async function recalculateProgress(userId: string, courseId: string) {
  try {
    // Run the count and enrollment update in one transaction so concurrent
    // lesson completions can't both read a stale count and both mark the
    // course COMPLETED with the wrong percentage.
    const { progressPercent, becameComplete } = await db.$transaction(
      async (tx) => {
        const course = await tx.course.findUnique({
          where: { id: courseId },
          select: {
            // Count only the active set students actually see (matches
            // getCourseBySlug). Git-removed lessons are soft-archived, not
            // deleted; including them here would inflate the denominator so a
            // course with removed lessons could never reach 100% / certify.
            modules: {
              where: { syncStatus: "ACTIVE" },
              select: {
                lessons: { where: { syncStatus: "ACTIVE" }, select: { id: true } },
              },
            },
          },
        });
        if (!course) return { progressPercent: null, becameComplete: false };

        const allLessonIds = course.modules.flatMap((m) =>
          m.lessons.map((l) => l.id)
        );
        const totalLessons = allLessonIds.length;
        if (totalLessons === 0) {
          return { progressPercent: 0, becameComplete: false };
        }

        const completedCount = await tx.lessonProgress.count({
          where: {
            userId,
            lessonId: { in: allLessonIds },
            completed: true,
          },
        });
        const progressPercent = Math.round(
          (completedCount / totalLessons) * 100
        );

        const existing = await tx.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId } },
          select: { status: true },
        });
        const alreadyComplete = existing?.status === "COMPLETED";

        await tx.enrollment.update({
          where: { userId_courseId: { userId, courseId } },
          data: {
            progress: progressPercent,
            ...(progressPercent === 100
              ? { status: "COMPLETED", completedAt: new Date() }
              : {}),
          },
        });

        return {
          progressPercent,
          becameComplete: progressPercent === 100 && !alreadyComplete,
        };
      }
    );

    // Certificate generation is intentionally outside the transaction —
    // it's a best-effort side effect triggered exactly once on the
    // COMPLETE transition (generateCertificate is itself idempotent).
    if (becameComplete) {
      await generateCertificate(userId, courseId).catch(() => null);
    }

    return progressPercent;
  } catch (error) {
    console.error("Failed to recalculate progress:", error);
    return null;
  }
}

export async function getLessonProgress(userId: string, courseId: string) {
  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        // Active set only, so completed counts align with the visible sidebar
        // (getCourseBySlug) and the progress ring can't exceed 100% when a
        // completed lesson is later removed from Git.
        modules: {
          where: { syncStatus: "ACTIVE" },
          include: {
            lessons: { where: { syncStatus: "ACTIVE" } },
          },
        },
      },
    });

    if (!course) return [];

    const allLessonIds = course.modules.flatMap((m) =>
      m.lessons.map((l) => l.id)
    );

    const progress = await db.lessonProgress.findMany({
      where: {
        userId,
        lessonId: { in: allLessonIds },
      },
    });

    return progress;
  } catch (error) {
    console.error("Failed to get lesson progress:", error);
    return [];
  }
}
