import { db } from "@/lib/db";
import {
  hasUsableSignals,
  rankCourses,
  type RankingSignals,
} from "@/services/catalog-ranking.service";
import {
  isPlatformAdmin,
  tenantScope,
  type TenantPrincipal,
} from "@/lib/tenant";

function isViewerPlatformAdmin(v: TenantPrincipal | null | undefined): boolean {
  return Boolean(v && isPlatformAdmin(v.role));
}

interface CourseFilters {
  ageGroup?: string;
  category?: string;
  level?: string;
  search?: string;
  // When provided, courses are sorted by personalised score before fallback
  // popularity. Caller is responsible for hydrating signals from the user's
  // OnboardingProfile + dateOfBirth.
  signals?: RankingSignals;
  // Tenant context. When supplied, the catalog is restricted to global
  // courses (organizationId IS NULL) plus the viewer's own org. Anonymous /
  // un-tenanted browsing sees global courses only. Platform admins see all.
  viewer?: TenantPrincipal | null;
  // Restricts to courses citing the reference source with this `key`.
  sourceKey?: string;
  // Upper bound on the course `duration` field, expressed in MINUTES. Course
  // durations are stored in SECONDS (mirrors Lesson.duration; the detail page
  // divides by 60 to display minutes), so the filter converts to seconds.
  // Courses with a null duration are excluded when this filter is set.
  maxDuration?: number;
  // Certificate guarantee filter. SchuLab issues a completion certificate for
  // every PUBLISHED course (see the "certificate included" guarantee on the
  // course detail page), so when ON we simply keep the PUBLISHED restriction
  // that already applies — there is no separate per-course certificate flag.
  certificate?: boolean;
}

export function getLocalizedField<
  T extends Record<string, unknown>,
>(entity: T, field: string, locale: string): string {
  if (locale === "ar" && entity[`${field}Ar`]) {
    return entity[`${field}Ar`] as string;
  }
  if (locale === "de" && entity[`${field}De`]) {
    return entity[`${field}De`] as string;
  }
  return (entity[field] as string) ?? "";
}

