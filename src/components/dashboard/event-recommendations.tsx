import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { EligibilityResult, EventReadiness } from "@/services/event.service";
import { ageRangeLabel } from "@/components/events/event-format";
import { Sparkles, ArrowRight, Route, CheckCircle2, CircleDashed, Trophy } from "lucide-react";

interface Props {
  result: EligibilityResult;
}

/** Student dashboard section: "ready" + "almost ready" external events, derived
 *  from completed courses/bundles by the eligibility engine. */
export async function EventRecommendations({ result }: Props) {
  const t = await getTranslations("events");
  const { ready, almostReady, ageKnown } = result;

  if (ready.length === 0 && almostReady.length === 0) {
    return (
      <section id="events">
        <SectionHeading title={t("dashboard.readyTitle")} />
        <div className="card-premium flex items-center justify-between gap-4 p-5">
          <p className="text-sm text-muted-foreground">{t("dashboard.empty")}</p>
          <Link href="/events" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            {t("dashboard.viewAll")}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="space-y-6">
      {ready.length > 0 && (
        <div>
          <SectionHeading title={t("dashboard.readyTitle")} subtitle={t("dashboard.readySubtitle")} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ready.map((r) => (
              <ReadyCard key={r.event.id} readiness={r} prepPathLabel={t("dashboard.prepPath")} />
            ))}
          </div>
        </div>
      )}

      {almostReady.length > 0 && (
        <div>
          <SectionHeading title={t("dashboard.almostTitle")} subtitle={t("dashboard.almostSubtitle")} />
          <div className="grid gap-4 sm:grid-cols-2">
            {almostReady.map((r) => (
              <AlmostCard key={r.event.id} readiness={r} needLabel={t("dashboard.needTitle")} />
            ))}
          </div>
        </div>
      )}

      {!ageKnown && (
        <p className="text-xs text-muted-foreground">{t("dashboard.addDob")}</p>
      )}
    </section>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <Sparkles className="h-5 w-5 text-primary" />
        {title}
      </h2>
      {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function ReadyCard({ readiness, prepPathLabel }: { readiness: EventReadiness; prepPathLabel: string }) {
  const { event, satisfied } = readiness;
  return (
    <div className="card-premium flex flex-col gap-3 p-5">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
        <Trophy className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {event.officialProvider} · {ageRangeLabel(event.ageMin, event.ageMax)}
        </p>
        <Link href={`/events/${event.slug}`} className="mt-1 block font-semibold text-foreground hover:text-primary">
          {event.title}
        </Link>
      </div>
      <ul className="space-y-1 text-xs text-muted-foreground">
        {satisfied.slice(0, 2).map((s) => (
          <li key={`${s.kind}-${s.slug}`} className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span className="line-clamp-2">{s.reason}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center gap-3 pt-1">
        {event.preparationPath && (
          <Link
            href={`/pathways/${event.preparationPath.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Route className="h-3.5 w-3.5" />
            {prepPathLabel}
          </Link>
        )}
        <Link href={`/events/${event.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}

function AlmostCard({ readiness, needLabel }: { readiness: EventReadiness; needLabel: string }) {
  const { event, missing } = readiness;
  return (
    <div className="card-premium flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <Link href={`/events/${event.slug}`} className="font-semibold text-foreground hover:text-primary">
          {event.title}
        </Link>
        <span className="shrink-0 text-xs text-muted-foreground">{ageRangeLabel(event.ageMin, event.ageMax)}</span>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{needLabel}</p>
        <ul className="mt-1.5 space-y-1 text-sm">
          {missing.slice(0, 3).map((m) => (
            <li key={`${m.kind}-${m.slug}`} className="flex items-center gap-1.5 text-muted-foreground">
              <CircleDashed className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <Link
                href={m.kind === "bundle" ? `/bundles/${m.slug}` : `/courses/${m.slug}`}
                className="hover:text-primary hover:underline"
              >
                {m.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
