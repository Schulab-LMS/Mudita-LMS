import type { AgeGroup, CourseLevel } from "@/generated/prisma/client";

// Personalised catalog ordering. Pure scoring + sort: deterministic for a
// fixed (course list, signals) pair, easy to unit test, no I/O.
//
// Inputs the ranker can use:
//   - preferredSubjects   from OnboardingProfile         (e.g. "Math", "Coding")
//   - goals               from OnboardingProfile         (e.g. "Prepare for exams")
//   - interests           from OnboardingProfile         (free strings)
//   - experience          from OnboardingProfile         (Beginner / … / Advanced)
//   - ageYears            derived from User.dateOfBirth
//
// We never mutate the courses array; the ranked output is a new array.

export type RankingSignals = {
  preferredSubjects?: string[];
  goals?: string[];
  interests?: string[];
  experience?: string | null;
  ageYears?: number | null;
};

// The minimal course shape we score against — keeps the function decoupled
// from Prisma's full Course type so callers can pass projections.
export type RankableCourse = {
  id: string;
  category: string;
  tags: string[];
  level: CourseLevel;
  ageGroup: AgeGroup;
  averageRating: number | { toString(): string }; // Decimal | number
  reviewCount: number;
  enrollmentCount?: number;
  createdAt: Date;
};

export type ScoredCourse<T> = T & {
  score: number;
  scoreBreakdown: Record<string, number>;
};

// ── Constants ────────────────────────────────────────────────────────────

// Map onboarding subject options ↔ canonical seed categories. Kept separate
// from the comparison helper so adding a new option only touches one place.
const SUBJECT_ALIASES: Record<string, string[]> = {
  math: ["math", "mathematics"],
  coding: ["coding", "code", "programming", "software"],
  robotics: ["robotics", "robot"],
  science: ["science", "physics", "chemistry", "biology"],
  engineering: ["engineering", "engineer"],
  ai: ["ai", "artificial intelligence", "machine learning", "ml"],
  "art + design": ["art", "design", "creativity", "creative"],
  "data science": ["data science", "data", "analytics"],
  "digital literacy": ["digital literacy", "digital", "internet safety"],
};

const LEVEL_FROM_EXPERIENCE: Record<string, CourseLevel> = {
  beginner: "BEGINNER",
  "some experience": "INTERMEDIATE",
  intermediate: "INTERMEDIATE",
  advanced: "ADVANCED",
};

const AGE_GROUP_RANGES: Record<AgeGroup, [number, number]> = {
  AGES_3_5: [3, 5],
  AGES_6_8: [6, 8],
  AGES_9_12: [9, 12],
  AGES_13_15: [13, 15],
  AGES_16_18: [16, 18],
};

// ── Helpers ──────────────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[_\-]+/g, " ");
}

// Two strings "match" if either is contained in the other (after norm) OR
// if either appears in any alias group containing the other. The alias map
// resolves "Coding" ↔ "PROGRAMMING" without forcing the catalog admin to
// pick from a fixed enum.
function subjectsMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  for (const aliases of Object.values(SUBJECT_ALIASES)) {
    if (aliases.includes(na) && aliases.includes(nb)) return true;
  }
  return false;
}

function ageGroupForYears(years: number): AgeGroup | null {
  for (const [group, [lo, hi]] of Object.entries(AGE_GROUP_RANGES)) {
    if (years >= lo && years <= hi) return group as AgeGroup;
  }
  return null;
}

// Distance in "buckets" between two age groups so adjacent ranges still get
// some credit. Returns 0 for an exact match, 1 for next bucket, etc.
const AGE_GROUP_ORDER: AgeGroup[] = [
  "AGES_3_5",
  "AGES_6_8",
  "AGES_9_12",
  "AGES_13_15",
  "AGES_16_18",
];
function ageGroupDistance(a: AgeGroup, b: AgeGroup): number {
  return Math.abs(AGE_GROUP_ORDER.indexOf(a) - AGE_GROUP_ORDER.indexOf(b));
}

const LEVEL_ORDER: CourseLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
function levelDistance(a: CourseLevel, b: CourseLevel): number {
  return Math.abs(LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b));
}

function decimalToNumber(d: RankableCourse["averageRating"]): number {
  return typeof d === "number" ? d : Number(d.toString());
}

// ── Scoring ──────────────────────────────────────────────────────────────

