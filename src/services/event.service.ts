import { db } from "@/lib/db";
import { ageInYears } from "@/lib/compliance";
import type { EventRecommendationType } from "@/generated/prisma/client";

// Events & Competitions = the curated catalog of reputable EXTERNAL STEM
// programs (FIRST LEGO League, WRO, Astro Pi…) stored on the Competition model
// with isExternal = true. This service powers the public /events tab, the admin
// CRUD reads, and the student-facing eligibility/recommendation engine.
//
// Fail-open: read helpers return [] / null on error so a transient DB issue
// never crashes a public page (mirrors competition.service.ts).

// Public reads only surface recommendations whose course is PUBLISHED — DRAFT
// "event-gap" courses (seeded without content yet) would otherwise render as
// dead links / unreachable prerequisites. Bundles are always seeded PUBLISHED.
const PUBLIC_EVENT_INCLUDE = {
  preparationPath: { select: { id: true, slug: true, title: true, ageGroup: true } },
  courseRecommendations: {
    where: { course: { status: "PUBLISHED" as const } },
    include: { course: { select: { id: true, slug: true, title: true, ageGroup: true, level: true } } },
  },
  bundleRecommendations: {
    where: { bundle: { status: "PUBLISHED" as const } },
    include: { bundle: { select: { id: true, slug: true, title: true, ageGroup: true, level: true } } },
  },
} as const;

// Admin reads surface ALL recommendations (incl. DRAFT-course links) so the
// recommendations manager reflects exactly what is mapped.
const ADMIN_EVENT_INCLUDE = {
  preparationPath: { select: { id: true, slug: true, title: true, ageGroup: true } },
  courseRecommendations: {
    include: { course: { select: { id: true, slug: true, title: true, ageGroup: true, level: true } } },
  },
  bundleRecommendations: {
    include: { bundle: { select: { id: true, slug: true, title: true, ageGroup: true, level: true } } },
  },
} as const;

/** Public list of external events, newest-first by name, ARCHIVED hidden. */
export async function getEvents(filters?: { region?: string; includeArchived?: boolean }) {
  try {
    return await db.competition.findMany({
      where: {
        isExternal: true,
        ...(filters?.includeArchived ? {} : { listingStatus: { not: "ARCHIVED" } }),
        ...(filters?.region ? { region: filters.region as never } : {}),
      },
      include: PUBLIC_EVENT_INCLUDE,
      orderBy: [{ listingStatus: "asc" }, { title: "asc" }],
    });
  } catch {
    return [];
  }
}

