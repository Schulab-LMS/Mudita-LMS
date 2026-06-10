import { describe, it, expect, vi, beforeEach } from "vitest";

// Enforcement-level test for the minor parental-consent gate. The unit tests in
// src/lib/compliance.test.ts prove assertMinorConsent() returns the right verdict;
// THIS file proves the enrollInCourse server action actually refuses to enrol a
// minor who lacks consent (and lets an adult / consented minor through). That is the
// real launch criterion (CSF #3): a minor provably cannot enrol without consent.
//
// We exercise the REAL assertMinorConsent (not mocked) against mocked db rows so the
// gate wiring itself is under test, not a stub.

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: vi.fn() },
    course: { findUnique: vi.fn() },
    consentRecord: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/auth-helpers", () => ({
  // Email is verified — we want the flow to reach the consent gate, not stop early.
  assertEmailVerified: vi.fn().mockResolvedValue({ ok: true }),
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/tenant", () => ({
  // No tenant mismatch.
  assertSameTenant: vi.fn().mockReturnValue(null),
}));

vi.mock("@/services/enrollment.service", () => ({
  enrollUser: vi.fn().mockResolvedValue({ id: "enr1" }),
  unenroll: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendEnrollmentConfirmation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { enrollUser } from "@/services/enrollment.service";
import { enrollInCourse } from "./enrollment.actions";

const studentSession = {
  user: { id: "student1", role: "STUDENT", name: "Aisha", email: "aisha@x.test" },
};

// A free, published, global course — so access turns purely on the consent gate
// (free courses skip the subscription check).
const freeCourse = {
  title: "Intro to Shapes",
  slug: "intro-to-shapes",
  status: "PUBLISHED",
  isFree: true,
  price: 0,
  requiredPlan: null,
  organizationId: null,
};

function minorDob(): Date {
  // ~10 years old — comfortably under the default threshold of 16.
  const d = new Date();
  d.setFullYear(d.getFullYear() - 10);
  return d;
}

function adultDob(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 30);
  return d;
}

beforeEach(() => {
  vi.clearAllMocks();
  (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(studentSession);
  // course.findUnique → the free course; user.findUnique is called twice:
  //   1. tenant lookup (role/organizationId)
  //   2. inside assertMinorConsent (dateOfBirth)
  (db.course.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(freeCourse);
});

describe("enrollInCourse — minor parental-consent enforcement", () => {
  it("BLOCKS a minor with no parental consent record", async () => {
    (db.user.findUnique as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ role: "STUDENT", organizationId: null }) // tenant
      .mockResolvedValueOnce({ dateOfBirth: minorDob() }); // assertMinorConsent
    (db.consentRecord.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await enrollInCourse("course1");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/parental consent/i);
    expect(enrollUser).not.toHaveBeenCalled();
  });

  it("BLOCKS a minor whose latest consent record is a withdrawal", async () => {
    (db.user.findUnique as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ role: "STUDENT", organizationId: null })
      .mockResolvedValueOnce({ dateOfBirth: minorDob() });
    (db.consentRecord.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      granted: false,
    });

    const result = await enrollInCourse("course1");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/withdrawn/i);
    expect(enrollUser).not.toHaveBeenCalled();
  });

  it("BLOCKS a user with no date of birth on record (age undeclared)", async () => {
    (db.user.findUnique as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ role: "STUDENT", organizationId: null })
      .mockResolvedValueOnce({ dateOfBirth: null });

    const result = await enrollInCourse("course1");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/date of birth/i);
    expect(enrollUser).not.toHaveBeenCalled();
  });

  it("ALLOWS a minor WITH a granted parental consent record", async () => {
    (db.user.findUnique as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ role: "STUDENT", organizationId: null })
      .mockResolvedValueOnce({ dateOfBirth: minorDob() });
    (db.consentRecord.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      granted: true,
    });

    const result = await enrollInCourse("course1");

    expect(result.success).toBe(true);
    expect(enrollUser).toHaveBeenCalledWith("student1", "course1");
  });

  it("ALLOWS an adult (no consent record needed)", async () => {
    (db.user.findUnique as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ role: "STUDENT", organizationId: null })
      .mockResolvedValueOnce({ dateOfBirth: adultDob() });

    const result = await enrollInCourse("course1");

    expect(result.success).toBe(true);
    expect(enrollUser).toHaveBeenCalledWith("student1", "course1");
    // An adult must never trigger a consent-record lookup.
    expect(db.consentRecord.findFirst).not.toHaveBeenCalled();
  });
});
