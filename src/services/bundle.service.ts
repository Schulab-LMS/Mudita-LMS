import { db } from "@/lib/db";
import { getLocalizedField } from "@/services/course.service";
import {
  isPlatformAdmin,
  tenantScope,
  type TenantPrincipal,
} from "@/lib/tenant";

// Bundle reads mirror course.service.ts: tenant-scoped, soft-fail to []/null,
// localized via the shared getLocalizedField helper. Progress is DERIVED from
// existing Enrollment rows — there is no BundleEnrollment table in v1.

function isViewerPlatformAdmin(v: TenantPrincipal | null | undefined): boolean {
  return Boolean(v && isPlatformAdmin(v.role));
}

interface BundleFilters {
  ageGroup?: string;
  themeCategory?: string;
  level?: string;
  search?: string;
  viewer?: TenantPrincipal | null;
}

// learningObjectives is stored as JSON shaped { en: [], ar: [], de: [] }.
// Falls back to the English list when a locale has no authored objectives.
export function getLocalizedList(
  value: unknown,
  locale: string
): string[] {
  if (!value || typeof value !== "object") return [];
  const map = value as Record<string, unknown>;
  const pick = (k: string) => (Array.isArray(map[k]) ? (map[k] as string[]) : []);
  const localized = pick(locale);
  return localized.length > 0 ? localized : pick("en");
}

export async function getBundles(filters: BundleFilters = {}) {
  try {
    const where: Record<string, unknown> = { status: "PUBLISHED" };
    if (filters.ageGroup) where.ageGroup = filters.ageGroup;
    if (filters.themeCategory) where.themeCategory = filters.themeCategory;
    if (filters.level) where.level = filters.level;

    const andClauses: Array<Record<string, unknown>> = [];
    const scope = tenantScope(filters.viewer);
    if ("OR" in scope) andClauses.push(scope as Record<string, unknown>);
    if (filters.search) {
      andClauses.push({
        OR: [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ],
      });
    }
    if (andClauses.length > 0) where.AND = andClauses;

    const bundles = await db.bundle.findMany({
      where,
      include: { _count: { select: { courses: true } } },
      orderBy: [{ ageGroup: "asc" }, { createdAt: "desc" }],
    });

    return bundles.map((bundle) => ({
      ...bundle,
      courseCount: bundle._count.courses,
    }));
  } catch {
    return [];
  }
}

export async function getBundleBySlug(
  slug: string,
  viewer?: TenantPrincipal | null
) {
  try {
    const bundle = await db.bundle.findUnique({
      where: { slug },
      include: {
        courses: {
          orderBy: { order: "asc" },
          include: {
            course: {
              include: {
                modules: { include: { _count: { select: { lessons: true } } } },
                _count: { select: { enrollments: true } },
              },
            },
          },
        },
      },
    });

    if (!bundle) return null;

    // Soft-fail with null for out-of-tenant bundles → route surfaces a 404.
    if (viewer !== undefined) {
      const principalOrg =
        viewer && !isViewerPlatformAdmin(viewer) ? viewer.organizationId ?? null : null;
      if (
        viewer &&
        !isViewerPlatformAdmin(viewer) &&
        bundle.organizationId !== null &&
        bundle.organizationId !== principalOrg
      ) {
        return null;
      }
    }

    const courses = bundle.courses.map((link) => {
      const lessonCount = link.course.modules.reduce(
        (sum, mod) => sum + mod._count.lessons,
        0
      );
      return {
        ...link.course,
        lessonCount,
        enrollmentCount: link.course._count.enrollments,
        order: link.order,
        isRequired: link.isRequired,
      };
    });

    return { ...bundle, courses };
  } catch {
    return null;
  }
}

export async function getFeaturedBundles(
  limit: number = 6,
  viewer?: TenantPrincipal | null
) {
  try {
    const bundles = await db.bundle.findMany({
      where: { status: "PUBLISHED", ...tenantScope(viewer) },
      include: { _count: { select: { courses: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return bundles.map((bundle) => ({
      ...bundle,
      courseCount: bundle._count.courses,
    }));
  } catch {
    return [];
  }
}

export interface BundleProgress {
  overallPercent: number;
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
}

// Derive bundle progress from the learner's per-course Enrollment rows.
// `overallPercent` averages each course's progress (un-enrolled counts as 0).
// `isComplete` requires every REQUIRED course to be COMPLETED; optional
// courses contribute to the percent but don't gate completion.
export async function getBundleProgress(
  userId: string,
  bundle: { courses: { id: string; isRequired: boolean }[] }
): Promise<BundleProgress> {
  const totalCount = bundle.courses.length;
  const empty: BundleProgress = {
    overallPercent: 0,
    completedCount: 0,
    totalCount,
    isComplete: false,
  };
  if (totalCount === 0) return empty;

  try {
    const courseIds = bundle.courses.map((c) => c.id);
    const enrollments = await db.enrollment.findMany({
      where: { userId, courseId: { in: courseIds } },
      select: { courseId: true, progress: true, status: true },
    });
    const byCourse = new Map(enrollments.map((e) => [e.courseId, e]));

    let progressSum = 0;
    let completedCount = 0;
    let requiredTotal = 0;
    let requiredDone = 0;
    for (const c of bundle.courses) {
      const enr = byCourse.get(c.id);
      progressSum += enr?.progress ?? 0;
      const done = enr?.status === "COMPLETED";
      if (done) completedCount += 1;
      if (c.isRequired) {
        requiredTotal += 1;
        if (done) requiredDone += 1;
      }
    }

    // Gate completion on the required courses; if a bundle marks every course
    // optional, fall back to "all courses completed" so it can still finish.
    const isComplete =
      requiredTotal > 0
        ? requiredDone === requiredTotal
        : completedCount === totalCount;

    return {
      overallPercent: Math.round(progressSum / totalCount),
      completedCount,
      totalCount,
      isComplete,
    };
  } catch {
    return empty;
  }
}

// PUBLISHED bundles that contain `courseId` and whose required courses are now
// all COMPLETED for this user. Called after a course completes to decide which
// bundle certificates to issue. (An all-optional bundle is gated on all its
// courses, mirroring getBundleProgress.)
export async function getNewlyCompletedBundleIds(
  userId: string,
  courseId: string
): Promise<string[]> {
  try {
    const links = await db.bundleCourse.findMany({
      where: { courseId, bundle: { status: "PUBLISHED" } },
      select: { bundleId: true },
    });
    const bundleIds = [...new Set(links.map((l) => l.bundleId))];

    const done: string[] = [];
    for (const bundleId of bundleIds) {
      const courses = await db.bundleCourse.findMany({
        where: { bundleId },
        select: { courseId: true, isRequired: true },
      });
      const required = courses.filter((c) => c.isRequired);
      const gate = required.length > 0 ? required : courses;
      if (gate.length === 0) continue;

      const completed = await db.enrollment.count({
        where: {
          userId,
          status: "COMPLETED",
          courseId: { in: gate.map((c) => c.courseId) },
        },
      });
      if (completed === gate.length) done.push(bundleId);
    }
    return done;
  } catch {
    return [];
  }
}

export { getLocalizedField };
