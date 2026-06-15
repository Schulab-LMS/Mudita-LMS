import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorByUserId } from "@/services/tutor.service";
import { AvailabilityGrid } from "./availability-grid";
import { PageHeader } from "@/components/ui/page-header";
import { Calendar, Info } from "lucide-react";

export const metadata = { title: "Availability | Schulab" };

export default async function TutorAvailabilityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tutor = await getTutorByUserId(session.user.id);

  const initialSlots =
    tutor?.availability.map((slot) => ({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
    })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Availability"
        description="Choose when students can book one-on-one sessions with you. All times are in your local timezone."
        breadcrumbs={[
          { label: "Tutor", href: "/tutor" },
          { label: "Availability" },
        ]}
        icon={<Calendar className="h-5 w-5" />}
      />

      {/* Helpful tip */}
      <div className="rounded-2xl border border-primary/20 bg-launch-gradient-soft p-4">
        <div className="flex items-start gap-2.5 text-sm">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            aria-hidden
          />
          <div>
            <p className="font-semibold text-foreground">How this works</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Click any slot to toggle it on or off. Students see only the
              slots you enable here, and they book directly from your public
              profile. You can change your availability any time — bookings
              already placed stay on your calendar.
            </p>
          </div>
        </div>
      </div>

      <div className="card-premium p-5 sm:p-6">
        <AvailabilityGrid initialSlots={initialSlots} />
      </div>
    </div>
  );
}
