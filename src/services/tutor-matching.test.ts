import { describe, it, expect } from "vitest";
import { slotToUtcIntervals, overlapMinutes, type Slot } from "./tutor-matching.service";

const utc = (dayOfWeek: number, startTime: string, endTime: string): Slot => ({
  dayOfWeek,
  startTime,
  endTime,
  timezone: "UTC",
});

describe("slotToUtcIntervals", () => {
  it("maps a simple UTC slot to weekly minutes", () => {
    // Monday (1) 16:00–18:00 → 1*1440 + 960 .. 1*1440 + 1080
    expect(slotToUtcIntervals(utc(1, "16:00", "18:00"))).toEqual([[2400, 2520]]);
  });

  it("drops zero/negative-length slots", () => {
    expect(slotToUtcIntervals(utc(1, "18:00", "18:00"))).toEqual([]);
    expect(slotToUtcIntervals(utc(1, "18:00", "16:00"))).toEqual([]);
  });
});

describe("overlapMinutes", () => {
  it("computes overlap for the same day", () => {
    const student = [utc(1, "16:00", "18:00")];
    const tutor = [utc(1, "17:00", "19:00")];
    expect(overlapMinutes(student, tutor)).toBe(60);
  });

  it("is zero on different days", () => {
    expect(overlapMinutes([utc(1, "16:00", "18:00")], [utc(2, "16:00", "18:00")])).toBe(0);
  });

  it("is zero when times don't intersect", () => {
    expect(overlapMinutes([utc(3, "09:00", "10:00")], [utc(3, "11:00", "12:00")])).toBe(0);
  });

  it("sums overlap across multiple slots", () => {
    const student = [utc(1, "16:00", "18:00"), utc(3, "09:00", "11:00")];
    const tutor = [utc(1, "17:00", "18:00"), utc(3, "10:00", "12:00")];
    // Mon: 17–18 = 60, Wed: 10–11 = 60
    expect(overlapMinutes(student, tutor)).toBe(120);
  });

  it("respects timezone offsets (same wall-clock, different zones can still overlap)", () => {
    // 13:00–15:00 in Berlin (UTC+1/+2) vs 12:00–14:00 UTC should overlap.
    const student: Slot[] = [
      { dayOfWeek: 2, startTime: "13:00", endTime: "15:00", timezone: "Europe/Berlin" },
    ];
    const tutor = [utc(2, "12:00", "14:00")];
    expect(overlapMinutes(student, tutor)).toBeGreaterThan(0);
  });
});
