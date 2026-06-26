import Image from "next/image";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getCompetitionBySlug,
  getLeaderboard,
} from "@/services/competition.service";
import { registerForCompetition } from "@/actions/competition.actions";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CategoryIcon } from "@/components/illustrations/category-icons";
import {
  Trophy,
  Calendar,
  Users,
  Hourglass,
  Flame,
  CheckCircle2,
  Sparkles,
  Award,
  ArrowRight,
  Clock,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

interface CompetitionDetailPageProps {
  params: Promise<{ slug: string }>;
}

interface StatusConfig {
  label: string;
  chip: string;
  bar: string;
  Icon: typeof Trophy;
}

const statusConfig: Record<string, StatusConfig> = {
  UPCOMING: {
    label: "Upcoming",
    chip: "chip chip-primary",
    bar: "from-[#4f3ff0] to-[#8b5cf6]",
    Icon: Hourglass,
  },
  REGISTRATION_OPEN: {
    label: "Registration open",
    chip: "chip chip-success",
    bar: "from-[#34d399] to-[#0ea5e9]",
    Icon: Sparkles,
  },
  IN_PROGRESS: {
    label: "Live",
    chip: "chip chip-accent",
    bar: "from-[#ff8a3d] to-[#ef4444]",
    Icon: Flame,
  },
  JUDGING: {
    label: "Judging",
    chip: "chip chip-secondary",
    bar: "from-[#8b5cf6] to-[#ec4899]",
    Icon: Hourglass,
  },
  COMPLETED: {
    label: "Ended",
    chip: "chip chip-neutral",
    bar: "from-[#94a3b8] to-[#64748b]",
    Icon: CheckCircle2,
  },
};

function daysUntil(d: Date | string): number {
  const now = new Date().getTime();
  const target = new Date(d).getTime();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export default async function CompetitionDetailPage({
  params,
}: CompetitionDetailPageProps) {
  const { slug } = await params;
  const competition = await getCompetitionBySlug(slug);
  if (!competition) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  const isRegistered = userId
    ? competition.registrations.some((r) => r.userId === userId)
    : false;

  const config = statusConfig[competition.status] ?? statusConfig.UPCOMING;
  const StatusIcon = config.Icon;

  const canRegister =
    competition.status === "UPCOMING" ||
    competition.status === "REGISTRATION_OPEN";

  const showLeaderboard =
    competition.status === "JUDGING" || competition.status === "COMPLETED";
  const leaderboard = showLeaderboard
    ? await getLeaderboard(competition.id)
    : [];

  const dateFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const daysToStart = competition.startDate ? daysUntil(competition.startDate) : 0;
  const participantCount = competition.registrations.length;
  const maxParticipants = competition.maxParticipants;
  const spotsLeft = maxParticipants
    ? Math.max(0, maxParticipants - participantCount)
    : null;
  const spotsFull = spotsLeft === 0;

  // Parse prizes into a displayable list. Supports Array<string|object> and
  // Record<string,string> shapes safely.
  const prizeItems = Array.isArray(competition.prizes)
    ? (competition.prizes as unknown[]).map((p, i) => ({
        key: String(i),
        label: typeof p === "string" ? p : JSON.stringify(p),
      }))
    : competition.prizes && typeof competition.prizes === "object"
      ? Object.entries(competition.prizes as Record<string, unknown>).map(
          ([k, v]) => ({
            key: k,
            label: `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`,
          })
        )
      : [];

  return (
    <div>
      {/* Hero with status-coloured gradient */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${config.bar} py-12 text-white sm:py-16`}>
        <div className="bg-noise opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            className="mb-5 [&_*]:text-white/80 [&_[aria-current='page']]:text-white"
            items={[
              { label: "Competitions", href: "/competitions" },
              { label: competition.title },
            ]}
          />

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* Icon tile */}
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm ring-1 ring-white/20">
              <CategoryIcon
                category={competition.category}
                size={64}
                className="text-white"
              />
            </div>

            <div className="min-w-0 flex-1">
              {/* Status + urgency chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground">
                  <StatusIcon className="h-3 w-3" aria-hidden />
                  {config.label}
                </span>
                {daysToStart > 0 &&
                  daysToStart <= 30 &&
                  competition.status !== "COMPLETED" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                      <Hourglass className="h-3 w-3" aria-hidden />
                      Starts in {daysToStart} day
                      {daysToStart === 1 ? "" : "s"}
                    </span>
                  )}
              </div>

              <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                {competition.title}
              </h1>
            </div>
          </div>

          {/* Key metrics strip */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroStat
              label="Start"
              value={competition.startDate ? dateFmt.format(new Date(competition.startDate)) : "TBA"}
              icon={<Calendar className="h-4 w-4" />}
            />
            <HeroStat
              label="End"
              value={competition.endDate ? dateFmt.format(new Date(competition.endDate)) : "TBA"}
              icon={<Calendar className="h-4 w-4" />}
            />
            <HeroStat
              label="Register by"
              value={competition.registrationEnd ? dateFmt.format(new Date(competition.registrationEnd)) : "TBA"}
              icon={<Clock className="h-4 w-4" />}
            />
            <HeroStat
              label="Participants"
              value={
                maxParticipants
                  ? `${participantCount} / ${maxParticipants}`
                  : String(participantCount)
              }
              icon={<Users className="h-4 w-4" />}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          {/* Content */}
          <div className="space-y-8">
            {/* About */}
            <section className="card-premium p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                About
              </h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                {competition.description}
              </p>
            </section>

            {/* Rules */}
            {competition.rules && (
              <section className="card-premium p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />
                  Rules
                </h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                  {competition.rules}
                </p>
              </section>
            )}

            {/* Prizes */}
            {prizeItems.length > 0 && (
              <section className="card-premium p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
                  <Trophy className="h-5 w-5 text-accent" aria-hidden />
                  Prizes
                </h2>
                <ul className="mt-4 space-y-2">
                  {prizeItems.map((prize, i) => (
                    <li
                      key={prize.key}
                      className="flex items-start gap-3 rounded-xl bg-muted/40 p-3"
                    >
                      <span
                        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                          i === 0
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : i === 1
                              ? "bg-muted-foreground/15 text-muted-foreground"
                              : i === 2
                                ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                                : "bg-primary/10 text-primary"
                        }`}
                      >
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                      </span>
                      <span className="text-sm text-foreground">{prize.label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Leaderboard */}
            {showLeaderboard && leaderboard.length > 0 && (
              <section className="card-premium overflow-hidden">
                <header className="flex items-center gap-2 border-b border-border px-6 py-4">
                  <Award className="h-5 w-5 text-accent" aria-hidden />
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Leaderboard
                  </h2>
                </header>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="w-16 px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Rank
                        </th>
                        <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Participant
                        </th>
                        <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {leaderboard.map((entry) => (
                        <tr
                          key={entry.id}
                          className={`transition-colors hover:bg-muted/30 ${
                            entry.rank === 1
                              ? "bg-amber-500/5"
                              : entry.rank === 2
                                ? "bg-muted/20"
                                : entry.rank === 3
                                  ? "bg-orange-500/5"
                                  : ""
                          }`}
                        >
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                entry.rank === 1
                                  ? "bg-amber-400 text-amber-950"
                                  : entry.rank === 2
                                    ? "bg-muted text-foreground"
                                    : entry.rank === 3
                                      ? "bg-orange-400 text-orange-950"
                                      : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {entry.rank === 1
                                ? "🥇"
                                : entry.rank === 2
                                  ? "🥈"
                                  : entry.rank === 3
                                    ? "🥉"
                                    : entry.rank}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              {entry.user.avatar ? (
                                <Image
                                  src={entry.user.avatar}
                                  alt=""
                                  width={32}
                                  height={32}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-xs font-semibold text-foreground">
                                  {getInitials(entry.user.name ?? "?")}
                                </span>
                              )}
                              <span className="font-medium text-foreground">
                                {entry.user.name ?? "Participant"}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-end font-semibold tabular-nums text-foreground">
                            {entry.score}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* Sticky register sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
            <div className="card-premium p-5">
              {!userId ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Ready to compete?
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sign in to register for this competition.
                  </p>
                  <Link
                    href="/login"
                    className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-launch-gradient text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
                  >
                    Sign in
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                  </Link>
                </div>
              ) : isRegistered ? (
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/20">
                    <CheckCircle2
                      className="h-6 w-6 text-emerald-600"
                      aria-hidden
                    />
                  </div>
                  <p className="mt-3 font-display font-semibold text-foreground">
                    You&apos;re registered!
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Good luck — we&apos;ll email reminders before it starts.
                  </p>
                </div>
              ) : canRegister && !spotsFull ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Ready to compete?
                  </p>
                  {spotsLeft !== null && spotsLeft <= 20 && (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <Hourglass className="h-3 w-3" aria-hidden />
                      Only {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left
                    </p>
                  )}
                  <form
                    action={async () => {
                      "use server";
                      await registerForCompetition(competition.id);
                    }}
                    className="mt-3"
                  >
                    <button
                      type="submit"
                      className="shine inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-launch-gradient text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
                    >
                      Register now
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                    </button>
                  </form>
                </div>
              ) : spotsFull ? (
                <div className="text-center">
                  <p className="font-semibold text-foreground">Fully booked</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    All {maxParticipants} spots are taken. Check back for the
                    next round.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-semibold text-foreground">
                    Registration closed
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This competition is no longer accepting registrations.
                  </p>
                </div>
              )}
            </div>

            {/* Quick-facts card */}
            <div className="rounded-2xl border border-primary/20 bg-launch-gradient-soft p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Quick facts
              </p>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Trophy className="h-3.5 w-3.5 text-accent" aria-hidden />
                  {prizeItems.length > 0
                    ? `${prizeItems.length} prize${prizeItems.length === 1 ? "" : "s"} available`
                    : "Recognition for top entries"}
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {participantCount} participant
                  {participantCount === 1 ? "" : "s"} registered
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" aria-hidden />
                  Registration closes{" "}
                  {competition.registrationEnd
                    ? dateFmt.format(new Date(competition.registrationEnd))
                    : "TBA"}
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky CTA bar */}
      {canRegister && !isRegistered && userId && !spotsFull && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 py-3 shadow-hero backdrop-blur-md lg:hidden">
          <form
            action={async () => {
              "use server";
              await registerForCompetition(competition.id);
            }}
          >
            <button
              type="submit"
              className="shine inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-launch-gradient text-sm font-bold text-white shadow-md"
            >
              Register now
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function HeroStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm ring-1 ring-white/15">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}
