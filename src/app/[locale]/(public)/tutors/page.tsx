import type { Metadata } from "next";
import { getTutors } from "@/services/tutor.service";
import { TutorCard } from "@/components/booking/tutor-card";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Find a Tutor | Mudita LMS",
  description:
    "Browse verified STEM tutors and book personalized sessions for children ages 3-18 on Mudita LMS.",
};

interface TutorsPageProps {
  searchParams: Promise<{ subject?: string; language?: string }>;
}

export default async function TutorsPage({ searchParams }: TutorsPageProps) {
  const params = await searchParams;
  const subject = params.subject || undefined;
  const language = params.language || undefined;

  const tutors = await getTutors({ subject, language });

  // Collect unique subjects and languages for filters
  const allTutors = await getTutors();
  const allSubjects = Array.from(new Set(allTutors.flatMap((t) => t.subjects))).sort();
  const allLanguages = Array.from(new Set(allTutors.flatMap((t) => t.languages))).sort();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Find a Tutor</h1>
        <p className="mt-1 text-muted-foreground">
          Browse our verified tutors and book a personalized session.
        </p>
      </div>

      {/* Filters */}
      <form method="get" className="flex flex-wrap gap-3">
        <select
          name="subject"
          defaultValue={subject ?? ""}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Subjects</option>
          {allSubjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          name="language"
          defaultValue={language ?? ""}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Languages</option>
          {allLanguages.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Filter
        </button>
        {(subject || language) && (
          <Link
            href="/tutors"
            className="inline-flex h-10 items-center rounded-lg border border-input px-4 text-sm transition-colors hover:bg-muted"
          >
            Clear
          </Link>
        )}
      </form>

      {tutors.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-5xl">🔍</p>
          <p className="mt-3 text-lg font-medium">No tutors found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or check back soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={{
                id: tutor.id,
                bio: tutor.bio,
                subjects: tutor.subjects,
                languages: tutor.languages,
                hourlyRate: Number(tutor.hourlyRate),
                rating: Number(tutor.rating),
                user: tutor.user,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
