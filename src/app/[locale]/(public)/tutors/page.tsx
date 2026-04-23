import type { Metadata } from "next";
import { getTutors } from "@/services/tutor.service";
import { TutorCard } from "@/components/booking/tutor-card";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { NoResultsScene } from "@/components/illustrations/empty-scenes";
import { Users, BadgeCheck, Globe, Sparkles, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Find a Tutor | Schulab",
  description:
    "Browse verified STEM tutors and book personalized sessions for children ages 3-18 on Schulab.",
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

  const verifiedCount = allTutors.filter((t) => t.isVerified).length;
  const languagesCount = new Set(allTutors.flatMap((t) => t.languages)).size;

  const activeFilters = [subject, language].filter(Boolean).length;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-launch-gradient-soft py-14 sm:py-20">
        <div className="aurora-bg opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden />
            <span className="text-launch-gradient">Verified 1-on-1 experts</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Find a tutor your child will love
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Browse our verified tutors and book a personalized session. Every tutor is background-checked, student-rated, and trained in STEM pedagogy.
          </p>

          {/* Stats strip */}
          <div className="mt-6 grid max-w-xl grid-cols-3 gap-3">
            <Stat icon={<Users className="h-4 w-4" />} value={allTutors.length} label="Tutors" />
            <Stat icon={<BadgeCheck className="h-4 w-4" />} value={verifiedCount} label="Verified" />
            <Stat icon={<Globe className="h-4 w-4" />} value={languagesCount} label="Languages" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Filter bar */}
        <form
          method="get"
          className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft"
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              name="q"
              placeholder="Search tutors by name or subject…"
              className="input-pretty h-10 w-full rounded-lg border border-input bg-background ps-9 pe-3 text-sm focus-visible:outline-none"
            />
          </div>

          <select
            name="subject"
            defaultValue={subject ?? ""}
            aria-label="Subject"
            className="input-pretty h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
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
            aria-label="Language"
            className="input-pretty h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
          >
            <option value="">All Languages</option>
            {allLanguages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <select
            name="sort"
            defaultValue=""
            aria-label="Sort"
            className="input-pretty h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
          >
            <option value="">Sort: Best match</option>
            <option value="rating">Top rated</option>
            <option value="priceAsc">Price ↑</option>
            <option value="priceDesc">Price ↓</option>
            <option value="newest">Newest</option>
          </select>

          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Filter
          </button>
        </form>

        {/* Results summary */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{tutors.length}</span>{" "}
            {tutors.length === 1 ? "tutor" : "tutors"}
            {activeFilters > 0 && (
              <span>
                {" "}
                · {activeFilters} filter{activeFilters === 1 ? "" : "s"} applied
              </span>
            )}
          </p>
          {activeFilters > 0 && (
            <Link
              href="/tutors"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear all
            </Link>
          )}
        </div>

        {tutors.length === 0 ? (
          <EmptyState
            illustration={<NoResultsScene />}
            title="No tutors match those filters"
            description="Try removing a filter or browsing all of our verified tutors."
            action={{ label: "Browse all tutors", href: "/tutors" }}
            secondaryAction={{ label: "Become a tutor", href: "/tutors/register" }}
            tone="default"
            size="lg"
          />
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
                  isVerified: tutor.isVerified,
                  user: tutor.user,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 px-3 py-2 shadow-soft backdrop-blur">
      <div className="flex items-center gap-1.5 text-primary">
        {icon}
        <span className="font-display text-lg font-bold leading-none text-foreground">{value}+</span>
      </div>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
