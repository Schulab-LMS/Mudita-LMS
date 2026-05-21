import { db } from "@/lib/db";

// Tutor matching by weekly-schedule overlap. Student and tutor availability are
// both recurring weekly slots (dayOfWeek + HH:MM + IANA timezone); we project
// each into UTC "minutes since the start of the week" and intersect.

const WEEK_MINUTES = 7 * 24 * 60;

export interface Slot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
}

// Minutes that `timezone` is ahead of UTC at a given instant (handles the
// current DST state). e.g. "America/New_York" in winter → -300.
function tzOffsetMinutes(timezone: string, at = new Date()): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = Object.fromEntries(
      dtf.formatToParts(at).map((p) => [p.type, p.value])
    );
    const asUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour === "24" ? "0" : parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    return Math.round((asUtc - at.getTime()) / 60000);
  } catch {
    return 0; // unknown tz → treat as UTC
  }
}

function parseHm(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Convert a recurring weekly slot into one or two UTC weekly-minute intervals
// (two when it wraps across the week boundary after the timezone shift).
export function slotToUtcIntervals(slot: Slot): [number, number][] {
  const offset = tzOffsetMinutes(slot.timezone);
  let start = slot.dayOfWeek * 1440 + parseHm(slot.startTime) - offset;
  let end = slot.dayOfWeek * 1440 + parseHm(slot.endTime) - offset;
  if (end <= start) return [];

  // Shift both so start lands in [0, WEEK).
  while (start < 0) {
    start += WEEK_MINUTES;
    end += WEEK_MINUTES;
  }
  while (start >= WEEK_MINUTES) {
    start -= WEEK_MINUTES;
    end -= WEEK_MINUTES;
  }
  if (end <= WEEK_MINUTES) return [[start, end]];
  return [
    [start, WEEK_MINUTES],
    [0, end - WEEK_MINUTES],
  ];
}

export function overlapMinutes(a: Slot[], b: Slot[]): number {
  const ai = a.flatMap(slotToUtcIntervals);
  const bi = b.flatMap(slotToUtcIntervals);
  let total = 0;
  for (const [as, ae] of ai) {
    for (const [bs, be] of bi) {
      total += Math.max(0, Math.min(ae, be) - Math.max(as, bs));
    }
  }
  return total;
}

// Onboarding subject keys → terms that may appear in a tutor's free-text
// subjects, so "coding" can match a tutor who lists "Programming".
const SUBJECT_TERMS: Record<string, string[]> = {
  math: ["math", "mathematics", "algebra", "geometry", "calculus"],
  coding: ["coding", "programming", "python", "javascript", "software", "code"],
  robotics: ["robotics", "robot", "arduino"],
  science: ["science", "physics", "chemistry", "biology"],
  engineering: ["engineering", "mechanical", "electrical"],
  ai: ["ai", "artificial intelligence", "machine learning", "ml", "data science"],
  artdesign: ["art", "design", "drawing", "creative"],
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

function subjectMatchCount(studentSubjects: string[], tutorSubjects: string[]): number {
  const tutorNorm = tutorSubjects.map(normalize);
  let count = 0;
  for (const key of studentSubjects) {
    const terms = SUBJECT_TERMS[normalize(key).replace(/ /g, "")] ?? [normalize(key)];
    if (tutorNorm.some((ts) => terms.some((term) => ts.includes(term)))) count++;
  }
  return count;
}

export interface TutorMatch {
  tutorId: string;
  name: string;
  avatar: string | null;
  headline: string | null;
  subjects: string[];
  rating: number;
  hourlyRate: number;
  currency: string;
  overlapMinutes: number;
  score: number;
}

// Rank verified tutors for a student by schedule overlap, subject fit, and
// rating. Returns [] when the student has declared no availability.
export async function getRecommendedTutors(
  studentId: string,
  limit = 6
): Promise<TutorMatch[]> {
  const [studentSlots, onboarding] = await Promise.all([
    db.studentAvailability.findMany({ where: { userId: studentId } }),
    db.onboardingProfile.findUnique({
      where: { userId: studentId },
      select: { preferredSubjects: true },
    }),
  ]);
  if (studentSlots.length === 0) return [];

  const preferred = onboarding?.preferredSubjects ?? [];
  const tutors = await db.tutorProfile.findMany({
    where: { isVerified: true },
    include: {
      user: { select: { name: true, avatar: true } },
      availability: true,
    },
  });

  const matches: TutorMatch[] = [];
  for (const tutor of tutors) {
    if (tutor.availability.length === 0) continue;
    const overlap = overlapMinutes(studentSlots, tutor.availability);
    if (overlap <= 0) continue;

    const subjectScore = subjectMatchCount(preferred, tutor.subjects);
    const rating = Number(tutor.rating);
    // Overlap is the primary signal (1 pt/hour), then subject fit, then rating.
    const score = overlap / 60 + subjectScore * 3 + rating;

    matches.push({
      tutorId: tutor.id,
      name: tutor.user.name,
      avatar: tutor.user.avatar,
      headline: tutor.headline,
      subjects: tutor.subjects,
      rating,
      hourlyRate: Number(tutor.hourlyRate),
      currency: tutor.currency,
      overlapMinutes: overlap,
      score,
    });
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, limit);
}
