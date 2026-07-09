import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getTutorByUserId } from "@/services/tutor.service";
import { getBookingsForTutor } from "@/services/booking.service";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { RatingStars } from "@/components/ui/rating-stars";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  DollarSign,
  Star,
  ShieldCheck,
  Users,
  Clock,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

export const metadata = { title: "Tutor Dashboard" };

// Plain helpers — outside render to satisfy purity lint on Server Component.
function nowMs(): number {
  return new Date().getTime();
}
function startOfThisMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function TutorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [t, locale, tutor] = await Promise.all([
    getTranslations("tutorDashboard"),
    getLocale(),
    getTutorByUserId(session.user.id),
  ]);

  const firstName = session.user.name?.split(" ")[0] ?? "";

  // Empty state: tutor hasn't completed profile yet.
  if (!tutor) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("title")} description={t("welcomeNew")} />
        <EmptyState
          illustration={<NoCoursesScene />}
          title={t("completeProfile")}
          description={t("completeProfileBody")}
          action={{ label: t("setupProfile"), href: "/tutor/profile" }}
          tone="first-use"
          size="lg"
        />
      </div>
    );
  }

  const bookings = await getBookingsForTutor(tutor.id);
  const now = nowMs();
  const monthStart = startOfThisMonth();
  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

  type Booking = (typeof bookings)[number];

  const upcoming = bookings.filter(
    (b: Booking) => (b.status === "PENDING" || b.status === "CONFIRMED") && new Date(b.startTime).getTime() >= now
  );

  const completed = bookings.filter((b: Booking) => b.status === "COMPLETED");
  const completedThisMonth = completed.filter((b: Booking) => new Date(b.startTime) >= monthStart);
  const completedPrevMonth = completed.filter(
    (b: Booking) => new Date(b.startTime) >= prevMonthStart && new Date(b.startTime) < monthStart
  );

  const earningsThisMonth = completedThisMonth.reduce((sum: number, b: Booking) => sum + Number(b.price), 0);
  const earningsPrevMonth = completedPrevMonth.reduce((sum: number, b: Booking) => sum + Number(b.price), 0);
  const earningsDelta =
    earningsPrevMonth > 0
      ? Math.round(((earningsThisMonth - earningsPrevMonth) / earningsPrevMonth) * 100)
      : earningsThisMonth > 0
      ? 100
      : 0;

  const sessionsDelta = completedPrevMonth.length
    ? Math.round(((completedThisMonth.length - completedPrevMonth.length) / completedPrevMonth.length) * 100)
    : 0;

  // Build 7-day earnings sparkline (for stat card). `today` is evaluated once
  // via the helper above.
  const today = new Date(now);
  const sparkline: number[] = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(today);
    day.setDate(day.getDate() - (6 - i));
    day.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setDate(end.getDate() + 1);
    return completed
      .filter((b: Booking) => new Date(b.startTime) >= day && new Date(b.startTime) < end)
      .reduce((s: number, b: Booking) => s + Number(b.price), 0);
  });

  const completionRate =
    bookings.length > 0
      ? Math.round(
          (bookings.filter((b: Booking) => b.status === "COMPLETED").length /
            bookings.filter((b: Booking) => b.status !== "PENDING").length || 0) * 100
        )
      : 0;

  const rating = Number(tutor.rating);
  const currency = tutor.currency || "USD";

  const fmtMoney = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const timeFormatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });

  const statusTone: Record<string, string> = {
    PENDING: "chip chip-accent",
    CONFIRMED: "chip chip-success",
    CANCELLED: "chip chip-neutral",
    COMPLETED: "chip chip-primary",
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("title")}
        description={t("welcomeBack", { name: firstName })}
        actions={
          <>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                tutor.isVerified
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              {tutor.isVerified ? t("verified") : t("pendingVerification")}
            </span>
            <Link
              href="/tutor/availability"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Calendar className="h-4 w-4" aria-hidden />
              Set availability
            </Link>
          </>
        }
      />

      {/* Stat row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Earnings this month"
          value={fmtMoney.format(earningsThisMonth)}
          description={`${completedThisMonth.length} completed sessions`}
          icon={DollarSign}
          tone="success"
          delta={earningsDelta !== 0 ? { value: earningsDelta } : undefined}
          sparkline={sparkline}
        />
        <StatCard
          label="Upcoming sessions"
          value={upcoming.length}
          description={
            upcoming[0]
              ? `Next: ${dateFormatter.format(new Date(upcoming[0].startTime))}`
              : "No scheduled sessions"
          }
          icon={Calendar}
          tone="primary"
        />
        <StatCard
          label="Total sessions"
          value={tutor.totalSessions}
          description="All time"
          icon={Users}
          tone="secondary"
          delta={sessionsDelta !== 0 ? { value: sessionsDelta } : undefined}
        />
        <StatCard
          label="Rating"
          value={rating > 0 ? rating.toFixed(1) : "—"}
          description={rating > 0 ? "From verified students" : t("noRatings")}
          icon={Star}
          tone="accent"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming sessions */}
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming sessions</h2>
            <Link
              href="/tutor/bookings"
              className="group inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              View all
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="mt-3 font-semibold">No upcoming sessions</p>
              <p className="mt-1 text-sm text-muted-foreground">
                When students book you, they&apos;ll appear here.
              </p>
              <Link
                href="/tutor/availability"
                className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Manage availability
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcoming.slice(0, 5).map((b: Booking) => (
                <li
                  key={b.id}
                  className="card-premium flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{b.subject}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {b.student.name} · {dateFormatter.format(new Date(b.startTime))} ·{" "}
                      {timeFormatter.format(new Date(b.startTime))}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={statusTone[b.status] ?? "chip chip-neutral"}>{b.status}</span>
                    {b.meetingUrl && (
                      <a
                        href={b.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-primary px-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                      >
                        Join
                        <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Performance + quick actions */}
        <aside className="space-y-4">
          <div className="card-premium p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Performance</p>
            <div className="mt-3 space-y-3">
              <PerfRow
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                label="Completion rate"
                value={`${completionRate}%`}
              />
              <PerfRow
                icon={<Star className="h-4 w-4 text-amber-500" />}
                label="Rating"
                value={rating > 0 ? <RatingStars value={rating} size="sm" showValue /> : "—"}
              />
              <PerfRow
                icon={<DollarSign className="h-4 w-4 text-primary" />}
                label="Hourly rate"
                value={fmtMoney.format(Number(tutor.hourlyRate))}
              />
            </div>
          </div>

          <div className="card-premium p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick actions</p>
            <div className="mt-3 space-y-2 text-sm">
              <QuickLink href="/tutor/availability" icon={<Calendar className="h-4 w-4" />}>
                Update availability
              </QuickLink>
              <QuickLink href="/tutor/students" icon={<Users className="h-4 w-4" />}>
                View students
              </QuickLink>
              <QuickLink href="/messages" icon={<MessageSquare className="h-4 w-4" />}>
                Check messages
              </QuickLink>
              <QuickLink href="/tutor/profile" icon={<ShieldCheck className="h-4 w-4" />}>
                Edit public profile
              </QuickLink>
            </div>
          </div>

          {!tutor.isVerified && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Finish verification
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Verified tutors get 3× more bookings. Upload your ID and credentials to unlock full earnings.
              </p>
              <Link
                href="/tutor/profile"
                className="mt-3 inline-flex h-8 items-center rounded-md bg-amber-500 px-3 text-xs font-semibold text-white hover:bg-amber-600"
              >
                Start verification
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function PerfRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function QuickLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</span>
      <span className="flex-1 font-medium text-foreground">{children}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
    </Link>
  );
}
