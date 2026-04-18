import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBookingsForStudent } from "@/services/booking.service";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";

export const metadata = { title: "My Bookings | Schulab" };

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" }> = {
  PENDING: { label: "Pending", variant: "default" },
  CONFIRMED: { label: "Confirmed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  COMPLETED: { label: "Completed", variant: "secondary" },
};

export default async function StudentBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const bookings = await getBookingsForStudent(session.user.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">{bookings.length} session{bookings.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link
          href="/tutors"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Book a Session
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-5xl">📅</p>
          <p className="mt-3 text-lg font-medium">No bookings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse our tutors and book your first session!
          </p>
          <Link
            href="/tutors"
            className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Find a Tutor
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const config = statusConfig[booking.status] ?? { label: booking.status, variant: "outline" as const };
            return (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-xl border bg-card p-5"
              >
                <div className="space-y-1">
                  <p className="font-semibold">{booking.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    Tutor: {booking.tutor.user.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.startTime).toLocaleDateString()} at{" "}
                    {new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" – "}
                    {new Date(booking.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
