import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: vi.fn() },
    profile: { findUnique: vi.fn() },
    enrollment: { findMany: vi.fn() },
    bundle: { findMany: vi.fn() },
    competition: { findMany: vi.fn() },
  },
}));

import { db } from "@/lib/db";
import { getEligibleEventsForUser } from "./event.service";

// DOB helper → a learner whose age (in whole years) is exactly `years`.
function dobForAge(years: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

// One external event gated to ages 8–16 with a course rec (c1) and a bundle rec (b1).
const EVENT = {
  id: "ev1",
  slug: "first-lego-league",
  title: "FIRST LEGO League",
  officialProvider: "FIRST",
  ageMin: 8,
  ageMax: 16,
  preparationPath: { slug: "stem-builder" },
  courseRecommendations: [
    { courseId: "c1", recommendationType: "RECOMMENDED", reason: "course reason", course: { slug: "c1", title: "Course 1" } },
  ],
  bundleRecommendations: [
    { bundleId: "b1", recommendationType: "RECOMMENDED", reason: "bundle reason", bundle: { slug: "b1", title: "Bundle 1" } },
  ],
};

// Bundle b1 needs both c1 and c2 (required) to count as complete.
const BUNDLES = [{ id: "b1", courses: [{ courseId: "c1", isRequired: true }, { courseId: "c2", isRequired: true }] }];

beforeEach(() => {
  vi.mocked(db.user.findUnique).mockReset();
  vi.mocked(db.profile.findUnique).mockReset();
  vi.mocked(db.enrollment.findMany).mockReset();
  vi.mocked(db.bundle.findMany).mockReset();
  vi.mocked(db.competition.findMany).mockReset();

  vi.mocked(db.profile.findUnique).mockResolvedValue({ dateOfBirth: null } as never);
  vi.mocked(db.bundle.findMany).mockResolvedValue(BUNDLES as never);
  vi.mocked(db.competition.findMany).mockResolvedValue([EVENT] as never);
});

describe("getEligibleEventsForUser", () => {
  it("marks an event READY when a recommendation is satisfied and age fits", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ dateOfBirth: dobForAge(12) } as never);
    // c1 + c2 completed → bundle b1 complete AND course c1 complete.
    vi.mocked(db.enrollment.findMany).mockResolvedValue([{ courseId: "c1" }, { courseId: "c2" }] as never);

    const res = await getEligibleEventsForUser("u1");

    expect(res.ready).toHaveLength(1);
    expect(res.almostReady).toHaveLength(0);
    expect(res.ready[0].event.slug).toBe("first-lego-league");
    // Both the course rec and the bundle rec are satisfied.
    expect(res.ready[0].satisfied).toHaveLength(2);
    expect(res.ready[0].missing).toHaveLength(0);
  });

  it("marks an event ALMOST-READY when nothing is completed", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ dateOfBirth: dobForAge(12) } as never);
    vi.mocked(db.enrollment.findMany).mockResolvedValue([] as never);

    const res = await getEligibleEventsForUser("u1");

    expect(res.ready).toHaveLength(0);
    expect(res.almostReady).toHaveLength(1);
    expect(res.almostReady[0].missing).toHaveLength(2);
  });

  it("requires ALL required bundle courses before counting the bundle complete", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ dateOfBirth: dobForAge(12) } as never);
    // Only c1 completed → course rec satisfied, but bundle b1 NOT complete.
    vi.mocked(db.enrollment.findMany).mockResolvedValue([{ courseId: "c1" }] as never);

    const res = await getEligibleEventsForUser("u1");

    expect(res.ready).toHaveLength(1);
    const r = res.ready[0];
    expect(r.satisfied.map((s) => s.kind)).toEqual(["course"]);
    expect(r.missing.map((s) => s.kind)).toEqual(["bundle"]);
  });

  it("does not mark READY when age is out of range, even with a satisfied rec", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ dateOfBirth: dobForAge(20) } as never);
    vi.mocked(db.enrollment.findMany).mockResolvedValue([{ courseId: "c1" }, { courseId: "c2" }] as never);

    const res = await getEligibleEventsForUser("u1");

    expect(res.ready).toHaveLength(0);
    expect(res.almostReady).toHaveLength(1);
    expect(res.almostReady[0].ageOk).toBe(false);
  });

  it("skips the age gate when no DOB is on record (ageKnown false)", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ dateOfBirth: null } as never);
    vi.mocked(db.enrollment.findMany).mockResolvedValue([{ courseId: "c1" }, { courseId: "c2" }] as never);

    const res = await getEligibleEventsForUser("u1");

    expect(res.ageKnown).toBe(false);
    expect(res.ready).toHaveLength(1);
  });
});
