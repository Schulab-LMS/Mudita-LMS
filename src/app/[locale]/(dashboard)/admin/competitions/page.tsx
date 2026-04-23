import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoNotificationsScene } from "@/components/illustrations/empty-scenes";
import {
  Trophy,
  ExternalLink,
  Hourglass,
  Flame,
  CheckCircle2,
} from "lucide-react";

export const metadata = { title: "Competitions | Admin | Schulab" };

const STATUS_CHIP: Record<string, string> = {
  UPCOMING: "chip chip-primary",
  REGISTRATION_OPEN: "chip chip-success",
  ONGOING: "chip chip-success",
  IN_PROGRESS: "chip chip-accent",
  JUDGING: "chip chip-secondary",
  COMPLETED: "chip chip-neutral",
};

const STATUS_ICON: Record<string, typeof Hourglass> = {
  UPCOMING: Hourglass,
  REGISTRATION_OPEN: Trophy,
  ONGOING: Flame,
  IN_PROGRESS: Flame,
  JUDGING: Hourglass,
  COMPLETED: CheckCircle2,
};

export default async function AdminCompetitionsPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role))
    redirect("/dashboard");

  let competitions: Array<{
    id: string;
    title: string;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    maxParticipants: number | null;
  }> = [];
  try {
    competitions = await db.competition.findMany({
      orderBy: { startDate: "desc" },
    });
  } catch {
    /* no db */
  }

  const dateFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const counts = {
    total: competitions.length,
    upcoming: competitions.filter(
      (c) => c.status === "UPCOMING" || c.status === "REGISTRATION_OPEN"
    ).length,
    live: competitions.filter(
      (c) => c.status === "ONGOING" || c.status === "IN_PROGRESS"
    ).length,
    completed: competitions.filter((c) => c.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitions"
        description={`${competitions.length} competition${
          competitions.length === 1 ? "" : "s"
        } across upcoming, live, and completed states`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Competitions" },
        ]}
        actions={
          <Link
            href="/competitions"
            target="_blank"
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            View public page
          </Link>
        }
      />

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="Total" value={counts.total} tone="primary" />
        <SummaryTile label="Upcoming" value={counts.upcoming} tone="primary" />
        <SummaryTile label="Live" value={counts.live} tone="accent" />
        <SummaryTile
          label="Completed"
          value={counts.completed}
          tone="neutral"
        />
      </div>

      {competitions.length === 0 ? (
        <EmptyState
          illustration={<NoNotificationsScene />}
          title="No competitions yet"
          description="Plan your first STEM challenge and watch students come together to compete."
          tone="first-use"
          size="lg"
        />
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Title
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Start
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    End
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Capacity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {competitions.map((c) => {
                  const StatusIcon = STATUS_ICON[c.status] ?? Hourglass;
                  return (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/competitions/${c.id}`}
                          className="flex items-center gap-3 font-medium text-foreground hover:text-primary"
                        >
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-launch-gradient-soft">
                            <Trophy className="h-4 w-4 text-accent" aria-hidden />
                          </span>
                          <span className="truncate">{c.title}</span>
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={
                            STATUS_CHIP[c.status] ?? "chip chip-neutral"
                          }
                        >
                          <StatusIcon className="h-3 w-3" aria-hidden />
                          {c.status.replace(/_/g, " ").toLowerCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {c.startDate ? dateFmt.format(new Date(c.startDate)) : "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {c.endDate ? dateFmt.format(new Date(c.endDate)) : "—"}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex min-w-[3rem] items-center justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">
                          {c.maxParticipants ?? "∞"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "accent" | "neutral";
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    neutral: "bg-muted text-muted-foreground",
  };
  return (
    <div className="card-premium p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-2xl font-bold text-foreground">
          {value}
        </span>
      </div>
      <span
        className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${toneClasses[tone]}`}
      >
        {tone === "accent" ? "active" : tone === "primary" ? "queued" : "done"}
      </span>
    </div>
  );
}
