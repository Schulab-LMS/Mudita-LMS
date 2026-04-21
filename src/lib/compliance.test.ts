import { describe, it, expect, vi } from "vitest";

vi.mock("./db", () => ({
  db: {
    user: { findUnique: vi.fn() },
    consentRecord: { findFirst: vi.fn() },
  },
}));

import { db } from "./db";
import {
  ageInYears,
  isMinor,
  CHILD_AGE_THRESHOLD,
  assertMinorConsent,
} from "./compliance";

describe("ageInYears", () => {
  it("returns exact age on birthday", () => {
    const dob = new Date("2010-06-15");
    const now = new Date("2020-06-15");
    expect(ageInYears(dob, now)).toBe(10);
  });

  it("subtracts a year if birthday has not occurred yet this year", () => {
    const dob = new Date("2010-06-15");
    const now = new Date("2020-06-14");
    expect(ageInYears(dob, now)).toBe(9);
  });

  it("counts birthday-day-or-later as the full year", () => {
    const dob = new Date("2010-06-15");
    const now = new Date("2020-06-16");
    expect(ageInYears(dob, now)).toBe(10);
  });

  it("handles month-boundary correctly", () => {
    const dob = new Date("2010-12-31");
    const now = new Date("2020-01-01");
    expect(ageInYears(dob, now)).toBe(9);
  });
});

describe("isMinor", () => {
  it("flags ages below threshold as minors", () => {
    const dob = new Date(`${new Date().getUTCFullYear() - 10}-01-01`);
    expect(isMinor(dob)).toBe(true);
  });

  it("does not flag adults above threshold as minors", () => {
    const dob = new Date(
      `${new Date().getUTCFullYear() - (CHILD_AGE_THRESHOLD + 5)}-01-01`
    );
    expect(isMinor(dob)).toBe(false);
  });

  it("boundary: exactly the threshold age is NOT a minor", () => {
    // Simulate a user who turns CHILD_AGE_THRESHOLD today.
    const now = new Date("2020-06-15");
    const dob = new Date(`${2020 - CHILD_AGE_THRESHOLD}-06-15`);
    expect(isMinor(dob, now)).toBe(false);
  });
});

describe("assertMinorConsent", () => {
  const findUser = vi.mocked(db.user.findUnique);
  const findConsent = vi.mocked(db.consentRecord.findFirst);

  it("passes when the user is not a minor", async () => {
    findUser.mockResolvedValue({
      dateOfBirth: new Date(
        `${new Date().getUTCFullYear() - (CHILD_AGE_THRESHOLD + 5)}-01-01`
      ),
    } as never);
    await expect(assertMinorConsent("u1")).resolves.toEqual({ ok: true });
  });

  it("blocks when the user has no dateOfBirth on record (age undeclared)", async () => {
    findUser.mockResolvedValue({ dateOfBirth: null } as never);
    await expect(assertMinorConsent("u1")).resolves.toEqual({
      ok: false,
      reason: "dob_missing",
    });
  });

  it("blocks a minor with no consent record", async () => {
    findUser.mockResolvedValue({
      dateOfBirth: new Date(`${new Date().getUTCFullYear() - 8}-01-01`),
    } as never);
    findConsent.mockResolvedValue(null);
    await expect(assertMinorConsent("u1")).resolves.toEqual({
      ok: false,
      reason: "consent_missing",
    });
  });

  it("blocks a minor whose latest record is a withdrawal", async () => {
    findUser.mockResolvedValue({
      dateOfBirth: new Date(`${new Date().getUTCFullYear() - 8}-01-01`),
    } as never);
    findConsent.mockResolvedValue({ granted: false } as never);
    await expect(assertMinorConsent("u1")).resolves.toEqual({
      ok: false,
      reason: "consent_withdrawn",
    });
  });

  it("passes a minor with a granted consent record", async () => {
    findUser.mockResolvedValue({
      dateOfBirth: new Date(`${new Date().getUTCFullYear() - 8}-01-01`),
    } as never);
    findConsent.mockResolvedValue({ granted: true } as never);
    await expect(assertMinorConsent("u1")).resolves.toEqual({ ok: true });
  });
});
