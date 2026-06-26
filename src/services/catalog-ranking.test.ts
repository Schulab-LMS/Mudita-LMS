import { describe, it, expect } from "vitest";
import {
  hasUsableSignals,
  rankCourses,
  scoreCourse,
  type RankableCourse,
  type RankingSignals,
} from "./catalog-ranking.service";

// Pure-function tests. No DB, no fetch, no clock manipulation needed.

const NOW = new Date("2026-04-21T00:00:00Z");
const OLD = new Date("2025-01-01T00:00:00Z");

function course(partial: Partial<RankableCourse>): RankableCourse {
  return {
    id: "c",
    category: "SCIENCE",
    tags: [],
    level: "BEGINNER",
    ageGroup: "AGES_8_10",
    averageRating: 0,
    reviewCount: 0,
    enrollmentCount: 0,
    createdAt: OLD,
    ...partial,
  };
}

describe("hasUsableSignals", () => {
  it("returns false for empty signals", () => {
    expect(hasUsableSignals({})).toBe(false);
    expect(
      hasUsableSignals({
        preferredSubjects: [],
        goals: [],
        interests: [],
        experience: null,
        ageYears: null,
      })
    ).toBe(false);
  });

  it("returns true if any signal is present", () => {
    expect(hasUsableSignals({ preferredSubjects: ["Math"] })).toBe(true);
    expect(hasUsableSignals({ goals: ["Have fun"] })).toBe(true);
    expect(hasUsableSignals({ experience: "Beginner" })).toBe(true);
    expect(hasUsableSignals({ ageYears: 10 })).toBe(true);
  });
});

describe("scoreCourse — subject matching", () => {
  it("matches via category synonym (Coding ↔ PROGRAMMING)", () => {
    const c = course({ category: "PROGRAMMING" });
    const { breakdown } = scoreCourse(c, { preferredSubjects: ["Coding"] });
    expect(breakdown.subject).toBeGreaterThan(0);
  });

  it("matches via tags when category doesn't", () => {
    const c = course({ category: "SCIENCE", tags: ["math", "fractions"] });
    const { breakdown } = scoreCourse(c, { preferredSubjects: ["Math"] });
    expect(breakdown.subject).toBeGreaterThan(0);
  });

  it("matches case-insensitively across snake_case and spaces", () => {
    const c = course({ category: "DATA_SCIENCE" });
    const { breakdown } = scoreCourse(c, {
      preferredSubjects: ["Data Science"],
    });
    expect(breakdown.subject).toBeGreaterThan(0);
  });

  it("caps multi-subject matches so tag stuffing doesn't dominate", () => {
    const c = course({ tags: ["math", "coding", "robotics", "ai", "science"] });
    const single = scoreCourse(c, { preferredSubjects: ["Math"] });
    const five = scoreCourse(c, {
      preferredSubjects: ["Math", "Coding", "Robotics", "AI", "Science"],
    });
    // Five matches contributes only 2× the single-match score (cap = 2).
    expect(five.breakdown.subject).toBe(single.breakdown.subject! * 2);
  });

  it("no subject signal → no subject contribution", () => {
    const c = course({ category: "MATH" });
    const { breakdown } = scoreCourse(c, {});
    expect(breakdown.subject).toBeUndefined();
  });
});

describe("scoreCourse — age fit", () => {
  it("exact age-group match scores higher than adjacent", () => {
    const c = course({ ageGroup: "AGES_8_10" });
    const exact = scoreCourse(c, { ageYears: 9 }); // AGES_8_10 → dist 0
    const adjacent = scoreCourse(c, { ageYears: 12 }); // AGES_11_13 → dist 1
    expect(exact.breakdown.age).toBeGreaterThan(adjacent.breakdown.age!);
  });

  it("two buckets away scores zero on age (still visible, just lower)", () => {
    const c = course({ ageGroup: "AGES_3_5" });
    const { breakdown } = scoreCourse(c, { ageYears: 17 });
    expect(breakdown.age).toBeUndefined();
  });

  it("no age provided → no age contribution (anonymous safety)", () => {
    const c = course({ ageGroup: "AGES_3_5" });
    const { breakdown } = scoreCourse(c, {});
    expect(breakdown.age).toBeUndefined();
  });
});

