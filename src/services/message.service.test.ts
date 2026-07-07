import { describe, it, expect, vi, beforeEach } from "vitest";

// canMessage() touches the DB (booking + parentChild) for relationship checks;
// canMessageRole() is pure. Mock only what canMessage uses.
vi.mock("@/lib/db", () => ({
  db: {
    parentChild: { findMany: vi.fn() },
    booking: { count: vi.fn() },
  },
}));

import { db } from "@/lib/db";
import { canMessageRole, canMessage } from "@/services/message.service";

// ── Role gate (pure) ──────────────────────────────────────────────────────
describe("canMessageRole — messaging role policy", () => {
  it("BLOCKS student → student (the P0: no learner can cold-DM another learner)", () => {
    expect(canMessageRole("STUDENT", "STUDENT")).toBe(false);
  });

  it("only vetted adult roles can reach a STUDENT", () => {
    expect(canMessageRole("TUTOR", "STUDENT")).toBe(true);
    expect(canMessageRole("ADMIN", "STUDENT")).toBe(true);
    expect(canMessageRole("SUPER_ADMIN", "STUDENT")).toBe(true);
    expect(canMessageRole("PARENT", "STUDENT")).toBe(false);
    expect(canMessageRole("B2B_PARTNER", "STUDENT")).toBe(false);
    expect(canMessageRole("ORG_ADMIN", "STUDENT")).toBe(false);
  });

  it("students may message tutors, parents may message tutors/admins", () => {
    expect(canMessageRole("STUDENT", "TUTOR")).toBe(true);
    expect(canMessageRole("STUDENT", "ADMIN")).toBe(false);
    expect(canMessageRole("PARENT", "TUTOR")).toBe(true);
    expect(canMessageRole("PARENT", "ADMIN")).toBe(true);
    expect(canMessageRole("PARENT", "STUDENT")).toBe(false);
  });

  it("tutors may message students and parents; admins anyone", () => {
    expect(canMessageRole("TUTOR", "STUDENT")).toBe(true);
    expect(canMessageRole("TUTOR", "PARENT")).toBe(true);
    for (const r of ["STUDENT", "PARENT", "TUTOR", "ADMIN", "B2B_PARTNER", "ORG_ADMIN"]) {
      expect(canMessageRole("ADMIN", r)).toBe(true);
    }
  });

  it("denies unknown or blank sender roles by default (fail closed)", () => {
    expect(canMessageRole("", "STUDENT")).toBe(false);
    expect(canMessageRole("HACKER", "STUDENT")).toBe(false);
  });
});

// ── Relationship-aware gate (role policy + booking relationship) ───────────
describe("canMessage — relationship-scoped safeguarding gate", () => {
  const student = { id: "stu1", role: "STUDENT" };
  const otherStudent = { id: "stu2", role: "STUDENT" };
  const tutor = { id: "tut1", role: "TUTOR" };
  const parent = { id: "par1", role: "PARENT" };
  const admin = { id: "adm1", role: "ADMIN" };

  beforeEach(() => {
    vi.mocked(db.booking.count).mockReset();
    vi.mocked(db.parentChild.findMany).mockReset();
  });

  it("blocks role-forbidden pairs before any DB lookup", async () => {
    expect(await canMessage(student, otherStudent)).toBe(false); // student→student
    expect(await canMessage(student, parent)).toBe(false); // student→parent (role-forbidden)
    expect(db.booking.count).not.toHaveBeenCalled();
    expect(db.parentChild.findMany).not.toHaveBeenCalled();
  });

  it("admins bypass the relationship check on either side", async () => {
    expect(await canMessage(admin, student)).toBe(true); // admin → student
    expect(await canMessage(parent, admin)).toBe(true); // parent → admin (support)
    expect(db.booking.count).not.toHaveBeenCalled();
    expect(db.parentChild.findMany).not.toHaveBeenCalled();
  });

  it("student↔tutor requires a shared booking (matched via the tutor's userId)", async () => {
    vi.mocked(db.booking.count).mockResolvedValueOnce(1);
    expect(await canMessage(student, tutor)).toBe(true);
    expect(db.booking.count).toHaveBeenCalledWith({
      where: { studentId: { in: ["stu1"] }, tutor: { userId: "tut1" } },
    });

    vi.mocked(db.booking.count).mockResolvedValueOnce(0);
    expect(await canMessage(tutor, student)).toBe(false); // no booking → blocked
  });

  it("parent↔tutor resolves the parent's children, then checks their bookings", async () => {
    vi.mocked(db.parentChild.findMany).mockResolvedValueOnce([
      { childId: "kid1" },
      { childId: "kid2" },
    ] as never);
    vi.mocked(db.booking.count).mockResolvedValueOnce(1);
    expect(await canMessage(parent, tutor)).toBe(true);
    expect(db.booking.count).toHaveBeenCalledWith({
      where: { studentId: { in: ["kid1", "kid2"] }, tutor: { userId: "tut1" } },
    });
  });

  it("parent with no children (or no shared booking) is blocked", async () => {
    vi.mocked(db.parentChild.findMany).mockResolvedValueOnce([] as never);
    expect(await canMessage(parent, tutor)).toBe(false);
    expect(db.booking.count).not.toHaveBeenCalled(); // short-circuits on empty children
  });
});
