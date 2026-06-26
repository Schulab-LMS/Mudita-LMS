import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { getCompetitionWithScores } from "@/services/competition.service";
import { ScoreForm } from "./score-form";
import { PageHeader } from "@/components/ui/page-header";
import {
  Trophy,
  Calendar,
  Users,
  Clock,
  Hourglass,
  Sparkles,
  Flame,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitionId: string }>;
}) {
  const { competitionId } = await params;
  const competition = await getCompetitionWithScores(competitionId);
  return {
    title: `${competition?.title ?? "Competition"} | Admin | Schulab`,
  };
}

const statusChip: Record<string, string> = {
  UPCOMING: "chip chip-primary",
  REGISTRATION_OPEN: "chip chip-success",
  IN_PROGRESS: "chip chip-accent",
  JUDGING: "chip chip-secondary",
  COMPLETED: "chip chip-neutral",
};

const statusIcon: Record<string, LucideIcon> = {
  UPCOMING: Hourglass,
  REGISTRATION_OPEN: Sparkles,
  IN_PROGRESS: Flame,
  JUDGING: Hourglass,
  COMPLETED: CheckCircle2,
};

export default async function AdminCompetitionDetailPage({
  params,
}: {
  params: Promise<{ competitionId: string }>;
}) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  const { competitionId } = await params;
  const competition = await getCompetitionWithScores(competitionId);
  if (!competition) notFound();

  const scored = competition.registrations.filter(
    (r) => r.score != null
  ).length;
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const StatusIcon = statusIcon[competition.status] ?? Hourglass;

  return (
    <div className="space-y-6">
      <PageHeader
        title={competition.title}
        description={`${competition.registrations.length} participant${
          competition.registrations.length === 1 ? "" : "s"
        } · ${scored} scored`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Competitions", href: "/admin/competitions" },
          { label: competition.title },
        ]}
        icon={<Trophy className="h-5 w-5" />}
        actions={
          <span
            className={
              statusChip[competition.status] ?? "chip chip-neutral"
            }
          >
            <StatusIcon className="h-3 w-3" aria-hidden />
            {competition.status.replace(/_/g, " ").toLowerCase()}
          </span>
        }
      />

      {/* Quick info tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTile
          icon={<Calendar className="h-4 w-4" />}
          label="Start"
          value={competition.startDate ? dateFmt.format(new Date(competition.startDate)) : "TBA"}
          tone="primary"
        />
        <InfoTile
          icon={<Calendar className="h-4 w-4" />}
          label="End"
          value={competition.endDate ? dateFmt.format(new Date(competition.endDate)) : "TBA"}
          tone="secondary"
        />
        <InfoTile
          icon={<Clock className="h-4 w-4" />}
          label="Registration ends"
          value={competition.registrationEnd ? dateFmt.format(new Date(competition.registrationEnd)) : "TBA"}
          tone="accent"
        />
        <InfoTile
          icon={<Users className="h-4 w-4" />}
          label="Max participants"
          value={
            competition.maxParticipants
              ? String(competition.maxParticipants)
              : "∞"
          }
          tone="primary"
        />
      </div>

      {/* Scoring table (client component) */}
      <ScoreForm
        competitionId={competition.id}
        participants={competition.registrations.map((r) => ({
          id: r.id,
          score: r.score,
          rank: r.rank,
          user: r.user,
        }))}
      />
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "secondary" | "accent";
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <div className="card-premium p-4">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="truncate font-display text-sm font-bold leading-tight text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
