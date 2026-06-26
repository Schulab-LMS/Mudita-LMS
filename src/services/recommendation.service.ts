import { db } from "@/lib/db";
import { resolveAgeGroup } from "@/lib/curriculum-structure";
import type { AgeGroup } from "@/generated/prisma/client";

// Dashboard "Recommended for you" reads. Mirrors bundle/pathway.service.ts:
// PUBLISHED-only, soft-fail to null/[]/ tolerant of users with no enrollments.
// Age band is derived from Profile.dateOfBirth when present, otherwise inferred
// from the learner's enrolled courses' ageGroup. All localization happens at the
// page layer via getLocalizedField — these helpers return raw rows.

function ageFromDateOfBirth(dob: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

// The PUBLISHED pathway for an age band (one pathway per band on the public
// site). Lowest `order` wins if more than one is somehow published.
export async function getRecommendedPathwayForAgeGroup(ageGroup: AgeGroup) {
  try {
    return await db.learningPathway.findFirst({
      where: { status: "PUBLISHED", ageGroup },
      orderBy: { order: "asc" },
    });
  } catch {
    return null;
  }
}

// The next PUBLISHED bundle for an age band that the learner has NOT yet
// completed (none of its required courses fully done). Bundles the learner has
// already started but not finished are preferred; otherwise the first unstarted
// one. `excludeCourseIds` lets callers avoid recommending a bundle whose work
// the learner has effectively wrapped up.
export async function getRecommendedBundleForAgeGroup(
  ageGroup: AgeGroup,
  userId?: string
) {
  try {
    const bundles = await db.bundle.findMany({
      where: { status: "PUBLISHED", ageGroup },
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { courses: true } },
        courses: { select: { courseId: true, isRequired: true } },
      },
    });
    if (bundles.length === 0) return null;
    if (!userId) return bundles[0];

    const allCourseIds = [
      ...new Set(bundles.flatMap((b) => b.courses.map((c) => c.courseId))),
    ];
    const enrollments =
      allCourseIds.length > 0
        ? await db.enrollment.findMany({
            where: { userId, courseId: { in: allCourseIds } },
            select: { courseId: true, status: true },
          })
        : [];
    const completed = new Set(
      enrollments.filter((e) => e.status === "COMPLETED").map((e) => e.courseId)
    );
    const enrolled = new Set(enrollments.map((e) => e.courseId));

    // A bundle is "done" when all its gate courses are completed.
    const isDone = (b: (typeof bundles)[number]) => {
      const required = b.courses.filter((c) => c.isRequired);
      const gate = required.length > 0 ? required : b.courses;
      return gate.length > 0 && gate.every((c) => completed.has(c.courseId));
    };
    const candidates = bundles.filter((b) => !isDone(b));
    if (candidates.length === 0) return null;

    // Prefer a bundle already in progress (some course enrolled), else first.
    const inProgress = candidates.find((b) =>
      b.courses.some((c) => enrolled.has(c.courseId))
    );
    return inProgress ?? candidates[0];
  } catch {
    return null;
  }
}

export interface UserRecommendation {
  ageGroup: AgeGroup | null;
  pathway: Awaited<ReturnType<typeof getRecommendedPathwayForAgeGroup>>;
  bundle: Awaited<ReturnType<typeof getRecommendedBundleForAgeGroup>>;
  nextCourse: {
    id: string;
    slug: string;
    title: string;
    titleAr: string | null;
    titleDe: string | null;
  } | null;
}

// Resolve a learner's age band: Profile.dateOfBirth first, then the modal
// ageGroup across their enrolled courses. Returns null when neither is known.
async function resolveUserAgeGroup(userId: string): Promise<AgeGroup | null> {
  try {
    const profile = await db.profile.findUnique({
      where: { userId },
      select: { dateOfBirth: true },
    });
    if (profile?.dateOfBirth) {
      return resolveAgeGroup(
        String(ageFromDateOfBirth(profile.dateOfBirth)),
        ""
      );
    }

    const enrollments = await db.enrollment.findMany({
      where: { userId },
      select: { course: { select: { ageGroup: true } } },
    });
    if (enrollments.length === 0) return null;

    const counts = new Map<AgeGroup, number>();
    for (const e of enrollments) {
      const g = e.course.ageGroup;
      counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    let best: AgeGroup | null = null;
    let bestCount = -1;
    for (const [g, c] of counts) {
      if (c > bestCount) {
        best = g;
        bestCount = c;
      }
    }
    return best;
  } catch {
    return null;
  }
}

// Top-level recommendation for a learner's dashboard: their age-band pathway,
// the next bundle to start, and the `nextCourse` pointer of their most-recent
// in-progress course. Tolerant of users with no enrollments / no profile.
export async function getRecommendedNextForUser(
  userId: string
): Promise<UserRecommendation> {
  const empty: UserRecommendation = {
    ageGroup: null,
    pathway: null,
    bundle: null,
    nextCourse: null,
  };
  try {
    const ageGroup = await resolveUserAgeGroup(userId);

    // Next course = the nextCourse pointer of the most-recently-enrolled
    // in-progress course (skips courses with no pointer or already enrolled).
    const recent = await db.enrollment.findFirst({
      where: { userId, status: { not: "COMPLETED" } },
      orderBy: { enrolledAt: "desc" },
      select: {
        course: {
          select: {
            nextCourse: {
              select: {
                id: true,
                slug: true,
                title: true,
                titleAr: true,
                titleDe: true,
                status: true,
              },
            },
          },
        },
      },
    });
    let nextCourse: UserRecommendation["nextCourse"] = null;
    const ptr = recent?.course.nextCourse;
    if (ptr && ptr.status === "PUBLISHED") {
      const already = await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: ptr.id } },
        select: { id: true },
      });
      if (!already) {
        nextCourse = {
          id: ptr.id,
          slug: ptr.slug,
          title: ptr.title,
          titleAr: ptr.titleAr,
          titleDe: ptr.titleDe,
        };
      }
    }

    if (!ageGroup) return { ...empty, nextCourse };

    const [pathway, bundle] = await Promise.all([
      getRecommendedPathwayForAgeGroup(ageGroup),
      getRecommendedBundleForAgeGroup(ageGroup, userId),
    ]);

    return { ageGroup, pathway, bundle, nextCourse };
  } catch {
    return empty;
  }
}

// Per-child recommendation for the parent dashboard. Reuses the user resolver
// so a child's band is derived from their own profile / enrollments.
export async function getRecommendedForChild(childId: string) {
  const rec = await getRecommendedNextForUser(childId);
  return { pathway: rec.pathway, bundle: rec.bundle, ageGroup: rec.ageGroup };
}
