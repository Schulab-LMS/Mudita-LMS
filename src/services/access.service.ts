import { db } from "@/lib/db";
import { hasActivePlanAtLeast } from "@/lib/subscription-access";

// Centralised access check for lesson content. Enforced by both the video
// playback endpoint and the SSR lesson page. Rules (first match wins):
// 1. Lessons flagged isFree (free-preview) are always viewable.
// 2. Admins and super-admins always have access.
// 3. Course authors can preview their own unpublished content.
// 4. Users with an ACTIVE Enrollment for the course are in.
// 5. Users with an active subscription whose tier satisfies the course's
//    requiredPlan are in (even if they have not yet been auto-enrolled).
// 6. Otherwise: not_enrolled.

export type LessonAccess = {
  allowed: boolean;
  reason:
    | "free_preview"
    | "admin"
    | "author"
    | "enrolled"
    | "subscription"
    | "not_authenticated"
    | "not_enrolled"
    | "lesson_not_found";
};

export async function checkLessonAccess(params: {
  lessonId: string;
  userId?: string | null;
  role?: string | null;
}): Promise<LessonAccess> {
  const lesson = await db.lesson.findUnique({
    where: { id: params.lessonId },
    select: {
      id: true,
      isFree: true,
      module: {
        select: {
          course: {
            select: { id: true, createdById: true, requiredPlan: true },
          },
        },
      },
    },
  });
  if (!lesson) return { allowed: false, reason: "lesson_not_found" };

  if (lesson.isFree) return { allowed: true, reason: "free_preview" };

  if (!params.userId) return { allowed: false, reason: "not_authenticated" };

  if (params.role === "ADMIN" || params.role === "SUPER_ADMIN") {
    return { allowed: true, reason: "admin" };
  }

  const courseId = lesson.module.course.id;
  if (lesson.module.course.createdById === params.userId) {
    return { allowed: true, reason: "author" };
  }

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: params.userId, courseId } },
    select: { status: true },
  });
  if (enrollment && enrollment.status === "ACTIVE") {
    return { allowed: true, reason: "enrolled" };
  }

  const requiredPlan = lesson.module.course.requiredPlan;
  if (requiredPlan) {
    const ok = await hasActivePlanAtLeast(params.userId, requiredPlan);
    if (ok) return { allowed: true, reason: "subscription" };
  }

  return { allowed: false, reason: "not_enrolled" };
}