describe("scoreCourse — level fit from experience", () => {
  it("Beginner → BEGINNER course gets exact bonus", () => {
    const c = course({ level: "BEGINNER" });
    const { breakdown } = scoreCourse(c, { experience: "Beginner" });
    expect(breakdown.level).toBeGreaterThan(0);
  });

  it("'Some experience' maps to INTERMEDIATE", () => {
    const c = course({ level: "INTERMEDIATE" });
    const exact = scoreCourse(c, { experience: "Some experience" });
    const adjacent = scoreCourse(course({ level: "BEGINNER" }), {
      experience: "Some experience",
    });
    expect(exact.breakdown.level).toBeGreaterThan(adjacent.breakdown.level!);
  });

  it("unknown experience string contributes nothing", () => {
    const c = course({ level: "BEGINNER" });
    const { breakdown } = scoreCourse(c, { experience: "wizard" });
    expect(breakdown.level).toBeUndefined();
  });
});

describe("scoreCourse — popularity, rating, freshness", () => {
  it("higher rating and enrollment count score higher", () => {
    const a = course({ averageRating: 5, enrollmentCount: 1000 });
    const b = course({ averageRating: 1, enrollmentCount: 1 });
    expect(scoreCourse(a, {}).total).toBeGreaterThan(scoreCourse(b, {}).total);
  });

  it("recent courses get a small freshness bonus", () => {
    const recent = course({ createdAt: new Date(NOW.getTime() - 24 * 3600_000) });
    const old = course({ createdAt: OLD });
    // Inject NOW so the freshness window is measured against a fixed clock,
    // not the wall clock — otherwise the test decays as real time passes.
    expect(scoreCourse(recent, {}, NOW.getTime()).breakdown.freshness).toBeDefined();
    expect(scoreCourse(old, {}, NOW.getTime()).breakdown.freshness).toBeUndefined();
  });

  it("Decimal-style averageRating (toString) is honoured", () => {
    const c = course({
      averageRating: { toString: () => "4.5" } as never,
    });
    expect(scoreCourse(c, {}).breakdown.rating).toBeCloseTo(4.5);
  });
});

describe("rankCourses — sorting + stability", () => {
  it("sorts by score descending", () => {
    const a = course({ id: "a", category: "MATH" });
    const b = course({ id: "b", category: "SCIENCE" });
    const c = course({ id: "c", category: "CODING" });
    const ranked = rankCourses([a, b, c], { preferredSubjects: ["Coding"] });
    expect(ranked[0].id).toBe("c");
  });

  it("is stable on score ties (preserves original order)", () => {
    const a = course({ id: "a", category: "X" });
    const b = course({ id: "b", category: "Y" });
    const ranked = rankCourses([a, b], {});
    expect(ranked.map((r) => r.id)).toEqual(["a", "b"]);
  });

  it("does not mutate the input array", () => {
    const list: RankableCourse[] = [
      course({ id: "a" }),
      course({ id: "b" }),
    ];
    const before = list.map((c) => c.id);
    rankCourses(list, { preferredSubjects: ["Math"] });
    expect(list.map((c) => c.id)).toEqual(before);
  });

  it("personalised order beats the default for a strong signal", () => {
    // A new STEM-keen learner. Without ranking, the popular Science course
    // tops the list. With ranking, the Coding course they care about wins.
    const popular = course({
      id: "popular-science",
      category: "SCIENCE",
      enrollmentCount: 500,
      averageRating: 4.8,
    });
    const niche = course({
      id: "niche-coding",
      category: "CODING",
      enrollmentCount: 5,
      averageRating: 4.2,
    });
    const signals: RankingSignals = {
      preferredSubjects: ["Coding"],
      experience: "Beginner",
    };
    const ranked = rankCourses([popular, niche], signals);
    expect(ranked[0].id).toBe("niche-coding");
  });

  it("attaches score + breakdown to each row", () => {
    const ranked = rankCourses(
      [course({ category: "CODING" })],
      { preferredSubjects: ["Coding"] }
    );
    expect(ranked[0].score).toBeGreaterThan(0);
    expect(ranked[0].scoreBreakdown.subject).toBeGreaterThan(0);
  });
});
