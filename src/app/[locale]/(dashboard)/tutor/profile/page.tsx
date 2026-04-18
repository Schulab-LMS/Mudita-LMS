import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorByUserId } from "@/services/tutor.service";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Tutor Profile | Schulab" };

export default async function TutorProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TUTOR") redirect("/dashboard");

  const tutor = await getTutorByUserId(session.user.id);

  const initial = tutor
    ? {
        headline: tutor.headline,
        bio: tutor.bio,
        hourlyRate: String(tutor.hourlyRate),
        subjects: tutor.subjects,
        languages: tutor.languages,
      }
    : null;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Tutor Profile</h1>
        <p className="text-muted-foreground">
          Update your profile to attract more students.
        </p>
      </div>
      <ProfileForm initial={initial} />
    </div>
  );
}
