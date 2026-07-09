import { describe, it, expect, vi, beforeEach } from "vitest";

// checkLessonAccess and the assertMinorConsent it calls both hit the DB; mock it.
vi.mock("@/lib/db", () => ({
  db: {
    lesson: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    consentRecord: { findFirst: vi.fn() },
    enrollment: { findUnique: vi.fn() },
  },
}));

import { db } from "@/lib/db";
import { checkLessonAccess } from "@/services/access.service";

const nonFreeLesson = {
  id: "les1",
  isFree: false,
  module: { course: { id: "crs1", createdById: "author1", requiredPlan: null } },
};
const freeLesson = { ...nonFreeLesson, isFree: true };

// Relative to CHILD_AGE_THRESHOLD (default 16): clearly-adult vs clearly-minor.
const adultDob = new Date("1990-01-01");
const minorDob = new Date("2015-01-01");

beforeEach(() => {
  vi.mocked(db.lesson.findUnique).mockReset();
  vi.mocked(db.user.findUnique).mockReset();
  vi.mocked(db.consentRecord.findFirst).mockReset();
  vi.mocked(db.enrollment.findUnique).mockReset();
});

describe("checkLessonAccess — parental-consent gate (P2-B)", () => {
  it("free previews are viewable with no consent lookup", async () => {
    vi.mocked(db.lesson.findUnique).mockResolvedValue(freeLesson as never);
    const r = await checkLessonAccess({ lessonId: "les1", userId: "stu1", role: "STUDENT" });
    expect(r).toEqual({ allowed: true, reason: "free_preview" });
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });

  it("admins bypass the consent check", async () => {
    vi.mocked(db.lesson.findUnique).mockResolvedValue(nonFreeLesson as never);
    const r = await checkLessonAccess({ lessonId: "les1", userId: "adm1", role: "ADMIN" });
    expect(r.allowed).toBe(true);
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });

  it("BLOCKS a minor without parental consent from non-free content", async () => {
    vi.mocked(db.lesson.findUnique).mockResolvedValue(nonFreeLesson as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ dateOfBirth: minorDob } as never);
    vi.mocked(db.consentRecord.findFirst).mockResolvedValue(null); // no consent on file
    const r = await checkLessonAccess({ lessonId: "les1", userId: "kid1", role: "STUDENT" });
    expect(r).toEqual({ allowed: false, reason: "consent_required" });
    // Denied before any entitlement lookup.
    expect(db.enrollment.findUnique).not.toHaveBeenCalled();
  });

  it("an adult passes consent, then is allowed via active enrolment", async () => {
    vi.mocked(db.lesson.findUnique).mockResolvedValue(nonFreeLesson as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ dateOfBirth: adultDob } as never);
    vi.mocked(db.enrollment.findUnique).mockResolvedValue({ status: "ACTIVE" } as never);
    const r = await checkLessonAccess({ lessonId: "les1", userId: "stu1", role: "STUDENT" });
    expect(r).toEqual({ allowed: true, reason: "enrolled" });
  });

  it("a minor WITH active parental consent is allowed", async () => {
    vi.mocked(db.lesson.findUnique).mockResolvedValue(nonFreeLesson as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ dateOfBirth: minorDob } as never);
    vi.mocked(db.consentRecord.findFirst).mockResolvedValue({ granted: true } as never);
    vi.mocked(db.enrollment.findUnique).mockResolvedValue({ status: "ACTIVE" } as never);
    const r = await checkLessonAccess({ lessonId: "les1", userId: "kid1", role: "STUDENT" });
    expect(r).toEqual({ allowed: true, reason: "enrolled" });
  });
});
