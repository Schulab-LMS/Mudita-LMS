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
      select: {
        id: true,
        userId: true,
        courseId: true,
        status: true,
        progress: true,
        enrolledAt: true,
        completedAt: true,
      },
      orderBy: { enrolledAt: "desc" },
    });

    // Hydrate courses independently. A single malformed legacy course should
    // never make every otherwise-valid enrollment disappear from the learner
    // and parent dashboards.
    const hydrated = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await getEnrollmentCourse(enrollment.courseId);
        return course ? { ...enrollment, course } : null;
      })
    );

    return hydrated.filter(
      (enrollment): enrollment is NonNullable<typeof enrollment> =>
        enrollment !== null
    );
  } catch (error) {
    console.error("Failed to get user enrollments:", error);
    return [];
  }
}

async function getEnrollmentCourse(courseId: string) {
  try {
    return await db.course.findUnique({
      where: { id: courseId },
      include: {
        // Active set only. Git-removed modules/lessons are soft-archived
        // (syncStatus REMOVED), not deleted, so enrollment FKs survive.
        modules: {
          where: { syncStatus: "ACTIVE" },
          include: {
            lessons: { where: { syncStatus: "ACTIVE" } },
          },
        },
      },
    });
  } catch (error) {
    console.error(
      `Failed to load curriculum for enrolled course ${courseId}; using course metadata only:`,
      error
    );

    // Preserve the enrollment card even if legacy curriculum data cannot be
    // decoded. The learner can still see the course and support can repair the
    // content instead of the UI falsely claiming there are no enrollments.
    const course = await db.course.findUnique({ where: { id: courseId } });
    return course ? { ...course, modules: [] } : null;
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
