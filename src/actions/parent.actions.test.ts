import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    parentChild: { findUnique: vi.fn(), findMany: vi.fn() },
    user: { findUnique: vi.fn() },
    course: { findUnique: vi.fn() },
    consentRecord: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/compliance", () => ({
  recordConsent: vi.fn(),
  assertMinorConsent: vi.fn(),
  isMinor: vi.fn(),
  PRIVACY_VERSION: "2026-01-01",
}));

vi.mock("@/lib/tenant", () => ({
  assertSameTenant: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  isStripeConfigured: vi.fn(() => true),
}));

vi.mock("@/services/billing.service", () => ({
  createCourseCheckoutSession: vi.fn(),
}));

vi.mock("@/services/enrollment.service", () => ({
  enrollUser: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendEnrollmentConfirmation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: () => null,
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  recordConsent,
  assertMinorConsent,
  isMinor,
} from "@/lib/compliance";
import { assertSameTenant } from "@/lib/tenant";
import { createCourseCheckoutSession } from "@/services/billing.service";
import {
  withdrawChildConsent,
  bulkGrantChildConsent,
  buyCourseForChild,
} from "./parent.actions";

const parentSession = {
  user: { id: "parent1", role: "PARENT", name: "P", email: "p@x.test" },
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── withdrawChildConsent ───────────────────────────────────────────────

describe("withdrawChildConsent", () => {
  it("appends a granted:false ledger row on the happy path", async () => {
    vi.mocked(auth).mockResolvedValue(parentSession as never);
    vi.mocked(db.parentChild.findUnique).mockResolvedValue({
      id: "link1",
      parentId: "parent1",
      childId: "child_____________________1",
    } as never);
    vi.mocked(recordConsent).mockResolvedValue({} as never);

    const result = await withdrawChildConsent({
      childId: "child_____________________1",
      type: "PARENTAL_GDPR_K",
    });

    expect(result).toEqual({ success: true });
    expect(recordConsent).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "child_____________________1" }),
      "PARENTAL_GDPR_K",
      "2026-01-01",
      false
    );
  });

  it("rejects callers who are not parents", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u1", role: "STUDENT" },
    } as never);

    const result = await withdrawChildConsent({
      childId: "child_____________________1",
      type: "PARENTAL_GDPR_K",
    });

    expect(result.success).toBe(false);
    expect(recordConsent).not.toHaveBeenCalled();
  });

  it("rejects when the child is not linked to the calling parent", async () => {
    vi.mocked(auth).mockResolvedValue(parentSession as never);
    vi.mocked(db.parentChild.findUnique).mockResolvedValue(null);

    const result = await withdrawChildConsent({
      childId: "child_____________________1",
      type: "PARENTAL_GDPR_K",
    });

    expect(result.success).toBe(false);
    expect(recordConsent).not.toHaveBeenCalled();
  });
});

// ── bulkGrantChildConsent ──────────────────────────────────────────────

