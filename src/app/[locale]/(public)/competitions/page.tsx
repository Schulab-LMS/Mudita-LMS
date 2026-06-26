import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getCompetitions } from "@/services/competition.service";
import { CategoryIcon } from "@/components/illustrations/category-icons";
import { NoNotificationsScene } from "@/components/illustrations/empty-scenes";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Trophy,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
  Flame,
  Hourglass,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Competitions | Schulab",
  description:
    "Join STEM competitions on Schulab. Showcase your skills and compete with students worldwide.",
};

interface StatusConfig {
  label: string;
  chip: string;
  Icon: typeof Trophy;
  bar: string; // gradient for the top bar on the card
}

const statusConfig: Record<string, StatusConfig> = {
  UPCOMING: {
    label: "Upcoming",
    chip: "chip chip-primary",
    Icon: Hourglass,
    bar: "from-[#4f3ff0] to-[#8b5cf6]",
  },
  REGISTRATION_OPEN: {
    label: "Register now",
    chip: "chip chip-success",
    Icon: Sparkles,
    bar: "from-[#34d399] to-[#0ea5e9]",
  },
  IN_PROGRESS: {
    label: "Live",
    chip: "chip chip-accent",
    Icon: Flame,
    bar: "from-[#ff8a3d] to-[#ef4444]",
  },
  JUDGING: {
    label: "Judging",
    chip: "chip chip-secondary",
    Icon: Hourglass,
    bar: "from-[#8b5cf6] to-[#ec4899]",
  },
  COMPLETED: {
    label: "Ended",
    chip: "chip chip-neutral",
    Icon: CheckCircle2,
    bar: "from-[#94a3b8] to-[#64748b]",
  },
};

// Helpers — keep Date() out of render body to satisfy React Compiler purity.
function daysUntil(d: Date | string): number {
  const now = new Date().getTime();
  const target = new Date(d).getTime();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function countPrizes(prizes: unknown): number {
  if (Array.isArray(prizes)) return prizes.length;
  if (prizes && typeof prizes === "object") return Object.keys(prizes).length;
  return 0;
}

const AGE_LABELS: Record<string, string> = {
  AGES_3_5: "Ages 3–5",
  AGES_5_7: "Ages 5–7",
  AGES_8_10: "Ages 8–10",
  AGES_11_13: "Ages 11–13",
  AGES_14_16: "Ages 14–16",
  AGES_17_18: "Ages 17–18",
};

export default async function CompetitionsPage() {
  const competitions = await getCompetitions();
  const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-launch-gradient-soft py-14 sm:py-20">
        <div className="aurora-bg opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
            <Trophy className="h-4 w-4 text-accent" aria-hidden />
            <span className="text-launch-gradient">Compete · Learn · Win</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Competitions
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Showcase your skills and compete with students worldwide. Real prizes, real peers, real practice.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {competitions.length === 0 ? (
          <EmptyState
            illustration={<NoNotificationsScene />}
            title="No competitions yet — we&apos;re planning great ones"
            description="Check back soon or subscribe to our newsletter to be the first to know when registration opens for our next global STEM challenge."
            action={{ label: "Browse courses", href: "/courses" }}
            secondaryAction={{ label: "Contact us", href: "/contact" }}
            tone="first-use"
            size="lg"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {competitions.map((competition) => {
              const config =
                statusConfig[competition.status] ?? statusConfig.UPCOMING;
              const StatusIcon = config.Icon;
              const days = competition.startDate ? daysUntil(competition.startDate) : 0;
              const prizeCount = countPrizes(competition.prizes);
              const participants = competition.maxParticipants;

              return (
                <Link
                  key={competition.id}
                  href={`/competitions/${competition.slug}`}
                  className="card-premium group relative flex flex-col overflow-hidden"
                >
                  {/* Top gradient band + thumbnail/icon area */}
                  <div className={`relative h-32 bg-gradient-to-br ${config.bar}`}>
                    <div className="absolute inset-0 bg-noise opacity-30" aria-hidden />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm ring-1 ring-white/20">
                        <CategoryIcon category={competition.category} size={48} className="text-white" />
                      </div>
                    </div>
                    <span
                      className={`absolute top-3 end-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground shadow-sm`}
                    >
                      <StatusIcon className="h-3 w-3" aria-hidden />
                      {config.label}
                    </span>
                    {competition.ageGroup && (
                      <span className="absolute top-3 start-3 inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm">
                        {AGE_LABELS[competition.ageGroup] ?? competition.ageGroup}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                      {competition.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-2">
                      {competition.description}
                    </p>

                    {/* Metadata chips */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-medium text-foreground">
                        <Calendar className="h-3 w-3 text-primary" aria-hidden />
                        {competition.startDate ? dateFmt.format(new Date(competition.startDate)) : "TBA"}
                      </span>
                      {participants && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-medium text-foreground">
                          <Users className="h-3 w-3 text-primary" aria-hidden />
                          {participants.toLocaleString()} spots
                        </span>
                      )}
                      {prizeCount > 0 && (
                        <span className={config.chip}>
                          <Trophy className="h-3 w-3" aria-hidden />
                          {prizeCount} prize{prizeCount === 1 ? "" : "s"}
                        </span>
                      )}
                      {days > 0 && days <= 30 && competition.status !== "COMPLETED" && (
                        <span className="chip chip-accent">
                          <Hourglass className="h-3 w-3" aria-hidden />
                          Starts in {days} day{days === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>

                    {/* Footer — CTA */}
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground">
                        {competition.startDate ? dateFmt.format(new Date(competition.startDate)) : "TBA"}
                        {competition.endDate ? ` · ${dateFmt.format(new Date(competition.endDate))}` : ""}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5">
                        {competition.status === "REGISTRATION_OPEN"
                          ? "Register now"
                          : competition.status === "COMPLETED"
                          ? "View results"
                          : "View details"}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </span>
                    </div>
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
