import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ageInYears } from "@/lib/compliance";
import { getCourses } from "@/services/course.service";
import { Link } from "@/i18n/navigation";
import { CourseGrid } from "@/components/course/course-grid";
import { CourseFilters } from "@/components/course/course-filters";
import { CatalogTabs } from "@/components/course/catalog-tabs";
import { Sparkles, Search as SearchIcon } from "lucide-react";
import type { RankingSignals } from "@/services/catalog-ranking.service";

interface CoursesPageProps {
  searchParams: Promise<{
    q?: string;
    ageGroup?: string;
    category?: string;
    level?: string;
    sourceKey?: string;
    maxDuration?: string;
    certificate?: string;
  }>;
}

export const metadata = {
  title: "Courses | Schulab",
  description: "Browse our STEM courses designed for children ages 3–18.",
};

const POPULAR_SEARCHES = ["Robotics", "Python", "Math games", "Space exploration", "Art & design"];

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;

  // Personalised signals (logged-in users with completed onboarding only —
  // anonymous browsers see the popularity-ordered catalog).
  const session = await auth();
  let signals: RankingSignals | undefined;
  if (session?.user?.id) {
    const [profile, user] = await Promise.all([
      db.onboardingProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          completedAt: true,
          preferredSubjects: true,
          goals: true,
          interests: true,
          experience: true,
        },
      }),
      db.user.findUnique({
        where: { id: session.user.id },
        select: { dateOfBirth: true },
      }),
    ]);
    if (profile?.completedAt) {
      signals = {
        preferredSubjects: profile.preferredSubjects,
        goals: profile.goals,
        interests: profile.interests,
        experience: profile.experience,
        ageYears: user?.dateOfBirth ? ageInYears(user.dateOfBirth) : null,
      };
    }
  }

  // Parse the numeric duration bucket (minutes); ignore anything non-numeric.
  const maxDurationParam = params.maxDuration ? Number(params.maxDuration) : undefined;
  const maxDuration =
    typeof maxDurationParam === "number" && Number.isFinite(maxDurationParam)
      ? maxDurationParam
      : undefined;
  const certificate = params.certificate === "true";

  const [courses, referenceSources, t] = await Promise.all([
    getCourses({
      search: params.q,
      ageGroup: params.ageGroup,
      category: params.category,
      level: params.level,
      sourceKey: params.sourceKey,
      maxDuration,
      certificate,
      signals,
    }),
    // Active reference sources for the catalog Source dropdown.
    db.referenceSource.findMany({
      where: { status: { in: ["ACTIVE", "ENRICHMENT", "OPTIONAL"] } },
      select: { key: true, name: true },
      orderBy: { name: "asc" },
    }),
    getTranslations("courses"),
  ]);

  const activeFilterCount = [
    params.ageGroup,
    params.category,
    params.level,
    params.q,
    params.sourceKey,
    params.maxDuration,
    certificate ? "1" : "",
  ].filter(Boolean).length;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-launch-gradient-soft py-14 sm:py-20">
        <div className="aurora-bg opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden />
            <span className="text-launch-gradient">{t("exploreCatalog")}</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {t("catalogHint", { count: courses.length })}
          </p>

          {/* Hero search — GET form pushes to /courses?q=… */}
          <form action="/courses" method="get" className="mt-6 flex max-w-2xl items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                name="q"
                type="search"
                defaultValue={params.q ?? ""}
                placeholder="Search courses, skills, or topics…"
                className="input-pretty h-12 w-full rounded-xl border border-border bg-card ps-10 pe-4 text-sm focus-visible:outline-none"
              />
            </div>
            <button
              type="submit"
              className="shine inline-flex h-12 items-center justify-center rounded-xl bg-launch-gradient px-5 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
            >
              Search
            </button>
          </form>

          {/* Popular searches */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <Link
                key={term}
                href={{ pathname: "/courses", query: { q: term } }}
                className="chip chip-neutral transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <CatalogTabs />
        </div>
        <div className="mb-6">
          <Suspense>
            <CourseFilters sources={referenceSources} />
          </Suspense>
        </div>

        {/* Results summary */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{courses.length}</span>{" "}
            {courses.length === 1 ? "course" : "courses"}
            {activeFilterCount > 0 && (
              <span> · {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"} applied</span>
            )}
          </p>
          {activeFilterCount > 0 && (
            <Link
              href="/courses"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear all
            </Link>
          )}
        </div>

        <CourseGrid courses={courses} />
      </div>
    </div>
  );
}