// Weights are picked so a single subject match dominates a popularity tie,
// but a strong popularity signal still beats a weak interest match. Tuneable
// in one place. We surface a per-course breakdown for debugging / future A/B.
const W = {
  subjectMatch: 12,
  goalMatch: 4,
  interestMatch: 4,
  ageExact: 15,
  ageAdjacent: 6,
  levelExact: 8,
  levelAdjacent: 3,
  ratingPerStar: 1.0, // 5★ = +5
  popularityLog: 1.5, // log10(enrollments + 1) * 1.5
  freshnessRecent: 2, // bonus if created within last 30 days
} as const;

export function scoreCourse(
  course: RankableCourse,
  signals: RankingSignals,
  now: number = Date.now()
): { total: number; breakdown: Record<string, number> } {
  const b: Record<string, number> = {};

  // Subject match against category + tags. Cap at 2 to avoid spammy
  // tag-stuffing dominating the ordering.
  if (signals.preferredSubjects && signals.preferredSubjects.length > 0) {
    let matches = 0;
    for (const subject of signals.preferredSubjects) {
      const hit =
        subjectsMatch(course.category, subject) ||
        course.tags.some((t) => subjectsMatch(t, subject));
      if (hit) matches += 1;
    }
    if (matches > 0) b.subject = Math.min(matches, 2) * W.subjectMatch;
  }

  // Goals + interests are looser — match against tags only and cap at 1
  // each (they're heuristic signals, not category truth).
  if (signals.goals && signals.goals.length > 0) {
    const hit = signals.goals.some((g) =>
      course.tags.some((t) => subjectsMatch(t, g))
    );
    if (hit) b.goals = W.goalMatch;
  }
  if (signals.interests && signals.interests.length > 0) {
    const hit = signals.interests.some((i) =>
      course.tags.some((t) => subjectsMatch(t, i))
    );
    if (hit) b.interests = W.interestMatch;
  }

  // Age fit. We only penalise mismatch when we know the learner's age —
  // anonymous browsers shouldn't be filtered by age accidentally.
  if (signals.ageYears != null) {
    const learnerGroup = ageGroupForYears(signals.ageYears);
    if (learnerGroup) {
      const dist = ageGroupDistance(learnerGroup, course.ageGroup);
      if (dist === 0) b.age = W.ageExact;
      else if (dist === 1) b.age = W.ageAdjacent;
      // dist >= 2 → 0; deliberately no negative score so the course stays
      // visible, just lower in the list.
    }
  }

  // Level fit from experience.
  if (signals.experience) {
    const want = LEVEL_FROM_EXPERIENCE[normalize(signals.experience)];
    if (want) {
      const dist = levelDistance(want, course.level);
      if (dist === 0) b.level = W.levelExact;
      else if (dist === 1) b.level = W.levelAdjacent;
    }
  }

  // Universal popularity + quality tiebreakers.
  const rating = decimalToNumber(course.averageRating);
  if (rating > 0) b.rating = rating * W.ratingPerStar;
  const pop = course.enrollmentCount ?? 0;
  if (pop > 0) b.popularity = Math.log10(pop + 1) * W.popularityLog;

  const ageDays = (now - course.createdAt.getTime()) / (24 * 3600 * 1000);
  if (ageDays <= 30) b.freshness = W.freshnessRecent;

  const total = Object.values(b).reduce((sum, v) => sum + v, 0);
  return { total, breakdown: b };
}

// Rank a list of courses. Stable: identical scores keep their original
// order, so the popularity-desc default is preserved on ties.
export function rankCourses<T extends RankableCourse>(
  courses: T[],
  signals: RankingSignals,
  now: number = Date.now()
): ScoredCourse<T>[] {
  const indexed = courses.map((c, i) => {
    const s = scoreCourse(c, signals, now);
    return {
      ...c,
      score: s.total,
      scoreBreakdown: s.breakdown,
      __i: i,
    };
  });
  indexed.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.__i - b.__i;
  });
  return indexed.map(({ __i, ...rest }) => {
    void __i;
    return rest as ScoredCourse<T>;
  });
}

// True iff any signal will actually contribute to the score. Call sites use
// this to decide whether to bother personalising at all — when there's no
// onboarding data, the popularity-desc fallback is fine.
export function hasUsableSignals(signals: RankingSignals): boolean {
  return Boolean(
    (signals.preferredSubjects && signals.preferredSubjects.length > 0) ||
      (signals.goals && signals.goals.length > 0) ||
      (signals.interests && signals.interests.length > 0) ||
      signals.experience ||
      signals.ageYears != null
  );
}
