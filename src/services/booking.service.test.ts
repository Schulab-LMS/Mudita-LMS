import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    tutorProfile: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    booking: { findFirst: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { db } from "@/lib/db";
import { createBooking } from "./booking.service";

describe("createBooking", () => {
  const baseInput = {
    studentId: "stu1",
    tutorId: "tut1",
    subject: "Math",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
  };

  beforeEach(() => {
    vi.mocked(db.tutorProfile.findUnique).mockReset();
    vi.mocked(db.user.findUnique).mockReset();
    vi.mocked(db.$transaction).mockReset();
    // Default tenant state: both parties are no-org, so the tenant gate
    // short-circuits and the test focuses on its own concerns.
    vi.mocked(db.user.findUnique).mockResolvedValue({
      organizationId: null,
    } as never);
  });

  it("rejects an inverted time range", async () => {
    const bad = {
      ...baseInput,
      startTime: baseInput.endTime,
      endTime: baseInput.startTime,
    };
    await expect(createBooking(bad)).resolves.toEqual({ error: "invalid_range" });
  });

  it("rejects a start time in the past", async () => {
    const past = {
      ...baseInput,
      startTime: new Date(Date.now() - 60 * 60 * 1000),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
    };
    await expect(createBooking(past)).resolves.toEqual({ error: "invalid_range" });
  });

  it("rejects an unknown tutor", async () => {
    vi.mocked(db.tutorProfile.findUnique).mockResolvedValue(null);
    await expect(createBooking(baseInput)).resolves.toEqual({
      error: "tutor_not_found",
    });
  });

  it("derives price from the tutor's hourlyRate × duration, ignoring client input", async () => {
    // 45/hr × 1hr = 45, regardless of whatever the caller may have tried to pass.
    vi.mocked(db.tutorProfile.findUnique).mockResolvedValue({
      hourlyRate: 45,
      user: { organizationId: null },
    } as never);
    vi.mocked(db.$transaction).mockImplementation(async (fn: unknown) => {
      const tx = {
        booking: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn(async ({ data }: { data: { price: number } }) => ({
            id: "bkg1",
            ...data,
          })),
        },
      };
      return (fn as (t: unknown) => Promise<unknown>)(tx);
    });

    const result = await createBooking(baseInput);
    expect(result).toMatchObject({ booking: { price: 45, status: "PENDING" } });
  });

  it("prices a 90-minute booking as 1.5 × hourlyRate", async () => {
    vi.mocked(db.tutorProfile.findUnique).mockResolvedValue({
      hourlyRate: 60,
      user: { organizationId: null },
    } as never);
    vi.mocked(db.$transaction).mockImplementation(async (fn: unknown) => {
      const tx = {
        booking: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn(async ({ data }: { data: { price: number } }) => ({
            id: "bkg2",
            ...data,
          })),
        },
      };
      return (fn as (t: unknown) => Promise<unknown>)(tx);
    });

    const ninetyMin = {
      ...baseInput,
      endTime: new Date(baseInput.startTime.getTime() + 90 * 60 * 1000),
    };
    const result = await createBooking(ninetyMin);
    expect(result).toMatchObject({ booking: { price: 90 } });
  });
});
