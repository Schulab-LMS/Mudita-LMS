import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorByUserId } from "@/services/tutor.service";
import { ProfileForm } from "./profile-form";
import { PageHeader } from "@/components/ui/page-header";
import { ShieldCheck, Eye, User as UserIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";

export const metadata = { title: "Tutor Profile | Schulab" };

export default async function TutorProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

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

  const isVerified = tutor?.isVerified ?? false;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Tutor Profile"
        description="Update your public profile to attract more students. Changes appear on /tutors after saving."
        breadcrumbs={[
          { label: "Tutor", href: "/tutor" },
          { label: "Profile" },
        ]}
        icon={<UserIcon className="h-5 w-5" />}
        actions={
          tutor ? (
            <Link
              href="/tutors"
              target="_blank"
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden />
              View public page
            </Link>
          ) : undefined
        }
      />

      {/* Verification status banner */}
      {tutor && (
        <div
          className={`rounded-2xl border p-4 ${
            isVerified
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-amber-500/30 bg-amber-500/5"
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                isVerified
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {isVerified
                  ? "Your profile is verified"
                  : "Verification pending"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isVerified
                  ? "Students can find and book you through the public tutor directory."
                  : "Complete your profile and upload credentials. Our team reviews applications within 48 hours."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card-premium p-6">
        <ProfileForm initial={initial} />
      </div>
    </div>
  );
}
