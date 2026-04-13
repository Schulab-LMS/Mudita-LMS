import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorByUserId } from "@/services/tutor.service";
import { getBookingsForTutor } from "@/services/booking.service";
import { Badge } from "@/components/ui/badge";
import { cancelBooking } from "@/actions/booking.actions";

export const metadata = { title: "Tutor Bookings | Mudita LMS" };

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" }> = {
  PENDING: { label: "Pending", variant: "default" },
  CONFIRMED: { label: "Confirmed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  COMPLETED: { label: "Completed", variant: "secondary" },
};

export default async function TutorBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TUTOR") redirect("/dashboard");

  const tutor = await getTutorByUserId(session.user.id);
  if (!tutor) redirect("/tutor");

  const bookings = await getBookingsForTutor(tutor.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-5xl">📅</p>
          <p className="mt-3 text-lg font-medium">No bookings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Students will be able to book sessions with you once your profile is verified.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const config = statusConfig[booking.status] ?? { label: booking.status, variant: "outline" as const };
            const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";

            return (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-xl border bg-card p-5"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{booking.subject}</p>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Student: {booking.student.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.startTime).toLocaleDateString()} at{" "}
                    {new Date(booking.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" – "}
                    {new Date(booking.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {booking.notes && (
                    <p className="text-xs text-muted-foreground italic">
                      &quot;{booking.notes}&quot;
                    </p>
                  )}
                </div>
                {canCancel && (
                  <form
                    action={async () => {
                      "use server";
                      await cancelBooking(booking.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-lg border border-destructive px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
