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
            // Exclude soft-archived (REMOVED) modules/lessons left by
            // curriculum folder renames so dashboard counts stay correct.
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
