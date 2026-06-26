import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CategoryIcon } from "@/components/illustrations/category-icons";
import { Trophy, ArrowRight } from "lucide-react";

interface EventRec {
  id: string;
  reason: string;
  recommendationType: string;
  competition: {
    slug: string;
    title: string;
    officialProvider: string | null;
    eventType: string | null;
    category?: string;
  };
}

/** "Next competition/event you can prepare for" — shown on a course/bundle
 *  completion surface. Renders nothing when there are no recommendations. */
export async function CompletionEventCard({ recs }: { recs: EventRec[] }) {
  if (!recs || recs.length === 0) return null;
  const t = await getTranslations("events");
  // Prefer RECOMMENDED, then PREREQUISITE, then ADVANCED_PREPARATION.
  const order: Record<string, number> = { RECOMMENDED: 0, PREREQUISITE: 1, ADVANCED_PREPARATION: 2 };
  const sorted = [...recs].sort((a, b) => (order[a.recommendationType] ?? 9) - (order[b.recommendationType] ?? 9));
  const top = sorted.slice(0, 3);

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-500" aria-hidden />
        <div>
          <h2 className="font-display text-xl font-bold">{t("completion.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("completion.subtitle")}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {top.map((r) => (
          <Link
            key={r.id}
            href={`/events/${r.competition.slug}`}
            className="group flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 transition-all hover:-translate-y-0.5 hover:shadow-elev"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-launch-gradient-soft">
              <CategoryIcon category={r.competition.category || "rocket"} size={28} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {r.competition.officialProvider}
              </p>
              <h3 className="truncate font-display font-bold leading-tight transition-colors group-hover:text-primary">
                {r.competition.title}
              </h3>
            </div>
            <ArrowRight className="ms-auto h-4 w-4 shrink-0 text-primary rtl:rotate-180" aria-hidden />
          </Link>
        ))}
      </div>
    </section>
  );
}
