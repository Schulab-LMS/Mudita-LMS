import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorByUserId } from "@/services/tutor.service";
import { getBookingsForTutor } from "@/services/booking.service";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";

export const metadata = { title: "Tutor Dashboard | Mudita LMS" };

export default async function TutorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TUTOR") redirect("/dashboard");

  const tutor = await getTutorByUserId(session.user.id);

  if (!tutor) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Tutor Dashboard</h1>
          <p className="text-muted-foreground">Welcome! Let&apos;s get you set up.</p>
        </div>
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-5xl">🎓</p>
          <p className="mt-3 text-lg font-medium">Complete your tutor profile</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up your profile to start accepting students.
          </p>
          <Link
            href="/tutor/profile"
            className="mt-4 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Set Up Profile
          </Link>
        </div>
      </div>
    );
  }

  const bookings = await getBookingsForTutor(tutor.id);
  const upcoming = bookings.filter(
    (b) => b.status === "PENDING" || b.status === "CONFIRMED"
  );
  const recent = bookings.slice(0, 5);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    COMPLETED: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tutor Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.name?.split(" ")[0]}!</p>
        </div>
        <Badge variant={tutor.isVerified ? "success" : "secondary"}>
          {tutor.isVerified ? "✓ Verified" : "Pending Verification"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
          <p className="mt-1 text-3xl font-bold">{upcoming.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Sessions</p>
          <p className="mt-1 text-3xl font-bold">{tutor.totalSessions}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Rating</p>
          <p className="mt-1 text-3xl font-bold">
            {Number(tutor.rating) > 0 ? `⭐ ${Number(tutor.rating).toFixed(1)}` : "No ratings yet"}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent Bookings</h2>
        {recent.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            No bookings yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-xl border bg-card p-4"
              >
                <div className="space-y-0.5">
                  <p className="font-medium">{booking.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.student.name} &bull;{" "}
                    {new Date(booking.startTime).toLocaleDateString()} at{" "}
                    {new Date(booking.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusColors[booking.status] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3">
          <Link
            href="/tutor/bookings"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            View all bookings →
          </Link>
        </div>
      </div>
    </div>
  );
}
