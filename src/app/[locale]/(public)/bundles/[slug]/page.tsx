import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  getBundleBySlug,
  getBundleProgress,
  getLocalizedField,
  getLocalizedList,
} from "@/services/bundle.service";
import { auth } from "@/lib/auth";
import { hasBundleAccess } from "@/lib/subscription-access";
import { getEventRecommendationsForBundle } from "@/services/event.service";
import { CompletionEventCard } from "@/components/events/completion-event-card";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CourseCard } from "@/components/course/course-card";
import {
  ReferenceSourceBadges,
  type ReferenceSourceBadge,
} from "@/components/course/reference-source-badges";
import { ageGroupLabels, levelLabels } from "@/components/course/catalog-labels";
import { BookOpen, CheckCircle2, Layers, Lock, Sparkles, Target, Trophy } from "lucide-react";

interface BundleDetailPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: BundleDetailPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const bundle = await getBundleBySlug(slug);
  if (!bundle) return { title: "Bundle Not Found" };
  return {
    title: `${getLocalizedField(bundle, "title", locale)} | Schulab`,
    description: getLocalizedField(bundle, "description", locale),
  };
}

export default async function BundleDetailPage({ params }: BundleDetailPageProps) {
  const { slug, locale } = await params;
  const [bundle, session] = await Promise.all([getBundleBySlug(slug), auth()]);

  if (!bundle) notFound();

  const eventRecs = await getEventRecommendationsForBundle(bundle.id);

  const title = getLocalizedField(bundle, "title", locale);
  const description = getLocalizedField(bundle, "description", locale);
  const objectives = getLocalizedList(bundle.learningObjectives, locale);
  const finalProjectTitle = getLocalizedField(bundle, "finalProjectTitle", locale);
  const finalProjectDescription = getLocalizedField(
    bundle,
    "finalProjectDescription",
    locale
  );

  // Progress is derived from the learner's enrollments (only when signed in).
  const progress = session?.user?.id
    ? await getBundleProgress(session.user.id, bundle)
    : null;

  // Subscription-first gate: bundles surface their access requirement here;
  // the constituent courses still enforce at enrolment time.
  const hasAccess = await hasBundleAccess(session?.user?.id ?? null, bundle);
  const locked = !hasAccess;

  const t = await getTranslations("referenceSources");
  const referenceSources: ReferenceSourceBadge[] = bundle.referenceSources.map(
    (link) => ({
      name: link.source.name,
      url: link.source.url,
      provider: link.source.provider,
      sourceType: link.source.sourceType,
      status: link.source.status,
    })
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Bundles", href: "/bundles" },
          { label: title },
        ]}
      />

      {/* Header */}
      <div className="mt-4 rounded-3xl border border-border bg-launch-gradient-soft p-6 sm:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs font-semibold shadow-sm">
          <Layers className="h-3.5 w-3.5 text-accent" aria-hidden />
          Bundle · {bundle.themeCategory}
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{description}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="chip chip-neutral">
            {ageGroupLabels[bundle.ageGroup] ?? bundle.ageGroup}
          </span>
          <span className="chip chip-neutral">
            {levelLabels[bundle.level] ?? bundle.level}
          </span>
          <span className="chip chip-neutral inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {bundle.courses.length} {bundle.courses.length === 1 ? "course" : "courses"}
          </span>
          {bundle.recommendedDurationWeeks != null && (
            <span className="chip chip-neutral">
              ~{bundle.recommendedDurationWeeks} weeks
            </span>
          )}
        </div>

        {progress && (
          <div className="mt-6 max-w-md">
            <div className="mb-1 flex items-center justify-between text-sm font-medium">
              <span>Your progress</span>
              <span>{progress.overallPercent}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-launch-gradient transition-all"
                style={{ width: `${progress.overallPercent}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {progress.completedCount} of {progress.totalCount} courses completed
              {progress.isComplete && " · Bundle complete 🎉"}
            </p>
          </div>
        )}
      </div>

      {/* Access banner */}
      {locked ? (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            <div>
              <p className="font-semibold text-amber-900">
                {bundle.requiredPlan
                  ? `Included with a ${bundle.requiredPlan.charAt(0) + bundle.requiredPlan.slice(1).toLowerCase()} plan or higher`
                  : "Subscription required"}
              </p>
              <p className="text-sm text-amber-800">
                {session?.user
                  ? "Upgrade your plan to unlock every course in this bundle."
                  : "Sign in and subscribe to unlock every course in this bundle."}
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-launch-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4" /> View plans
          </Link>
        </div>
      ) : (
        bundle.requiredPlan &&
        !bundle.isFree && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-medium text-green-800">
            <CheckCircle2 className="h-4 w-4" /> Included in your plan
          </div>
        )
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Courses */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 font-display text-2xl font-bold">Courses in this bundle</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {bundle.courses.map((course) => (
              <div key={course.id} className="relative">
                {!course.isRequired && (
                  <span className="absolute -top-2 left-3 z-10 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 shadow-sm">
                    Optional
                  </span>
                )}
                <CourseCard
                  course={{
                    ...course,
                    title: getLocalizedField(course, "title", locale),
                    description: getLocalizedField(course, "description", locale),
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: objectives + final project */}
        <div className="space-y-6">
          {objectives.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
                <Target className="h-5 w-5 text-primary" />
                What you&apos;ll learn
              </h3>
              <ul className="space-y-2">
                {objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {finalProjectTitle && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-soft">
              <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-bold">
                <Trophy className="h-5 w-5 text-accent" />
                Final project
              </h3>
              <p className="font-semibold">{finalProjectTitle}</p>
              {finalProjectDescription && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {finalProjectDescription}
                </p>
              )}
            </div>
          )}

          <ReferenceSourceBadges
            sources={referenceSources}
            heading={t("heading")}
            note={t("note")}
          />
        </div>
      </div>

      {/* Next event/competition this bundle prepares you for */}
      <CompletionEventCard recs={eventRecs} />
    </div>
  );
}
