import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorByUserId } from "@/services/tutor.service";
import { AvailabilityGrid } from "./availability-grid";

export const metadata = { title: "Availability | Mudita LMS" };

export default async function TutorAvailabilityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TUTOR") redirect("/dashboard");

  const tutor = await getTutorByUserId(session.user.id);

  const initialSlots = tutor?.availability.map((slot) => ({
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
  })) ?? [];

  return <AvailabilityGrid initialSlots={initialSlots} />;
}
