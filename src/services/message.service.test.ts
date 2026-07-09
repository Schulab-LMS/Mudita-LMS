import { describe, it, expect } from "vitest";
import { canMessageRole } from "@/services/message.service";

// Pins the messaging safeguarding policy (the P0 fix). canMessageRole is a pure
// function over roles, so no DB is needed. If you change MESSAGEABLE_ROLES,
// update these expectations deliberately — they encode child-safety intent.
describe("canMessageRole — messaging safeguarding policy", () => {
  it("BLOCKS student → student (the P0: no learner can cold-DM another learner)", () => {
    expect(canMessageRole("STUDENT", "STUDENT")).toBe(false);
  });

  it("only vetted adult roles can reach a STUDENT", () => {
    // Allowed: the two vetted roles.
    expect(canMessageRole("TUTOR", "STUDENT")).toBe(true);
    expect(canMessageRole("ADMIN", "STUDENT")).toBe(true);
    expect(canMessageRole("SUPER_ADMIN", "STUDENT")).toBe(true);
    // Blocked: everyone else — critically, no arbitrary adult → minor.
    expect(canMessageRole("PARENT", "STUDENT")).toBe(false);
    expect(canMessageRole("B2B_PARTNER", "STUDENT")).toBe(false);
    expect(canMessageRole("ORG_ADMIN", "STUDENT")).toBe(false);
    expect(canMessageRole("STUDENT", "STUDENT")).toBe(false);
  });

  it("students may message tutors, and no one else", () => {
    expect(canMessageRole("STUDENT", "TUTOR")).toBe(true);
    expect(canMessageRole("STUDENT", "PARENT")).toBe(false);
    expect(canMessageRole("STUDENT", "ADMIN")).toBe(false);
  });

  it("parents may message tutors and admins, but not students", () => {
    expect(canMessageRole("PARENT", "TUTOR")).toBe(true);
    expect(canMessageRole("PARENT", "ADMIN")).toBe(true);
    expect(canMessageRole("PARENT", "STUDENT")).toBe(false);
    expect(canMessageRole("PARENT", "PARENT")).toBe(false);
  });

  it("tutors may message students and parents", () => {
    expect(canMessageRole("TUTOR", "STUDENT")).toBe(true);
    expect(canMessageRole("TUTOR", "PARENT")).toBe(true);
    expect(canMessageRole("TUTOR", "TUTOR")).toBe(false);
  });

  it("admins may message anyone", () => {
    for (const r of [
      "STUDENT",
      "PARENT",
      "TUTOR",
      "ADMIN",
      "SUPER_ADMIN",
      "B2B_PARTNER",
      "ORG_ADMIN",
    ]) {
      expect(canMessageRole("ADMIN", r)).toBe(true);
      expect(canMessageRole("SUPER_ADMIN", r)).toBe(true);
    }
  });

  it("denies unknown or blank sender roles by default (fail closed)", () => {
    expect(canMessageRole("", "STUDENT")).toBe(false);
    expect(canMessageRole("HACKER", "STUDENT")).toBe(false);
    expect(canMessageRole("STUDENT", "")).toBe(false);
  });
});
