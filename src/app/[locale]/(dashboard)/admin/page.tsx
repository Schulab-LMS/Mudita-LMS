import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { getAdminAnalytics } from "@/services/analytics.service";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { AreaChart, DonutChart } from "@/components/admin/analytics-charts";
import { Link } from "@/i18n/navigation";
import {
  Users,
  BookOpen,
  GraduationCap,
  Package,
  ShieldCheck,
  Award,
  TrendingUp,
  UserCheck,
  BarChart3,
  CalendarDays,
  Download,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("admin.dashboard");
  return { title: `${t("pageTitle")} | Schulab` };
}

const roleColors: Record<string, string> = {
  STUDENT: "#3b82f6",
  PARENT: "#8b5cf6",
  TUTOR: "#f59e0b",
  ADMIN: "#ef4444",
  SUPER_ADMIN: "#dc2626",
  B2B_PARTNER: "#06b6d4",
};
const KNOWN_ROLES = new Set(Object.keys(roleColors));

const enrollmentStatusColors: Record<string, string> = {
  ACTIVE: "#3b82f6",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
  EXPIRED: "#9ca3af",
};
const KNOWN_STATUSES = new Set(Object.keys(enrollmentStatusColors));

function formatRoleLabel(role: string): string {
  return role.charAt(0) + role.slice(1).toLowerCase().replace("_", " ");
}

function formatStatusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const [t, tCommon, tRoles, tStatus, locale, analytics] = await Promise.all([
    getTranslations("admin.dashboard"),
    getTranslations("admin.common"),
    getTranslations("admin.roles"),
    getTranslations("admin.enrollmentStatus"),
    getLocale(),
    getAdminAnalytics(),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Build 14-day sparklines from daily chart data for stat cards.
  const usersSparkline = analytics.charts.usersByDay
    .slice(-14)
    .map((d) => d.count);
  const enrollmentsSparkline = analytics.charts.enrollmentsByDay
    .slice(-14)
    .map((d) => d.count);

  return (
    <div className="space-y-8">
      {/* ===== Page header ===== */}
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        breadcrumbs={[{ label: "Admin" }]}
        actions={
          <>
            <span className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-background px-3 text-xs font-semibold text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              Last 30 days
            </span>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              Export
            </button>
          </>
        }
      />

      {/* ===== Pending actions callout (only when work is waiting) ===== */}
      {analytics.totals.pendingTutors > 0 && (
        <Link
          href="/admin/tutors"
          className="group flex items-center gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 transition-colors hover:border-amber-500/50 hover:bg-amber-500/10"
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">
              {analytics.totals.pendingTutors} tutor
              {analytics.totals.pendingTutors === 1 ? "" : "s"} awaiting
              verification
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Review applications to keep tutor supply flowing to students.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
        </Link>
      )}

      {/* ===== Top Stats ===== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("totalUsers")}
          value={analytics.totals.users.toLocaleString()}
          icon={Users}
          tone="primary"
          description={t("thisMonth", { count: analytics.thisMonth.users })}
          delta={
            analytics.trends.users !== 0
              ? { value: analytics.trends.users }
              : undefined
          }
          sparkline={usersSparkline.length > 1 ? usersSparkline : undefined}
        />
        <StatCard
          label={t("enrollments")}
          value={analytics.totals.enrollments.toLocaleString()}
          icon={GraduationCap}
          tone="secondary"
          description={t("thisMonth", {
            count: analytics.thisMonth.enrollments,
          })}
          delta={
            analytics.trends.enrollments !== 0
              ? { value: analytics.trends.enrollments }
              : undefined
          }
          sparkline={
            enrollmentsSparkline.length > 1 ? enrollmentsSparkline : undefined
          }
        />
        <StatCard
          label={t("certificatesIssued")}
          value={analytics.totals.certificates.toLocaleString()}
          icon={Award}
          tone="success"
          description={t("thisMonth", {
            count: analytics.thisMonth.certificates,
          })}
          delta={
            analytics.trends.certificates !== 0
              ? { value: analytics.trends.certificates }
              : undefined
          }
        />
        <StatCard
          label={t("completionRate")}
          value={`${analytics.totals.completionRate}%`}
          icon={TrendingUp}
          tone="accent"
          description={t("activeStudents", {
            count: analytics.totals.activeStudents,
          })}
        />
      </div>

      {/* ===== Area charts (primary trend visualisation) ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-5">
          <AreaChart
            data={analytics.charts.enrollmentsByDay}
            label={t("enrollmentsLast30")}
            sublabel="Daily enrollments across all courses"
            stroke="#4f3ff0"
            fillFrom="#4f3ff0"
            fillTo="#4f3ff0"
            height={200}
          />
        </div>
        <div className="card-premium p-5">
          <AreaChart
            data={analytics.charts.usersByDay}
            label={t("newUsersLast30")}
            sublabel="New registrations per day"
            stroke="#10b981"
            fillFrom="#10b981"
            fillTo="#10b981"
            height={200}
          />
        </div>
      </div>

      {/* ===== Distribution Charts + Top Courses ===== */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-premium p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <UserCheck className="h-4 w-4 text-primary" aria-hidden />
            {t("usersByRole")}
          </h3>
          <DonutChart
            segments={analytics.roleDistribution.map((r) => ({
              label: KNOWN_ROLES.has(r.role)
                ? tRoles(r.role)
                : formatRoleLabel(r.role),
              count: r.count,
              color: roleColors[r.role] ?? "#9ca3af",
            }))}
            size={140}
          />
        </div>

        <div className="card-premium p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <BarChart3 className="h-4 w-4 text-primary" aria-hidden />
            {t("enrollmentStatus")}
          </h3>
          <DonutChart
            segments={analytics.enrollmentStatusDist.map((e) => ({
              label: KNOWN_STATUSES.has(e.status)
                ? tStatus(e.status)
                : formatStatusLabel(e.status),
              count: e.count,
              color: enrollmentStatusColors[e.status] ?? "#9ca3af",
            }))}
            size={140}
          />
        </div>

        <div className="card-premium p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="h-4 w-4 text-primary" aria-hidden />
            {t("topCoursesByEnrollments")}
          </h3>
          {analytics.topCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("noPublishedCourses")}
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.topCourses.map((course, i) => {
                const maxEnroll =
                  analytics.topCourses[0]?.enrollments || 1;
                const pct = Math.round(
                  (course.enrollments / maxEnroll) * 100
                );
                return (
                  <div key={course.id}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="truncate text-sm font-medium hover:text-primary"
                      >
                        <span className="me-1 text-xs text-muted-foreground">
                          {i + 1}.
                        </span>
                        {course.title}
                      </Link>
                      <span className="shrink-0 text-xs font-semibold text-foreground">
                        {course.enrollments}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-launch-gradient-horizontal"
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

      {/* ===== Recent Activity ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Enrollments */}
        <div className="card-premium overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <GraduationCap className="h-4 w-4 text-primary" aria-hidden />
              {t("recentEnrollments")}
            </h3>
            <Link
              href="/admin/courses"
              className="group inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              {tCommon("viewAll")}
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {analytics.recentEnrollments.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {t("noEnrollments")}
              </div>
            ) : (
              analytics.recentEnrollments.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {e.user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.course.title}
                    </p>
                  </div>
                  <div className="shrink-0 text-end">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        e.status === "COMPLETED"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : e.status === "ACTIVE"
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {e.progress}%
                    </span>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {dateFormatter.format(new Date(e.enrolledAt))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Certificates */}
        <div className="card-premium overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Award className="h-4 w-4 text-primary" aria-hidden />
              {t("recentCertificates")}
            </h3>
            <Link
              href="/admin/certificates"
              className="group inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              {tCommon("viewAll")}
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {analytics.recentCertificates.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {t("noCertificates")}
              </div>
            ) : (
              analytics.recentCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {cert.user.name}
                    </p>
                    <code className="font-mono text-xs text-muted-foreground">
                      {cert.code.slice(0, 12)}…
                    </code>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {dateFormatter.format(new Date(cert.issuedAt))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ===== Quick Actions ===== */}
      <div>
        <h2 className="mb-4 text-lg font-bold">{t("quickActions")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            href="/admin/users"
            icon={Users}
            title={t("manageUsers")}
            description={t("usersCount", {
              count: analytics.totals.users,
            })}
            tone="primary"
          />
          <QuickAction
            href="/admin/courses"
            icon={BookOpen}
            title={t("manageCourses")}
            description={t("coursesCount", {
              count: analytics.totals.courses,
            })}
            tone="secondary"
          />
          <QuickAction
            href="/admin/products"
            icon={Package}
            title={t("stemKitProducts")}
            description={t("productsCount", {
              count: analytics.totals.products,
            })}
            tone="accent"
          />
          <QuickAction
            href="/admin/tutors"
            icon={ShieldCheck}
            title={t("tutorVerification")}
            description={t("reviewApplications")}
            tone="success"
            badge={
              analytics.totals.pendingTutors > 0
                ? analytics.totals.pendingTutors
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}

const TONE_BG: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

type QuickTone = keyof typeof TONE_BG;

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
  tone = "primary",
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tone?: QuickTone;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="card-premium group relative flex flex-col p-5 transition-all hover:-translate-y-0.5"
    >
      <span
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${TONE_BG[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-semibold text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <ArrowUpRight
        className="absolute end-4 top-4 h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100"
        aria-hidden
      />
      {badge !== undefined && (
        <span className="absolute top-3 end-3 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-bold text-white shadow-sm">
          {badge}
        </span>
      )}
    </Link>
  );
}