describe("bulkGrantChildConsent", () => {
  it("grants only for unconsented minor children, in a single transaction", async () => {
    vi.mocked(auth).mockResolvedValue(parentSession as never);
    vi.mocked(isMinor).mockImplementation(() => true);
    // Three children: one minor without consent, one minor already
    // consented, one adult. Expect the action to grant only the first.
    vi.mocked(db.parentChild.findMany).mockResolvedValue([
      {
        child: {
          id: "child1",
          dateOfBirth: new Date("2018-01-01"),
          consentRecords: [],
        },
      },
      {
        child: {
          id: "child2",
          dateOfBirth: new Date("2018-01-01"),
          consentRecords: [{ granted: true }],
        },
      },
      {
        child: {
          id: "adult1",
          dateOfBirth: new Date("1995-01-01"),
          consentRecords: [],
        },
      },
    ] as never);
    vi.mocked(isMinor).mockImplementation(
      (dob) => new Date(dob).getFullYear() > 2010
    );
    vi.mocked(db.$transaction).mockResolvedValue([] as never);

    const result = await bulkGrantChildConsent({ type: "PARENTAL_GDPR_K" });

    expect(result.success).toBe(true);
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    const txnArg = vi.mocked(db.$transaction).mock.calls[0][0] as unknown as unknown[];
    expect(txnArg).toHaveLength(1);
  });

  it("returns success with 0 granted when there are no candidates", async () => {
    vi.mocked(auth).mockResolvedValue(parentSession as never);
    vi.mocked(db.parentChild.findMany).mockResolvedValue([]);

    const result = await bulkGrantChildConsent({ type: "PARENTAL_GDPR_K" });

    expect(result).toEqual({ success: true, data: { granted: 0 } });
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});

// ── buyCourseForChild ──────────────────────────────────────────────────

describe("buyCourseForChild", () => {
  const happyArgs = {
    childId: "child_____________________1",
    courseId: "course____________________1",
  };

  function setHappyPathMocks(overrides: {
    course?: Partial<{
      isFree: boolean;
      price: number;
      requiredPlan: string | null;
      organizationId: string | null;
      status: string;
    }>;
    consent?: { ok: boolean; reason?: string };
    tenant?: string | null;
  } = {}) {
    vi.mocked(auth).mockResolvedValue(parentSession as never);
    vi.mocked(db.parentChild.findUnique).mockResolvedValue({
      id: "link1",
      parentId: "parent1",
      childId: happyArgs.childId,
    } as never);
    vi.mocked(db.course.findUnique).mockResolvedValue({
      status: "PUBLISHED",
      isFree: false,
      price: 19.99,
      requiredPlan: null,
      organizationId: null,
      ...(overrides.course ?? {}),
    } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({
      organizationId: null,
    } as never);
    vi.mocked(assertSameTenant).mockReturnValue(
      (overrides.tenant ?? null) as never
    );
    vi.mocked(assertMinorConsent).mockResolvedValue(
      (overrides.consent ?? { ok: true }) as never
    );
    vi.mocked(createCourseCheckoutSession).mockResolvedValue({
      url: "https://stripe.test/session/x",
      sessionId: "cs_test_x",
    });
  }

  it("returns a Stripe URL on the happy path with beneficiary set to the child", async () => {
    setHappyPathMocks();
    const result = await buyCourseForChild(happyArgs);

    expect(result.success).toBe(true);
    expect(createCourseCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "parent1",
        beneficiaryUserId: happyArgs.childId,
        courseId: happyArgs.courseId,
      })
    );
  });

  it("blocks when consent has been withdrawn for the child", async () => {
    setHappyPathMocks({
      consent: { ok: false, reason: "consent_withdrawn" },
    });

    const result = await buyCourseForChild(happyArgs);

    expect(result.success).toBe(false);
    expect(createCourseCheckoutSession).not.toHaveBeenCalled();
  });

  it("masks a cross-tenant course as 'not found'", async () => {
    setHappyPathMocks({ tenant: "tenant_mismatch" });

    const result = await buyCourseForChild(happyArgs);

    expect(result).toEqual({ success: false, error: "Course not found" });
    expect(createCourseCheckoutSession).not.toHaveBeenCalled();
  });

  it("rejects free courses (directs the parent to free enrolment)", async () => {
    setHappyPathMocks({ course: { isFree: true, price: 0 } });

    const result = await buyCourseForChild(happyArgs);

    expect(result.success).toBe(false);
    expect(createCourseCheckoutSession).not.toHaveBeenCalled();
  });

  it("rejects subscription-tier courses (directs the parent to subscribe)", async () => {
    setHappyPathMocks({ course: { requiredPlan: "LEARNER" } });

    const result = await buyCourseForChild(happyArgs);

    expect(result.success).toBe(false);
    expect(createCourseCheckoutSession).not.toHaveBeenCalled();
  });
});