/** All external events (incl. ARCHIVED) for the admin list. */
export async function getEventsForAdmin() {
  try {
    return await db.competition.findMany({
      where: { isExternal: true },
      include: {
        _count: { select: { courseRecommendations: true, bundleRecommendations: true } },
        preparationPath: { select: { slug: true, title: true } },
      },
      orderBy: [{ listingStatus: "asc" }, { title: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function getEventBySlug(slug: string) {
  try {
    return await db.competition.findFirst({
      where: { slug, isExternal: true },
      include: PUBLIC_EVENT_INCLUDE,
    });
  } catch {
    return null;
  }
}

export async function getEventById(id: string) {
  try {
    return await db.competition.findFirst({
      where: { id, isExternal: true },
      include: ADMIN_EVENT_INCLUDE,
    });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Eligibility engine
// ---------------------------------------------------------------------------

export interface EventReadiness {
  event: Awaited<ReturnType<typeof getEvents>>[number];
  /** Recommendations the student already satisfies (completed course/bundle). */
  satisfied: { kind: "course" | "bundle"; title: string; slug: string; type: EventRecommendationType; reason: string }[];
  /** Recommendations not yet met — what the student still needs. */
  missing: { kind: "course" | "bundle"; title: string; slug: string; type: EventRecommendationType; reason: string }[];
  /** Whether the student's age is within the event's [ageMin, ageMax]. */
  ageOk: boolean;
}

export interface EligibilityResult {
  /** Age was derivable (DOB on record). When false, age gates are skipped. */
  ageKnown: boolean;
  age: number | null;
  /** Events the student is ready to prepare for now. */
  ready: EventReadiness[];
  /** Events matched by age/track but missing prerequisite courses/bundles. */
  almostReady: EventReadiness[];
}

/** A bundle counts as completed when every REQUIRED course in it is completed. */
function bundleIsComplete(
  bundleCourses: { courseId: string; isRequired: boolean }[],
  completedCourseIds: Set<string>
): boolean {
  const required = bundleCourses.filter((bc) => bc.isRequired);
  if (required.length === 0) return false;
  return required.every((bc) => completedCourseIds.has(bc.courseId));
}

/**
 * Core engine: given a user, figure out which external events they are ready to
 * prepare for (≥1 satisfied recommendation + age ok) vs almost-ready (matched
 * but missing prerequisites). Used by the dashboard widget and completion card.
 */
export async function getEligibleEventsForUser(userId: string): Promise<EligibilityResult> {
  try {
    const [user, profile, completedEnrollments, bundles, events] = await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { dateOfBirth: true } }),
      db.profile.findUnique({ where: { userId }, select: { dateOfBirth: true } }),
      db.enrollment.findMany({
        where: { userId, OR: [{ completedAt: { not: null } }, { progress: { gte: 100 } }] },
        select: { courseId: true },
      }),
      db.bundle.findMany({ select: { id: true, courses: { select: { courseId: true, isRequired: true } } } }),
      getEvents(),
    ]);

    const dob = user?.dateOfBirth ?? profile?.dateOfBirth ?? null;
    const age = dob ? ageInYears(dob) : null;
    const ageKnown = age !== null;

    const completedCourseIds = new Set(completedEnrollments.map((e) => e.courseId));
    const completedBundleIds = new Set(
      bundles.filter((b) => bundleIsComplete(b.courses, completedCourseIds)).map((b) => b.id)
    );

    const ready: EventReadiness[] = [];
    const almostReady: EventReadiness[] = [];

    for (const event of events) {
      const ageOk =
        !ageKnown ||
        ((event.ageMin == null || age! >= event.ageMin) && (event.ageMax == null || age! <= event.ageMax));

      const satisfied: EventReadiness["satisfied"] = [];
      const missing: EventReadiness["missing"] = [];

      for (const rec of event.courseRecommendations) {
        const entry = {
          kind: "course" as const,
          title: rec.course.title,
          slug: rec.course.slug,
          type: rec.recommendationType,
          reason: rec.reason,
        };
        (completedCourseIds.has(rec.courseId) ? satisfied : missing).push(entry);
      }
      for (const rec of event.bundleRecommendations) {
        const entry = {
          kind: "bundle" as const,
          title: rec.bundle.title,
          slug: rec.bundle.slug,
          type: rec.recommendationType,
          reason: rec.reason,
        };
        (completedBundleIds.has(rec.bundleId) ? satisfied : missing).push(entry);
      }

      // No recommendations at all → not surfaced to the student.
      if (satisfied.length === 0 && missing.length === 0) continue;

      const readiness: EventReadiness = { event, satisfied, missing, ageOk };
      if (satisfied.length > 0 && ageOk) ready.push(readiness);
      else almostReady.push(readiness);
    }

    return { ageKnown, age, ready, almostReady };
  } catch {
    return { ageKnown: false, age: null, ready: [], almostReady: [] };
  }
}

/** Events a single course helps prepare for — used on the course completion card. */
export async function getEventRecommendationsForCourse(courseId: string) {
  try {
    const recs = await db.eventCourseRecommendation.findMany({
      where: { courseId, competition: { isExternal: true, listingStatus: { not: "ARCHIVED" } } },
      include: {
        competition: {
          select: { id: true, slug: true, title: true, officialProvider: true, eventType: true, thumbnail: true },
        },
      },
      orderBy: { recommendationType: "asc" },
    });
    return recs;
  } catch {
    return [];
  }
}

/** Events a single bundle helps prepare for — used on the bundle completion card. */
export async function getEventRecommendationsForBundle(bundleId: string) {
  try {
    const recs = await db.eventBundleRecommendation.findMany({
      where: { bundleId, competition: { isExternal: true, listingStatus: { not: "ARCHIVED" } } },
      include: {
        competition: {
          select: { id: true, slug: true, title: true, officialProvider: true, eventType: true, thumbnail: true },
        },
      },
      orderBy: { recommendationType: "asc" },
    });
    return recs;
  } catch {
    return [];
  }
}
