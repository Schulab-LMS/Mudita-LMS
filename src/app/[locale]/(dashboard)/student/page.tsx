import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getStudentStats } from "@/services/user.service";
import { getUserEnrollments } from "@/services/enrollment.service";
import {
  getTodayActivity,
  getLearningStreak,
  getDynamicQuests,
  getActivityHeatmap,
} from "@/services/dashboard.service";
import { StatsCard } from "@/components/dashboard/stats-card";
import { EnrollmentList } from "@/components/dashboard/enrollment-list";
import { DailyGoal } from "@/components/dashboard/daily-goal";
import { QuestList, type Quest } from "@/components/dashboard/quest-list";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { NextLesson } from "@/components/dashboard/next-lesson";
import { Link } from "@/i18n/navigation";
import {
  BookOpen,
  Award,
  Star,
  FileText,
  Rocket,
  ArrowRight,
  Trophy,
  Flame,
  Sparkles,
} from "lucide-react";

export const metadata = { title: "Student Dashboard | Schulab" };

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const t = await getTranslations("dashboard");

  const [stats, enrollments, today, streakDays, dynamicQuests, heatmap] =
    await Promise.all([
      getStudentStats(session.user.id).catch(() => ({
        enrollments: 0,
        badges: 0,
        totalPoints: 0,
        certificates: 0,
      })),
      getUserEnrollments(session.user.id).catch(() => []),
      getTodayActivity(session.user.id),
      getLearningStreak(session.user.id),
      getDynamicQuests(session.user.id),
      getActivityHeatmap(session.user.id),
    ]);

  const inProgress = enrollments.filter((e) => e.status !== "COMPLETED");
  const firstName = session.user.name?.split(" ")[0] || t("defaultName");
  const level = Math.floor(stats.totalPoints / 100) + 1;
  const levelProgress = stats.totalPoints % 100;
  const earnedToday = today.xp;

  // Map dynamic quests from the service to display props. Each quest ID has
  // a matching translation key under dashboard.quests; the reward/progress
  // come from real DB state.
  const questTitle: Record<string, string> = {
    "complete-lesson": t("quests.completeLesson"),
    "earn-xp": t("quests.earnXp", { amount: 50 }),
    "take-quiz": t("quests.takeQuiz"),
    "enroll-first": t("quests.enrollFirst"),
    "keep-streak": t("quests.keepStreak"),
  };
  const quests: Quest[] = dynamicQuests.map((q) => ({
    id: q.id,
    title: questTitle[q.id] ?? q.id,
    reward: q.reward,
    progress: q.progress,
    done: q.done,
  }));

  const resumeTarget = inProgress[0];

  return (
    <div className="space-y-6">
      {/* ============ HERO — welcome + XP + streak ============ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-secondary to-[var(--stem-rocket)] p-6 text-white shadow-lift sm:p-8 bg-noise">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
        </div>
        <div aria-hidden className="pointer-events-none absolute -end-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-14 -end-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute top-6 end-20 h-3 w-3 rounded-full bg-amber-300/60 animate-sparkle" />
        <div aria-hidden className="pointer-events-none absolute bottom-10 end-44 h-2 w-2 rounded-full bg-cyan-300/60 animate-sparkle" style={{ animationDelay: "1s" }} />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/80">
              <Rocket className="h-5 w-5 rtl:rotate-180" />
              <span className="text-sm font-medium uppercase tracking-wider">
                {t("learningAdventure")}
              </span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
              {t("welcome", { name: firstName })}{" "}
              <span className="inline-block animate-wiggle">🚀</span>
            </h1>
            <p className="mt-1 text-white/75">
              {t("keepExploring")}
            </p>

            {/* Level + XP */}
            <div className="mt-6 max-w-md">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  {t("level", { level })}
                </span>
                <span className="text-white/70">
                  {t("xpToNextLevel", { current: levelProgress, total: 100 })}
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/15">
                <div
                  className="xp-bar h-full"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Streak + XP + badges micro-cards */}
          <div className="flex flex-wrap items-center gap-3">
            {streakDays > 0 && (
              <div className="rounded-2xl bg-white/15 p-4 text-center backdrop-blur ring-1 ring-white/20">
                <Flame className="mx-auto h-6 w-6 text-amber-300" />
                <div className="mt-1 font-display text-2xl font-extrabold">
                  {streakDays}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                  {t("dayStreak")}
                </div>
              </div>
            )}
            <div className="rounded-2xl bg-white/15 p-4 text-center backdrop-blur ring-1 ring-white/20">
              <Star className="mx-auto h-6 w-6 text-yellow-200" />
              <div className="mt-1 font-display text-2xl font-extrabold">
                {stats.totalPoints.toLocaleString()}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                {t("totalXp")}
              </div>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 text-center backdrop-blur ring-1 ring-white/20">
              <Trophy className="mx-auto h-6 w-6 text-orange-200" />
              <div className="mt-1 font-display text-2xl font-extrabold">
                {stats.badges}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                {t("badgesShort")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ NEXT LESSON ============ */}
      {resumeTarget && (
        <NextLesson
          title={resumeTarget.course.title}
          subtitle={t("resumeFrom", { category: resumeTarget.course.category })}
          progress={resumeTarget.progress / 100}
          href="/student/courses"
          minutes={15}
        />
      )}

      {/* ============ STATS GRID ============ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("totalCourses")}
          value={stats.enrollments}
          icon={<BookOpen className="h-6 w-6" />}
          color="blue"
        />
        <StatsCard
          title={t("totalBadges")}
          value={stats.badges}
          icon={<Award className="h-6 w-6" />}
          color="amber"
        />
        <StatsCard
          title={t("totalPoints")}
          value={stats.totalPoints.toLocaleString()}
          icon={<Star className="h-6 w-6" />}
          color="purple"
        />
        <StatsCard
          title={t("certificates")}
          value={stats.certificates}
          icon={<FileText className="h-6 w-6" />}
          color="emerald"
        />
      </div>

      {/* ============ ENGAGEMENT ROW ============ */}
      <div className="grid gap-4 lg:grid-cols-3">
        <DailyGoal earned={earnedToday} goal={100} streak={streakDays} />
        {quests.length > 0 && (
          <QuestList quests={quests} className="lg:col-span-1" />
        )}
        <ActivityHeatmap data={heatmap} />
      </div>

      {/* ============ CONTINUE LEARNING ============ */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            {t("continueLearning")}
          </h2>
          {inProgress.length > 0 && (
            <Link
              href="/student/courses"
              className="group flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {t("viewAll")}{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
          )}
        </div>
        <EnrollmentList enrollments={inProgress} />
      </div>
    </div>
  );
}
