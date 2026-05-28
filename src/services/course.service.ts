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
          include: {
            _count: {
              select: { lessons: true },
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
          orderBy: { order: "asc" },
          include: {
            lessons: {
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
      where: { status: "PUBLISHED", ...tenantScope(viewer) },
      include: {
        modules: {
          include: {
            _count: {
              select: { lessons: true },
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
