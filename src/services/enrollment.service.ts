import { db } from "@/lib/db";

export async function enrollUser(userId: string, courseId: string) {
  try {
    // Check for existing enrollment first
    const existing = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return existing;

    const enrollment = await db.enrollment.create({
      data: {
        userId,
        courseId,
        status: "ACTIVE",
        progress: 0,
      },
    });
    return enrollment;
  } catch (error) {
    console.error("Failed to enroll user:", error);
    return null;
  }
}

export async function getEnrollment(userId: string, courseId: string) {
  try {
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
      include: {
        course: true,
      },
    });
    return enrollment;
  } catch (error) {
    console.error("Failed to get enrollment:", error);
    return null;
  }
}

export async function getUserEnrollments(userId: string) {
  try {
    const enrollments = await db.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            // Active set only. Git-removed modules/lessons are soft-archived
            // (syncStatus REMOVED), not deleted, so enrollment FKs survive —
            // but the dashboard "my courses" lesson counts must match the
            // course page (getCourseBySlug) and not tally hidden lessons.
            // Module-level filter is required: removing a whole module leaves
            // its lessons ACTIVE.
            modules: {
              where: { syncStatus: "ACTIVE" },
              include: {
                lessons: { where: { syncStatus: "ACTIVE" } },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });
    return enrollments;
  } catch (error) {
    console.error("Failed to get user enrollments:", error);
    return [];
  }
}

export async function unenroll(userId: string, courseId: string) {
  try {
    await db.enrollment.delete({
      where: {
        userId_courseId: { userId, courseId },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to unenroll user:", error);
    return { success: false, error: "Failed to unenroll" };
  }
}
