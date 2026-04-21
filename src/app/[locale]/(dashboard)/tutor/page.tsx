import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getTutorByUserId } from "@/services/tutor.service";
import { getBookingsForTutor } from "@/services/booking.service";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Tutor Dashboard | Schulab" };

export default async function TutorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TUTOR") redirect("/dashboard");

  const [t, locale, tutor] = await Promise.all([
    getTranslations("tutorDashboard"),
    getLocale(),
    getTutorByUserId(session.user.id),
  ]);

  const firstName = session.user.name?.split(" ")[0] ?? "";

  if (!tutor) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("welcomeNew")}</p>
        </div>
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-5xl">🎓</p>
          <p className="mt-3 text-lg font-medium">{t("completeProfile")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("completeProfileBody")}
          </p>
          <Link
            href="/tutor/profile"
            className="mt-4 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            {t("setupProfile")}
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

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("welcomeBack", { name: firstName })}
          </p>
        </div>
        <Badge variant={tutor.isVerified ? "success" : "secondary"}>
          {tutor.isVerified ? t("verified") : t("pendingVerification")}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">{t("upcomingSessions")}</p>
          <p className="mt-1 text-3xl font-bold">{upcoming.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">{t("totalSessions")}</p>
          <p className="mt-1 text-3xl font-bold">{tutor.totalSessions}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">{t("rating")}</p>
          <p className="mt-1 text-3xl font-bold">
            {Number(tutor.rating) > 0
              ? `⭐ ${Number(tutor.rating).toFixed(1)}`
              : t("noRatings")}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">{t("recentBookings")}</h2>
        {recent.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            {t("noBookings")}
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
                    {dateFormatter.format(new Date(booking.startTime))} ·{" "}
                    {timeFormatter.format(new Date(booking.startTime))}
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
            className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("viewAllBookings")}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
