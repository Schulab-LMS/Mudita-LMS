/**
 * Presentational sections for the public course preview page.
 *
 * All server components (no "use client") — they receive already-resolved
 * data + a next-intl translator from the page so there's a single data-fetch
 * pass. Kept here to keep the route file readable.
 */
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/avatar";
import { RatingStars } from "@/components/ui/rating-stars";
import type {
  ContentMix,
  HandsOnProject,
  LessonKind,
} from "@/lib/course-preview";
import {
  Award,
  BadgeCheck,
  Brain,
  CheckCircle2,
  FileText,
  FlaskConical,
  Flame,
  ListChecks,
  MonitorPlay,
  Play,
  Presentation,
  Quote,
  Sparkles,
  Star,
  Trophy,
  Wrench,
} from "lucide-react";

// next-intl's translator has heavy overloads; the preview only needs the
// callable surface, so a loose alias keeps the props honest without fighting
// the generics.
type Translator = (key: string, values?: Record<string, string | number>) => string;

/* ------------------------------------------------------------------ */
/* Lesson type icon + badge                                            */
/* ------------------------------------------------------------------ */

const KIND_META: Record<
  LessonKind,
  { icon: typeof Play; tone: string; labelKey: string }
> = {
  video: { icon: Play, tone: "text-sky-500", labelKey: "kindVideo" },
  reading: { icon: FileText, tone: "text-violet-500", labelKey: "kindReading" },
  quiz: { icon: ListChecks, tone: "text-amber-500", labelKey: "kindQuiz" },
  interactive: { icon: Brain, tone: "text-fuchsia-500", labelKey: "kindInteractive" },
  presentation: { icon: Presentation, tone: "text-emerald-500", labelKey: "kindSlides" },
  project: { icon: Wrench, tone: "text-orange-500", labelKey: "kindProject" },
};

export function LessonKindIcon({
  kind,
  className,
}: {
  kind: LessonKind;
  className?: string;
}) {
  const Icon = KIND_META[kind].icon;
  return (
    <Icon
      className={`${KIND_META[kind].tone} ${className ?? "h-4 w-4"} shrink-0`}
      aria-hidden
    />
  );
}

export function lessonKindLabel(kind: LessonKind, t: Translator): string {
  return t(KIND_META[kind].labelKey);
}

/* ------------------------------------------------------------------ */
/* What's Inside — content mix stat cards                              */
/* ------------------------------------------------------------------ */

