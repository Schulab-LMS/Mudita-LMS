import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getEvents } from "@/services/event.service";
import { CategoryIcon } from "@/components/illustrations/category-icons";
import { NoNotificationsScene } from "@/components/illustrations/empty-scenes";
import { EmptyState } from "@/components/shared/empty-state";
import { Sparkles, Globe, CalendarRange, Layers, ArrowRight, BookOpenCheck } from "lucide-react";
import {
  ageRangeLabel,
  levelRangeLabel,
  regionLabel,
  seasonLabel,
  listingTone,
} from "@/components/events/event-format";

export const metadata: Metadata = {
  title: "Events & Competitions | Schulab",
  description:
    "Reputable global STEM events and competitions your child can prepare for on Schulab — robotics, space coding, computational thinking and digital making.",
};

export default async function EventsPage() {
  const [events, t] = await Promise.all([getEvents(), getTranslations("events")]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-launch-gradient-soft py-14 sm:py-20">
        <div className="aurora-bg opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden />
            <span className="text-launch-gradient">Prepare · Compete · Grow</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {events.length === 0 ? (
          <EmptyState
            illustration={<NoNotificationsScene />}
            title={t("empty")}
            description={t("subtitle")}
            action={{ label: "Browse courses", href: "/courses" }}
            tone="first-use"
            size="lg"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const hasPrep =
                Boolean(event.preparationPath) ||
                event.courseRecommendations.length + event.bundleRecommendations.length > 0;
              const tone = listingTone(event.listingStatus);
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="card-premium group relative flex flex-col overflow-hidden"
                >
                  <div className="relative h-28 bg-gradient-to-br from-[#4f3ff0] to-[#0ea5e9]">
                    <div className="absolute inset-0 bg-noise opacity-30" aria-hidden />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm ring-1 ring-white/20">
                        <CategoryIcon category={event.category} size={44} className="text-white" />
                      </div>
                    </div>
                    <span
                      className={`absolute top-3 end-3 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm ${tone}`}
                    >
                      {t(event.listingStatus === "OPTIONAL" ? "optional" : event.listingStatus === "ARCHIVED" ? "archived" : "active")}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {event.officialProvider}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
                      {event.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-medium text-foreground">
                        {ageRangeLabel(event.ageMin, event.ageMax)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-medium text-foreground">
                        {levelRangeLabel(event.levelMin, event.levelMax)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-medium text-foreground">
                        <Globe className="h-3 w-3 text-primary" aria-hidden />
                        {regionLabel(event.region)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {event.tracks.slice(0, 3).map((track) => (
                        <span key={track} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {track}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarRange className="h-3.5 w-3.5 text-primary" aria-hidden />
                        {seasonLabel(event.seasonMonths) || t("allYear")}
                      </span>
                      {hasPrep && (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <BookOpenCheck className="h-3.5 w-3.5" aria-hidden />
                          {t("prepAvailable")}
                        </span>
                      )}
                    </div>

                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5">
                      <Layers className="h-4 w-4" aria-hidden />
                      View details
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
