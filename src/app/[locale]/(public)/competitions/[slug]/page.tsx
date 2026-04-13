import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCompetitionBySlug, getLeaderboard } from "@/services/competition.service";
import { registerForCompetition } from "@/actions/competition.actions";
import { Link } from "@/i18n/navigation";

interface CompetitionDetailPageProps {
  params: Promise<{ slug: string }>;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  UPCOMING: { label: "Upcoming", color: "bg-blue-100 text-blue-700" },
  REGISTRATION_OPEN: { label: "Registration Open", color: "bg-green-100 text-green-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-green-100 text-green-700" },
  JUDGING: { label: "Judging", color: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "Completed", color: "bg-gray-100 text-gray-600" },
};

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

  const config = statusConfig[competition.status] ?? {
    label: competition.status,
    color: "bg-gray-100 text-gray-600",
  };

  const canRegister =
    competition.status === "UPCOMING" || competition.status === "REGISTRATION_OPEN";

  const showLeaderboard =
    competition.status === "JUDGING" || competition.status === "COMPLETED";
  const leaderboard = showLeaderboard ? await getLeaderboard(competition.id) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <Link
        href="/competitions"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to Competitions
      </Link>

      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="text-3xl font-bold flex-1">{competition.title}</h1>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-xl border bg-card p-5 text-sm">
          <div>
            <p className="text-muted-foreground">Start</p>
            <p className="font-medium">{new Date(competition.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">End</p>
            <p className="font-medium">{new Date(competition.endDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Registration Ends</p>
            <p className="font-medium">{new Date(competition.registrationEnd).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Participants</p>
            <p className="font-medium">
              {competition.registrations.length}
              {competition.maxParticipants ? ` / ${competition.maxParticipants}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">About</h2>
        <p className="text-muted-foreground whitespace-pre-line">{competition.description}</p>
      </div>

      {competition.rules && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Rules</h2>
          <p className="text-muted-foreground whitespace-pre-line">{competition.rules}</p>
        </div>
      )}

      {competition.prizes && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Prizes</h2>
          <div className="rounded-xl border bg-card p-5">
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
              {JSON.stringify(competition.prizes, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card p-6">
        {!userId ? (
          <div className="text-center">
            <p className="text-muted-foreground mb-3">Sign in to register for this competition.</p>
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Sign In
            </Link>
          </div>
        ) : isRegistered ? (
          <div className="text-center">
            <p className="text-2xl">✅</p>
            <p className="mt-2 font-semibold text-green-700">You are registered!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Good luck in the competition!
            </p>
          </div>
        ) : canRegister ? (
          <div className="text-center">
            <p className="font-semibold mb-3">Ready to compete?</p>
            <form
              action={async () => {
                "use server";
                await registerForCompetition(competition.id);
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                Register Now
              </button>
            </form>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Registration is not currently open.
          </p>
        )}
      </div>

      {showLeaderboard && leaderboard.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Leaderboard</h2>
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium w-16">Rank</th>
                  <th className="px-4 py-3 text-left font-medium">Participant</th>
                  <th className="px-4 py-3 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`${entry.rank === 1 ? "bg-yellow-50" : entry.rank === 2 ? "bg-gray-50" : entry.rank === 3 ? "bg-orange-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        entry.rank === 1 ? "bg-yellow-200 text-yellow-900" :
                        entry.rank === 2 ? "bg-gray-200 text-gray-700" :
                        entry.rank === 3 ? "bg-orange-200 text-orange-800" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {entry.user.avatar ? (
                          <img src={entry.user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {(entry.user.name ?? "?")[0].toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium">{entry.user.name ?? "Participant"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {entry.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
