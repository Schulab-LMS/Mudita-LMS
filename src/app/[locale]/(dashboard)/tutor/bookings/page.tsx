import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorByUserId } from "@/services/tutor.service";
import { getBookingsForTutor } from "@/services/booking.service";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoNotificationsScene } from "@/components/illustrations/empty-scenes";
import { cancelBooking } from "@/actions/booking.actions";
import { Link } from "@/i18n/navigation";
import { Calendar, ExternalLink, Clock, Video } from "lucide-react";
import { getInitials } from "@/lib/utils";

export const metadata = { title: "Tutor Bookings" };

const statusChip: Record<string, string> = {
  PENDING: "chip chip-accent",
  CONFIRMED: "chip chip-success",
  CANCELLED: "chip chip-neutral",
  COMPLETED: "chip chip-primary",
};

export default async function TutorBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tutor = await getTutorByUserId(session.user.id);
  if (!tutor) redirect("/tutor");

  const bookings = await getBookingsForTutor(tutor.id);

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
        title="Bookings"
        description={`${upcoming.length} upcoming · ${past.length} past · ${bookings.length} total`}
        breadcrumbs={[
          { label: "Tutor", href: "/tutor" },
          { label: "Bookings" },
        ]}
        icon={<Calendar className="h-5 w-5" />}
      />

      {bookings.length === 0 ? (
        <EmptyState
          illustration={<NoNotificationsScene />}
          title="No bookings yet"
          description="Students will be able to book sessions with you once your profile is verified and you've set availability."
          action={{
            label: "Set availability",
            href: "/tutor/availability",
          }}
          tone="default"
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
              statusChip={statusChip}
              showCancel
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
              statusChip={statusChip}
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
  statusChip,
  showCancel,
}: {
  title: string;
  count: number;
  tone: "primary" | "neutral";
  bookings: Awaited<ReturnType<typeof getBookingsForTutor>>;
  dateFmt: Intl.DateTimeFormat;
  timeFmt: Intl.DateTimeFormat;
  statusChip: Record<string, string>;
  showCancel?: boolean;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <span
          className={tone === "primary" ? "chip chip-primary" : "chip chip-neutral"}
        >
          {count}
        </span>
      </div>
      <div className="space-y-3">
        {bookings.map((booking) => {
          const canCancel =
            showCancel &&
            (booking.status === "PENDING" || booking.status === "CONFIRMED");

          return (
            <div
              key={booking.id}
              className="card-premium flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-xs font-semibold text-foreground">
                  {getInitials(booking.student.name)}
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
                    Student: {booking.student.name}
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
                  {booking.notes && (
                    <p className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-xs italic text-muted-foreground">
                      &ldquo;{booking.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                {booking.status !== "CANCELLED" && (
                  <Link
                    href={`/session/${booking.id}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <Video className="h-3.5 w-3.5" aria-hidden />
                    Open session
                  </Link>
                )}
                {booking.meetingUrl && (
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
                {canCancel && (
                  <form
                    action={async () => {
                      "use server";
                      await cancelBooking(booking.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center rounded-lg border border-destructive/40 px-3 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
