import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { getAdminAnalytics } from "@/services/analytics.service";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BarChart, DonutChart } from "@/components/admin/analytics-charts";
import { Link } from "@/i18n/navigation";
import {
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  Package,
  ShieldCheck,
  Award,
  TrendingUp,
  UserCheck,
  BarChart3,
} from "lucide-react";

export const metadata = { title: "Admin Dashboard | Schulab" };

const roleColors: Record<string, string> = {
  STUDENT: "#3b82f6",
  PARENT: "#8b5cf6",
  TUTOR: "#f59e0b",
  ADMIN: "#ef4444",
  SUPER_ADMIN: "#dc2626",
  B2B_PARTNER: "#06b6d4",
};

const enrollmentStatusColors: Record<string, string> = {
  ACTIVE: "#3b82f6",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
  EXPIRED: "#9ca3af",
};

const courseStatusColors: Record<string, string> = {
  PUBLISHED: "#22c55e",
  DRAFT: "#f59e0b",
  ARCHIVED: "#9ca3af",
};

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const analytics = await getAdminAnalytics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and analytics.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={analytics.totals.users}
          icon={<Users className="h-5 w-5" />}
          color="blue"
          trend={
            analytics.trends.users !== 0
              ? {
                  value: Math.abs(analytics.trends.users),
                  positive: analytics.trends.users > 0,
                }
              : undefined
          }
          description={`${analytics.thisMonth.users} this month`}
        />
        <StatsCard
          title="Enrollments"
          value={analytics.totals.enrollments}
          icon={<GraduationCap className="h-5 w-5" />}
          color="purple"
          trend={
            analytics.trends.enrollments !== 0
              ? {
                  value: Math.abs(analytics.trends.enrollments),
                  positive: analytics.trends.enrollments > 0,
                }
              : undefined
          }
          description={`${analytics.thisMonth.enrollments} this month`}
        />
        <StatsCard
          title="Certificates Issued"
          value={analytics.totals.certificates}
          icon={<Award className="h-5 w-5" />}
          color="emerald"
          trend={
            analytics.trends.certificates !== 0
              ? {
                  value: Math.abs(analytics.trends.certificates),
                  positive: analytics.trends.certificates > 0,
                }
              : undefined
          }
          description={`${analytics.thisMonth.certificates} this month`}
        />
        <StatsCard
          title="Completion Rate"
          value={`${analytics.totals.completionRate}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="amber"
          description={`${analytics.totals.activeStudents} active students`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enrollment Trend */}
        <div className="rounded-xl border bg-card p-5">
          <BarChart
            data={analytics.charts.enrollmentsByDay}
            label="Enrollments (Last 30 Days)"
            color="bg-primary"
            height={140}
          />
        </div>

        {/* User Growth */}
        <div className="rounded-xl border bg-card p-5">
          <BarChart
            data={analytics.charts.usersByDay}
            label="New Users (Last 30 Days)"
            color="bg-emerald-500"
            height={140}
          />
        </div>
      </div>

      {/* Distribution Charts + Top Courses */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Roles */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Users by Role
          </h3>
          <DonutChart
            segments={analytics.roleDistribution.map((r) => ({
              label: r.role.charAt(0) + r.role.slice(1).toLowerCase().replace("_", " "),
              count: r.count,
              color: roleColors[r.role] ?? "#9ca3af",
            }))}
            size={130}
          />
        </div>

        {/* Enrollment Status */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Enrollment Status
          </h3>
          <DonutChart
            segments={analytics.enrollmentStatusDist.map((e) => ({
              label: e.status.charAt(0) + e.status.slice(1).toLowerCase(),
              count: e.count,
              color: enrollmentStatusColors[e.status] ?? "#9ca3af",
            }))}
            size={130}
          />
        </div>

        {/* Top Courses */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Top Courses by Enrollments
          </h3>
          {analytics.topCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published courses yet.</p>
          ) : (
            <div className="space-y-3">
              {analytics.topCourses.map((course, i) => {
                const maxEnroll = analytics.topCourses[0]?.enrollments || 1;
                const pct = Math.round((course.enrollments / maxEnroll) * 100);
                return (
                  <div key={course.id}>
                    <div className="flex items-center justify-between mb-1">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="text-sm font-medium truncate max-w-[180px] hover:text-primary"
                      >
                        {i + 1}. {course.title}
                      </Link>
                      <span className="text-xs text-muted-foreground ml-2 shrink-0">
                        {course.enrollments}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Enrollments */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-sm font-semibold">Recent Enrollments</h3>
            <Link
              href="/admin/courses"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y">
            {analytics.recentEnrollments.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground text-center">
                No enrollments yet.
              </div>
            ) : (
              analytics.recentEnrollments.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {e.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {e.course.title}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        e.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : e.status === "ACTIVE"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {e.progress}%
                    </span>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {new Date(e.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Certificates */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-sm font-semibold">Recent Certificates</h3>
          </div>
          <div className="divide-y">
            {analytics.recentCertificates.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground text-center">
                No certificates issued yet.
              </div>
            ) : (
              analytics.recentCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{cert.user.name}</p>
                    <code className="text-xs text-muted-foreground font-mono">
                      {cert.code.slice(0, 12)}...
                    </code>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(cert.issuedAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="mb-4 text-lg font-bold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/users"
            className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
          >
            <Users className="mb-3 h-7 w-7 text-primary" />
            <h3 className="font-semibold">Manage Users</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {analytics.totals.users} users
            </p>
          </Link>
          <Link
            href="/admin/courses"
            className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
          >
            <BookOpen className="mb-3 h-7 w-7 text-primary" />
            <h3 className="font-semibold">Manage Courses</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {analytics.totals.courses} courses
            </p>
          </Link>
          <Link
            href="/admin/products"
            className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
          >
            <Package className="mb-3 h-7 w-7 text-primary" />
            <h3 className="font-semibold">STEM Kit Products</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {analytics.totals.products} products
            </p>
          </Link>
          <Link
            href="/admin/tutors"
            className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md relative"
          >
            <ShieldCheck className="mb-3 h-7 w-7 text-primary" />
            <h3 className="font-semibold">Tutor Verification</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Review applications
            </p>
            {analytics.totals.pendingTutors > 0 && (
              <span className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                {analytics.totals.pendingTutors}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
