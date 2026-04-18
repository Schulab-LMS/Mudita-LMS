import type { Metadata } from "next";
import { getCompetitions } from "@/services/competition.service";

export const metadata: Metadata = {
  title: "Competitions | Schulab",
  description:
    "Join STEM competitions on Schulab. Showcase your skills and compete with students worldwide.",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  UPCOMING: { label: "Upcoming", color: "bg-blue-100 text-blue-700" },
  REGISTRATION_OPEN: { label: "Register Now", color: "bg-green-100 text-green-700" },
  IN_PROGRESS: { label: "Ongoing", color: "bg-green-100 text-green-700" },
  JUDGING: { label: "Judging", color: "bg-yellow-100 text-yellow-700" },
  COMPLETED: { label: "Completed", color: "bg-gray-100 text-gray-600" },
};

export default async function CompetitionsPage() {
  const competitions = await getCompetitions();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Competitions</h1>
        <p className="mt-1 text-muted-foreground">
          Showcase your skills and compete with students worldwide.
        </p>
      </div>

      {competitions.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-5xl">🏆</p>
          <p className="mt-3 text-lg font-medium">No competitions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back soon for upcoming competitions!
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {competitions.map((competition) => {
            const config = statusConfig[competition.status] ?? {
              label: competition.status,
              color: "bg-gray-100 text-gray-600",
            };

            return (
              <a
                key={competition.id}
                href={`/competitions/${competition.slug}`}
                className="group flex flex-col rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {competition.title}
                  </h3>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
                  >
                    {config.label}
                  </span>
                </div>

                <p className="flex-1 text-sm text-muted-foreground line-clamp-2">
                  {competition.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t pt-3">
                  <div>
                    <p className="font-medium text-foreground">Start Date</p>
                    <p>{new Date(competition.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">End Date</p>
                    <p>{new Date(competition.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {competition.prizes && (
                  <div className="mt-2 text-xs">
                    <span className="font-medium">🏆 Prizes available</span>
                  </div>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
