import { db } from "@/lib/db";

export interface PrereqCourse {
  id: string;
  slug: string;
  title: string;
  titleAr: string | null;
  titleDe: string | null;
}

// Prerequisite courses the user has NOT yet completed, used to gate enrolment.
// Only PUBLISHED prerequisites are enforced — an archived/removed prerequisite
// the learner never finished must not permanently lock them out of the course.
export async function getUnmetPrerequisites(
  userId: string,
  courseId: string
): Promise<PrereqCourse[]> {
  try {
    const prereqs = await db.coursePrerequisite.findMany({
      where: { courseId, prerequisite: { status: "PUBLISHED" } },
      select: {
        prerequisiteId: true,
        prerequisite: {
          select: { id: true, slug: true, title: true, titleAr: true, titleDe: true },
        },
      },
    });
    if (prereqs.length === 0) return [];

    const prereqIds = prereqs.map((p) => p.prerequisiteId);
    const completed = await db.enrollment.findMany({
      where: { userId, status: "COMPLETED", courseId: { in: prereqIds } },
      select: { courseId: true },
    });
    const completedSet = new Set(completed.map((e) => e.courseId));

    return prereqs
      .filter((p) => !completedSet.has(p.prerequisiteId))
      .map((p) => p.prerequisite);
  } catch {
    // Fail open: never block enrolment because the prereq lookup errored.
    return [];
  }
}

// Which of the given course ids the user has COMPLETED — used to render
// met/unmet ticks in the course-page prerequisites list.
export async function getCompletedCourseIds(
  userId: string,
  courseIds: string[]
): Promise<Set<string>> {
  if (courseIds.length === 0) return new Set();
  try {
    const rows = await db.enrollment.findMany({
      where: { userId, status: "COMPLETED", courseId: { in: courseIds } },
      select: { courseId: true },
    });
    return new Set(rows.map((r) => r.courseId));
  } catch {
    return new Set();
  }
}
