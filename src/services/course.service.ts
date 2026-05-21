import { db } from "@/lib/db";
import {
  hasUsableSignals,
  rankCourses,
  type RankingSignals,
} from "@/services/catalog-ranking.service";

interface CourseFilters {
  ageGroup?: string;
  category?: string;
  level?: string;
  search?: string;
  // When provided, courses are sorted by personalised score before fallback
  // popularity. Caller is responsible for hydrating signals from the user's
  // OnboardingProfile + dateOfBirth.
  signals?: RankingSignals;
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
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

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

export async function getCourseBySlug(slug: string) {
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

export async function getFeaturedCourses(limit: number = 6) {
  try {
    const courses = await db.course.findMany({
      where: { status: "PUBLISHED" },
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
