import { db } from "@/lib/db";

// Live data for the student dashboard. Everything here is derived from
// real DB state — we never invent numbers. When data is missing we return
// zeros/empty arrays so the UI can hide the widget.

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Today's activity ─────────────────────────────────────────────────────

export type TodayActivity = {
  xp: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  anyActivity: boolean;
};

export async function getTodayActivity(
  userId: string
): Promise<TodayActivity> {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  try {
    const [xpAgg, lessonsCompleted, quizzesCompleted] = await Promise.all([
      db.pointTransaction.aggregate({
        where: { userId, createdAt: { gte: today, lt: tomorrow } },
        _sum: { points: true },
      }),
      db.lessonProgress.count({
        where: {
          userId,
          completed: true,
          lastAccess: { gte: today, lt: tomorrow },
        },
      }),
      db.quizAttempt.count({
        where: {
          userId,
          completedAt: { gte: today, lt: tomorrow, not: null },
        },
      }),
    ]);

    const xp = xpAgg._sum.points ?? 0;
    return {
      xp,
      lessonsCompleted,
      quizzesCompleted,
      anyActivity: xp > 0 || lessonsCompleted > 0 || quizzesCompleted > 0,
    };
  } catch {
    return { xp: 0, lessonsCompleted: 0, quizzesCompleted: 0, anyActivity: false };
  }
}

// ── Streak ───────────────────────────────────────────────────────────────

// Consecutive days (ending today or yesterday) on which the learner earned
// any points. If today has no activity yet but yesterday did, we still
// count the streak as alive so the UI can prompt them to keep it.
export async function getLearningStreak(userId: string): Promise<number> {
  try {
    const windowStart = addDays(startOfDay(new Date()), -60);
    const rows = await db.pointTransaction.findMany({
      where: { userId, createdAt: { gte: windowStart } },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    if (rows.length === 0) return 0;

    const activeDays = new Set(rows.map((r) => ymd(startOfDay(r.createdAt))));

    const today = startOfDay(new Date());
    let cursor = today;
    if (!activeDays.has(ymd(cursor))) {
      // If today has no activity yet, start counting from yesterday so the
      // streak doesn't get "broken" midday.
      cursor = addDays(cursor, -1);
      if (!activeDays.has(ymd(cursor))) return 0;
    }

    let streak = 0;
    while (activeDays.has(ymd(cursor))) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }
    return streak;
  } catch {
    return 0;
  }
}

// ── Quests ───────────────────────────────────────────────────────────────

export type DynamicQuest = {
  id: "complete-lesson" | "earn-xp" | "take-quiz" | "enroll-first" | "keep-streak";
  reward: number;
  progress: number; // 0..1
  done: boolean;
};

// Returns at most 3 quests calibrated to the learner's real state. Each
// quest ID maps to a translation key on the client so copy stays i18n-safe.
export async function getDynamicQuests(
  userId: string
): Promise<DynamicQuest[]> {
  try {
    const [enrollments, today, streak, everPassedQuiz] = await Promise.all([
      db.enrollment.count({ where: { userId } }),
      getTodayActivity(userId),
      getLearningStreak(userId),
      db.quizAttempt.count({ where: { userId, passed: true } }).then((n) => n > 0),
    ]);

    const quests: DynamicQuest[] = [];

    // First-time quest — onboard into the product by enrolling in a course.
    if (enrollments === 0) {
      quests.push({
        id: "enroll-first",
        reward: 25,
        progress: 0,
        done: false,
      });
    } else {
      // Complete a lesson today.
      quests.push({
        id: "complete-lesson",
        reward: 20,
        progress: today.lessonsCompleted > 0 ? 1 : 0,
        done: today.lessonsCompleted > 0,
      });

      // Earn XP today (50 XP target).
      const xpTarget = 50;
      quests.push({
        id: "earn-xp",
        reward: 15,
        progress: Math.min(1, today.xp / xpTarget),
        done: today.xp >= xpTarget,
      });

      // Quiz quest only surfaces for learners who have engaged with quizzes
      // before — otherwise it's a dead-end for courses without quizzes.
      if (everPassedQuiz) {
        quests.push({
          id: "take-quiz",
          reward: 25,
          progress: today.quizzesCompleted > 0 ? 1 : 0,
          done: today.quizzesCompleted > 0,
        });
      } else if (streak > 0) {
        // Otherwise push a streak-maintenance quest so they always have a
        // reason to open the app.
        quests.push({
          id: "keep-streak",
          reward: 10,
          progress: today.anyActivity ? 1 : 0,
          done: today.anyActivity,
        });
      }
    }

    return quests.slice(0, 3);
  } catch {
    return [];
  }
}

// ── Activity heatmap ─────────────────────────────────────────────────────

// 49-day grid (7 weeks × 7 days) of activity intensity buckets 0..4 based on
// distinct activities per day (points txns, lessons completed, quizzes).
export async function getActivityHeatmap(userId: string): Promise<number[]> {
  try {
    const today = startOfDay(new Date());
    const start = addDays(today, -48);

    const [points, lessons, quizzes] = await Promise.all([
      db.pointTransaction.findMany({
        where: { userId, createdAt: { gte: start } },
        select: { createdAt: true },
      }),
      db.lessonProgress.findMany({
        where: { userId, completed: true, lastAccess: { gte: start } },
        select: { lastAccess: true },
      }),
      db.quizAttempt.findMany({
        where: { userId, completedAt: { gte: start, not: null } },
        select: { completedAt: true },
      }),
    ]);

    const counts = new Map<string, number>();
    const bump = (d: Date) => {
      const key = ymd(startOfDay(d));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    };
    for (const p of points) bump(p.createdAt);
    for (const l of lessons) bump(l.lastAccess);
    for (const q of quizzes) if (q.completedAt) bump(q.completedAt);

    const buckets: number[] = [];
    for (let i = 0; i < 49; i++) {
      const day = addDays(start, i);
      const n = counts.get(ymd(day)) ?? 0;
      // Bucket into 0..4. Light activity (1-2) → 1, moderate (3-4) → 2,
      // heavy (5-7) → 3, intense (8+) → 4.
      const bucket =
        n === 0 ? 0 : n <= 2 ? 1 : n <= 4 ? 2 : n <= 7 ? 3 : 4;
      buckets.push(bucket);
    }
    return buckets;
  } catch {
    return new Array(49).fill(0);
  }
}