export function ContentMixSection({
  mix,
  t,
}: {
  mix: ContentMix;
  t: Translator;
}) {
  const cards = [
    { value: mix.videos, label: t("mixVideos"), icon: MonitorPlay, tone: "text-sky-500" },
    { value: mix.presentations, label: t("mixSlides"), icon: Presentation, tone: "text-emerald-500" },
    { value: mix.interactive, label: t("mixInteractive"), icon: Brain, tone: "text-fuchsia-500" },
    { value: mix.quizzes, label: t("mixQuizzes"), icon: ListChecks, tone: "text-amber-500" },
    { value: mix.projects, label: t("mixProjects"), icon: Wrench, tone: "text-orange-500" },
    { value: mix.readings, label: t("mixReadings"), icon: FileText, tone: "text-violet-500" },
  ].filter((c) => c.value > 0);

  if (cards.length === 0) return null;

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="mb-1 flex items-center gap-2 text-xl font-bold">
        <Sparkles className="h-5 w-5 text-primary" />
        {t("whatsInside")}
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">{t("whatsInsideSubtitle")}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/30 p-4 text-center"
            >
              <Icon className={`mb-2 h-6 w-6 ${c.tone}`} aria-hidden />
              <span className="font-display text-2xl font-bold leading-none">{c.value}</span>
              <span className="mt-1 text-xs text-muted-foreground">{c.label}</span>
            </div>
          );
        })}
      </div>
      {mix.totalQuestions > 0 && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {t("totalQuizQuestions", { count: mix.totalQuestions })}
        </p>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Hands-on projects showcase                                          */
/* ------------------------------------------------------------------ */

export function HandsOnProjectsSection({
  projects,
  t,
}: {
  projects: HandsOnProject[];
  t: Translator;
}) {
  if (projects.length === 0) return null;
  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="mb-1 flex items-center gap-2 text-xl font-bold">
        <FlaskConical className="h-5 w-5 text-primary" />
        {t("handsOnProjects")}
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">{t("handsOnProjectsSubtitle")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {projects.map((project, idx) => (
          <div
            key={project.id}
            className="flex items-start gap-3 rounded-xl border border-border bg-gradient-to-br from-orange-500/5 to-transparent p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 font-display text-sm font-bold text-orange-600">
              {idx + 1}
            </span>
            <div className="min-w-0">
              <p className="font-semibold leading-tight">{project.title}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {project.moduleTitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Instructor                                                          */
/* ------------------------------------------------------------------ */

export interface PreviewInstructor {
  name: string;
  avatar: string | null;
  headline: string | null;
  bio: string | null;
  subjects: string[];
  rating: number;
  isVerified: boolean;
}

export function InstructorSection({
  instructor,
  t,
}: {
  instructor: PreviewInstructor;
  t: Translator;
}) {
  const initials = instructor.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">
        <BadgeCheck className="h-5 w-5 text-primary" />
        {t("instructorTitle")}
      </h2>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar
          src={instructor.avatar ?? undefined}
          alt={instructor.name}
          fallback={initials}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold">{instructor.name}</h3>
            {instructor.isVerified && (
              <span className="chip chip-success">
                <BadgeCheck className="h-3 w-3" /> {t("instructorVerified")}
              </span>
            )}
          </div>
          {instructor.headline && (
            <p className="mt-0.5 text-sm font-medium text-primary">{instructor.headline}</p>
          )}
          {instructor.rating > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-sm">
              <RatingStars value={instructor.rating} showValue size="sm" />
              <span className="text-muted-foreground">{t("instructorRating")}</span>
            </div>
          )}
          {instructor.bio && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {instructor.bio}
            </p>
          )}
          {instructor.subjects.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {instructor.subjects.slice(0, 8).map((subject) => (
                <span key={subject} className="chip chip-neutral">
                  {subject}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Student engagement features                                        */
/* ------------------------------------------------------------------ */

export function EngagementSection({ t }: { t: Translator }) {
  const items = [
    { icon: Trophy, tone: "text-amber-500", title: t("engageBadgesTitle"), body: t("engageBadgesBody") },
    { icon: Star, tone: "text-sky-500", title: t("engagePointsTitle"), body: t("engagePointsBody") },
    { icon: Flame, tone: "text-orange-500", title: t("engageStreaksTitle"), body: t("engageStreaksBody") },
    { icon: ListChecks, tone: "text-fuchsia-500", title: t("engageQuizzesTitle"), body: t("engageQuizzesBody") },
    { icon: Award, tone: "text-emerald-500", title: t("engageCertificateTitle"), body: t("engageCertificateBody") },
    { icon: MonitorPlay, tone: "text-violet-500", title: t("engageProgressTitle"), body: t("engageProgressBody") },
  ];
  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="mb-1 flex items-center gap-2 text-xl font-bold">
        <Sparkles className="h-5 w-5 text-primary" />
        {t("engagementTitle")}
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">{t("engagementSubtitle")}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50">
                <Icon className={`h-5 w-5 ${item.tone}`} aria-hidden />
              </span>
              <div>
                <p className="font-semibold leading-tight">{item.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Student reviews                                                     */
/* ------------------------------------------------------------------ */

export interface PreviewReview {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  user: { name: string; avatar: string | null };
}

export function ReviewsSection({
  reviews,
  averageRating,
  reviewCount,
  t,
}: {
  reviews: PreviewReview[];
  averageRating: number;
  reviewCount: number;
  t: Translator;
}) {
  if (reviews.length === 0) return null;
  return (
    <section className="mt-12">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold">{t("reviewsTitle")}</h2>
        <div className="flex items-center gap-2">
          <RatingStars value={averageRating} showValue size="sm" />
          <span className="text-sm text-muted-foreground">
            {t("reviewsCount", { count: reviewCount })}
          </span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((review) => {
          const initials = review.user.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <figure
              key={review.id}
              className="relative rounded-2xl border border-border bg-card p-5"
            >
              <Quote className="absolute end-5 top-5 h-6 w-6 text-muted/40" aria-hidden />
              <RatingStars value={review.rating} size="sm" />
              {review.title && (
                <figcaption className="mt-2 font-semibold leading-tight">
                  {review.title}
                </figcaption>
              )}
              {review.body && (
                <blockquote className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {review.body}
                </blockquote>
              )}
              <div className="mt-4 flex items-center gap-2">
                <Avatar
                  src={review.user.avatar ?? undefined}
                  alt={review.user.name}
                  fallback={initials}
                  size="sm"
                />
                <span className="text-sm font-medium">{review.user.name}</span>
              </div>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Enrollment motivation banner                                        */
/* ------------------------------------------------------------------ */

export function EnrollMotivationBanner({
  isAuthed,
  ctaHref,
  ctaLabel,
  t,
}: {
  isAuthed: boolean;
  ctaHref: string;
  ctaLabel: string;
  t: Translator;
}) {
  return (
    <section className="mt-12 overflow-hidden rounded-2xl bg-launch-gradient p-8 text-center text-white sm:p-10">
      <h2 className="font-display text-2xl font-bold sm:text-3xl">{t("ctaTitle")}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-white/90 sm:text-base">
        {t("ctaSubtitle")}
      </p>
      <ul className="mx-auto mt-5 flex max-w-md flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/90">
        <li className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> {t("ctaPointCertificate")}
        </li>
        <li className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> {t("ctaPointAccess")}
        </li>
        <li className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> {t("ctaPointSafe")}
        </li>
      </ul>
      {!isAuthed && (
        <Link
          href={ctaHref}
          className="shine mt-6 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          {ctaLabel}
        </Link>
      )}
    </section>
  );
}
