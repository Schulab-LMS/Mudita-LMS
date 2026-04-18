import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { getCompetitionWithScores } from "@/services/competition.service";
import { Link } from "@/i18n/navigation";
import { ScoreForm } from "./score-form";

export async function generateMetadata({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  const competition = await getCompetitionWithScores(competitionId);
  return { title: `${competition?.title ?? "Competition"} | Admin | Schulab` };
}

const statusColor: Record<string, string> = {
  UPCOMING: "bg-blue-100 text-blue-800",
  REGISTRATION_OPEN: "bg-green-100 text-green-800",
  IN_PROGRESS: "bg-green-100 text-green-800",
  JUDGING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-gray-100 text-gray-600",
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

  const scored = competition.registrations.filter((r) => r.score != null).length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/competitions" className="hover:text-foreground">
          Competitions
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{competition.title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{competition.title}</h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[competition.status] ?? "bg-gray-100"}`}
            >
              {competition.status.replace("_", " ")}
            </span>
          </div>
          <p className="mt-1 text-muted-foreground">
            {competition.registrations.length} participants &middot; {scored} scored
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border bg-white p-3">
          <div className="text-xs text-muted-foreground">Start</div>
          <div className="font-medium text-sm">
            {new Date(competition.startDate).toLocaleDateString()}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <div className="text-xs text-muted-foreground">End</div>
          <div className="font-medium text-sm">
            {new Date(competition.endDate).toLocaleDateString()}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <div className="text-xs text-muted-foreground">Registration Ends</div>
          <div className="font-medium text-sm">
            {new Date(competition.registrationEnd).toLocaleDateString()}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <div className="text-xs text-muted-foreground">Max Participants</div>
          <div className="font-medium text-sm">{competition.maxParticipants ?? "Unlimited"}</div>
        </div>
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