export async function getCourses(filters: CourseFilters = {}) {
  try {
    const where: Record<string, unknown> = {
      status: "PUBLISHED",
      // Hide courses whose Git content source was removed. `status` is the
      // platform-owned visibility flag; `syncStatus` is the sync-owned
      // content-health flag (mirrors the module/lesson filter below). A course
      // with no live content source never appears in the catalog, yet the sync
      // never has to touch the admin's published `status` to achieve that.
      syncStatus: "ACTIVE",
    };

    if (filters.ageGroup) {
      where.ageGroup = filters.ageGroup;
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.level) {
      where.level = filters.level;
    }
    if (filters.sourceKey) {
      where.referenceSources = { some: { source: { key: filters.sourceKey } } };
    }
    if (typeof filters.maxDuration === "number") {
      // Convert the minute-based bucket to seconds (Course.duration is in
      // seconds). A null duration can't satisfy `<=` so Prisma excludes it,
      // which is the desired behaviour when the filter is set.
      where.duration = { lte: filters.maxDuration * 60 };
    }
    // certificate === true needs no extra clause: every PUBLISHED course (the
    // default status filter above) carries a completion certificate.
    // Tenant scope + search both want OR clauses on the same row; AND them
    // together so neither widens past what the other allows.
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

    const courses = await db.course.findMany({
      where,
      include: {
        modules: {
          // Exclude Git-removed modules and count only active lessons so the
          // catalog lesson-count badge matches the course page (see
          // getCourseBySlug for why these rows linger as soft-archived).
          where: { syncStatus: "ACTIVE" },
          include: {
            _count: {
              select: { lessons: { where: { syncStatus: "ACTIVE" } } },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      // Default order — overridden by personalised ranking when signals are
      // present. Most popular first, ties broken by recency.
      orderBy: [
        { enrollments: { _count: "desc" } },
        { createdAt: "desc" },
      ],
    });

    const hydrated = courses.map((course) => {
      const lessonCount = course.modules.reduce(
        (sum, mod) => sum + mod._count.lessons,
        0
      );
      return {
        ...course,
        lessonCount,
        enrollmentCount: course._count.enrollments,
      };
    });

    if (filters.signals && hasUsableSignals(filters.signals)) {
      // rankCourses returns the same row shape with `score` /
      // `scoreBreakdown` appended. Strip those before returning so the
      // public API doesn't leak ranking details to the client.
      const ranked = rankCourses(hydrated, filters.signals);
      return ranked.map(({ score, scoreBreakdown, ...rest }) => {
        void score;
        void scoreBreakdown;
        return rest;
      });
    }

    return hydrated;
  } catch {
    return [];
  }
}

export async function getCourseBySlug(
  slug: string,
  viewer?: TenantPrincipal | null
) {
  try {
    const course = await db.course.findUnique({
      where: { slug },
      include: {
        modules: {
          // Git-removed modules/lessons are soft-archived (syncStatus REMOVED),
          // not deleted, so enrollment/progress FKs survive. Exclude them here so
          // the course detail + learn-page sidebar reflect the current repo 1:1
          // mapping. Mirrors the filter in session.service.ts. Note: removing a
          // whole module leaves its lessons ACTIVE (the sync's per-module lesson
          // sweep skips absent modules), so the module-level filter is required.
          where: { syncStatus: "ACTIVE" },
          orderBy: { order: "asc" },
          include: {
            lessons: {
              where: { syncStatus: "ACTIVE" },
              orderBy: { order: "asc" },
              // Tutor-only fields must never reach student/public pages — omit
              // them by construction so they're not serialized to the client.
              omit: { tutorNotes: true, tutorNotesAr: true, tutorNotesDe: true },
              include: {
                quiz: {
                  select: {
                    id: true,
                    title: true,
                    passingScore: true,
                    timeLimit: true,
                    _count: { select: { questions: true } },
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
        // "Next recommended course" pointer — minimal projection for the card.
        nextCourse: {
          select: {
            id: true,
            slug: true,
            title: true,
            titleAr: true,
            titleDe: true,
            thumbnail: true,
            category: true,
          },
        },
        // Credited external reference sources, ordered for badge display.
        referenceSources: {
          orderBy: { order: "asc" },
          include: { source: true },
        },
        // Bundle / pathway membership for the "In bundle" / "Part of pathway"
        // badges on the detail page.
        bundleLinks: {
          include: { bundle: { select: { slug: true, title: true, status: true } } },
        },
        pathwayStages: {
          include: { pathway: { select: { slug: true, title: true, status: true } } },
        },
      },
    });

    if (!course) return null;

    // Soft-fail with null for out-of-tenant courses so the route handler
    // surfaces a 404 (rather than 403) — we don't want to leak the existence
    // of another org's content via a different error code.
    if (viewer !== undefined) {
      const principalOrg =
        viewer && !isViewerPlatformAdmin(viewer) ? viewer.organizationId ?? null : null;
      if (
        viewer &&
        !isViewerPlatformAdmin(viewer) &&
        course.organizationId !== null &&
        course.organizationId !== principalOrg
      ) {
        return null;
      }
    }

    const lessonCount = course.modules.reduce(
      (sum, mod) => sum + mod.lessons.length,
      0
    );

    const totalDuration = course.modules.reduce(
      (sum, mod) =>
        sum +
        mod.lessons.reduce((lSum, lesson) => lSum + (lesson.duration ?? 0), 0),
      0
    );

    return {
      ...course,
      lessonCount,
      totalDuration,
      enrollmentCount: course._count.enrollments,
    };
  } catch {
    return null;
  }
}

export async function getFeaturedCourses(
  limit: number = 6,
  viewer?: TenantPrincipal | null
) {
  try {
    const courses = await db.course.findMany({
      // syncStatus ACTIVE: exclude courses whose Git content source was removed
      // (see getCourses) without the sync ever changing platform-owned `status`.
      where: { status: "PUBLISHED", syncStatus: "ACTIVE", ...tenantScope(viewer) },
      include: {
        modules: {
          // Exclude Git-removed modules and count only active lessons so the
          // catalog lesson-count badge matches the course page (see
          // getCourseBySlug for why these rows linger as soft-archived).
          where: { syncStatus: "ACTIVE" },
          include: {
            _count: {
              select: { lessons: { where: { syncStatus: "ACTIVE" } } },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: limit,
    });

    return courses.map((course) => {
      const lessonCount = course.modules.reduce(
        (sum, mod) => sum + mod._count.lessons,
        0
      );
      return {
        ...course,
        lessonCount,
        enrollmentCount: course._count.enrollments,
      };
    });
  } catch {
    return [];
  }
}
