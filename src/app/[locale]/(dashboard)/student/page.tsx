import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStudentStats } from "@/services/user.service";
import { getUserEnrollments } from "@/services/enrollment.service";
import { StatsCard } from "@/components/dashboard/stats-card";
import { EnrollmentList } from "@/components/dashboard/enrollment-list";
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
} from "lucide-react";

export const metadata = { title: "Student Dashboard | Schulab" };

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [stats, enrollments] = await Promise.all([
    getStudentStats(session.user.id).catch(() => ({
      enrollments: 0, badges: 0, totalPoints: 0, certificates: 0,
    })),
    getUserEnrollments(session.user.id).catch(() => []),
  ]);

  const inProgress = enrollments.filter((e) => e.status !== "COMPLETED");
  const firstName = session.user.name?.split(" ")[0] || "Explorer";

  return (
    <div className="space-y-8">
      {/* Welcome header with adventure theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-secondary to-[var(--stem-rocket)] p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white/80">
            <Rocket className="h-5 w-5" />
            <span className="text-sm font-medium">Learning Adventure</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold">
            Welcome back, {firstName}! 🚀
          </h1>
          <p className="mt-1 text-white/70">
            Keep exploring — every lesson brings you closer to mastery.
          </p>

          {/* XP progress bar */}
          <div className="mt-6 max-w-md">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-semibold">
                <Flame className="h-4 w-4 text-amber-300" />
                Level {Math.floor(stats.totalPoints / 100) + 1}
              </span>
              <span className="text-white/60">
                {stats.totalPoints % 100}/100 XP to next level
              </span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/20">
              <div
                className="xp-bar h-full"
                style={{ width: `${stats.totalPoints % 100}%` }}
              />
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-white/5" />
        <div className="absolute top-4 right-20 h-3 w-3 rounded-full bg-amber-300/50 animate-sparkle" />
        <div className="absolute bottom-8 right-40 h-2 w-2 rounded-full bg-cyan-300/50 animate-sparkle" style={{ animationDelay: "1s" }} />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Courses Enrolled"
          value={stats.enrollments}
          icon={<BookOpen className="h-6 w-6" />}
          color="blue"
        />
        <StatsCard
          title="Badges Earned"
          value={stats.badges}
          icon={<Award className="h-6 w-6" />}
          color="amber"
        />
        <StatsCard
          title="Total Points"
          value={stats.totalPoints.toLocaleString()}
          icon={<Star className="h-6 w-6" />}
          color="purple"
        />
        <StatsCard
          title="Certificates"
          value={stats.certificates}
          icon={<FileText className="h-6 w-6" />}
          color="emerald"
        />
      </div>

      {/* Continue Learning */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Continue Learning
          </h2>
          {inProgress.length > 0 && (
            <Link
              href="/student/courses"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
        <EnrollmentList enrollments={inProgress} />
      </div>
    </div>
  );
}
