import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBookingsForStudent } from "@/services/booking.service";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoNotificationsScene } from "@/components/illustrations/empty-scenes";
import {
  Calendar,
  Clock,
  ExternalLink,
  Users,
  CalendarPlus,
  Video,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

export const metadata = { title: "My Bookings | Schulab" };

const statusChip: Record<string, string> = {
  PENDING: "chip chip-accent",
  CONFIRMED: "chip chip-success",
  CANCELLED: "chip chip-neutral",
  COMPLETED: "chip chip-primary",
};

export default async function StudentBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const bookings = await getBookingsForStudent(session.user.id);
  const now = new Date().getTime();
  type Booking = (typeof bookings)[number];

  const upcoming = bookings.filter(
    (b: Booking) =>
      (b.status === "PENDING" || b.status === "CONFIRMED") &&
      new Date(b.startTime).getTime() >= now
  );
  const past = bookings.filter(
    (b: Booking) =>
      b.status === "COMPLETED" ||
      b.status === "CANCELLED" ||
      new Date(b.startTime).getTime() < now
  );

  const dateFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        description={`${upcoming.length} upcoming · ${past.length} past · ${bookings.length} total`}
        breadcrumbs={[{ label: "Bookings" }]}
        actions={
          <Link
            href="/tutors"
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-launch-gradient px-3 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
            Book a session
          </Link>
        }
      />

      {bookings.length === 0 ? (
        <EmptyState
          illustration={<NoNotificationsScene />}
          title="No bookings yet"
          description="Find a tutor and book your first 1-on-1 session. Verified educators are just a click away."
          action={{ label: "Find a tutor", href: "/tutors" }}
          tone="first-use"
          size="lg"
        />
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <Section
              title="Upcoming"
              count={upcoming.length}
              tone="primary"
              bookings={upcoming}
              dateFmt={dateFmt}
              timeFmt={timeFmt}
            />
          )}
          {past.length > 0 && (
            <Section
              title="Past"
              count={past.length}
              tone="neutral"
              bookings={past}
              dateFmt={dateFmt}
              timeFmt={timeFmt}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  count,
  tone,
  bookings,
  dateFmt,
  timeFmt,
}: {
  title: string;
  count: number;
  tone: "primary" | "neutral";
  bookings: Awaited<ReturnType<typeof getBookingsForStudent>>;
  dateFmt: Intl.DateTimeFormat;
  timeFmt: Intl.DateTimeFormat;
}) {
  const chip = tone === "primary" ? "chip chip-primary" : "chip chip-neutral";
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <span className={chip}>{count}</span>
      </div>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="card-premium flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-xs font-semibold text-foreground">
                {getInitials(booking.tutor.user.name ?? "?")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-foreground">
                    {booking.subject}
                  </p>
                  <span
                    className={statusChip[booking.status] ?? "chip chip-neutral"}
                  >
                    {booking.status.toLowerCase()}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  <Users className="me-1 inline h-3.5 w-3.5" aria-hidden />
                  {booking.tutor.user.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" aria-hidden />
                    {dateFmt.format(new Date(booking.startTime))}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden />
                    {timeFmt.format(new Date(booking.startTime))} –{" "}
                    {timeFmt.format(new Date(booking.endTime))}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto sm:shrink-0">
              {booking.status !== "CANCELLED" && (
                <Link
                  href={`/session/${booking.id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <Video className="h-3.5 w-3.5" aria-hidden />
                  Open session
                </Link>
              )}
              {booking.meetingUrl &&
                (booking.status === "CONFIRMED" ||
                  booking.status === "PENDING") && (
                  <a
                    href={booking.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Join
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
