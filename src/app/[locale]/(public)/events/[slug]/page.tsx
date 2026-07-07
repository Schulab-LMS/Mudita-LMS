import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getEventBySlug } from "@/services/event.service";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import { CategoryIcon } from "@/components/illustrations/category-icons";
import {
  Globe,
  CalendarRange,
  ExternalLink,
  Route,
  ClipboardCheck,
  BookOpen,
  Layers,
  ShieldCheck,
} from "lucide-react";
import {
  ageRangeLabel,
  levelRangeLabel,
  regionLabel,
  seasonLabel,
  listingTone,
} from "@/components/events/event-format";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event" };
  return {
    title: `${event.title} | Events & Competitions | Schulab`,
    description: event.description.slice(0, 160),
  };
}

const REC_TONE: Record<string, string> = {
  PREREQUISITE: "bg-rose-100 text-rose-800",
  RECOMMENDED: "bg-emerald-100 text-emerald-800",
  ADVANCED_PREPARATION: "bg-indigo-100 text-indigo-800",
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const [event, t, session] = await Promise.all([getEventBySlug(slug), getTranslations("events"), auth()]);
  if (!event) notFound();

  const eligibility = (event.eligibilityRules ?? {}) as { notes?: string };
  const recs = [
    ...event.bundleRecommendations.map((r) => ({
      id: r.id,
      kind: "bundle" as const,
      title: r.bundle.title,
      slug: r.bundle.slug,
      type: r.recommendationType,
      reason: r.reason,
    })),
    ...event.courseRecommendations.map((r) => ({
      id: r.id,
      kind: "course" as const,
      title: r.course.title,
      slug: r.course.slug,
      type: r.recommendationType,
      reason: r.reason,
    })),
  ];

  // "Check Eligibility" routes signed-in students to their dashboard widget,
  // visitors to sign-in (preserving the destination).
  const eligibilityHref = session?.user ? "/student#events" : "/login?callbackUrl=/student";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: t("title"), href: "/events" },
          { label: event.title },
        ]}
      />

      {/* Hero */}
      <section className="mt-4 overflow-hidden rounded-3xl border border-border">
        <div className="relative bg-gradient-to-br from-[#4f3ff0] to-[#0ea5e9] p-6 sm:p-10">
          <div className="absolute inset-0 bg-noise opacity-30" aria-hidden />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="rounded-2xl bg-white/15 p-4 ring-1 ring-white/20 backdrop-blur-sm">
              <CategoryIcon category={event.category} size={56} className="text-white" />
            </div>
            <div className="text-white">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
                {event.officialProvider}
              </p>
              <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{event.title}</h1>
              <p className="mt-1 text-white/90">{event.eventType}</p>
            </div>
            <span
              className={`absolute top-0 end-0 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm ${listingTone(
                event.listingStatus
              )}`}
            >
              {t(event.listingStatus === "OPTIONAL" ? "optional" : event.listingStatus === "ARCHIVED" ? "archived" : "active")}
            </span>
          </div>
        </div>

        {/* Metadata strip */}
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
          <Meta label={t("ageRange")} value={ageRangeLabel(event.ageMin, event.ageMax)} />
          <Meta label={t("level")} value={levelRangeLabel(event.levelMin, event.levelMax)} />
          <Meta label={t("region")} value={regionLabel(event.region)} icon={<Globe className="h-3.5 w-3.5" />} />
          <Meta
            label={t("season")}
            value={seasonLabel(event.seasonMonths) || t("allYear")}
            icon={<CalendarRange className="h-3.5 w-3.5" />}
          />
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* About */}
          <section>
            <h2 className="font-display text-xl font-bold">About</h2>
            <p className="mt-2 text-muted-foreground">{event.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {event.tracks.map((track) => (
                <span key={track} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {track}
                </span>
              ))}
            </div>
          </section>

          {/* Recommended preparation */}
          <section>
            <h2 className="font-display text-xl font-bold">{t("recommendedPrep")}</h2>
            {recs.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">—</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {recs.map((r) => (
                  <li key={r.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={r.kind === "bundle" ? `/bundles/${r.slug}` : `/courses/${r.slug}`}
                        className="inline-flex items-center gap-2 font-semibold text-foreground hover:text-primary"
                      >
                        {r.kind === "bundle" ? (
                          <Layers className="h-4 w-4 text-primary" aria-hidden />
                        ) : (
                          <BookOpen className="h-4 w-4 text-primary" aria-hidden />
                        )}
                        {r.title}
                      </Link>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${REC_TONE[r.type]}`}>
                        {t(`recommendation.${r.type}`)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{r.reason}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="font-display text-xl font-bold">{t("eligibility")}</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                {ageRangeLabel(event.ageMin, event.ageMax)} · {levelRangeLabel(event.levelMin, event.levelMax)}
              </li>
              {eligibility.notes ? (
                <li className="flex items-start gap-2">
                  <ClipboardCheck className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                  {eligibility.notes}
                </li>
              ) : null}
            </ul>
          </section>
        </div>

        {/* Sidebar — CTAs */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border p-5">
            <h3 className="font-display text-lg font-bold">Get started</h3>
            <div className="mt-4 space-y-2.5">
              {event.preparationPath ? (
                <Link
                  href={`/pathways/${event.preparationPath.slug}`}
                  className={buttonVariants({ variant: "default", className: "w-full" })}
                >
                  <Route className="h-4 w-4" aria-hidden />
                  {t("viewPrepPath")}
                </Link>
              ) : null}
              <Link
                href={eligibilityHref}
                className={buttonVariants({ variant: "secondary", className: "w-full" })}
              >
                <ClipboardCheck className="h-4 w-4" aria-hidden />
                {t("checkEligibility")}
              </Link>
              {event.officialUrl ? (
                <a
                  href={event.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "ghost", className: "w-full" })}
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  {t("visitOfficial")}
                </a>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-border p-5 text-sm">
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("provider")}</dt>
                <dd className="mt-0.5 font-medium text-foreground">{event.officialProvider}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("eventType")}</dt>
                <dd className="mt-0.5 font-medium text-foreground">{event.eventType}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Meta({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 inline-flex items-center gap-1.5 font-semibold text-foreground">
        {icon}
        {value}
      </p>
    </div>
  );
}
