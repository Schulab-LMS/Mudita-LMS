import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { isCurriculaConfigured, curriculaRepo, curriculaBranch } from "@/lib/github-curricula";
import { getLastSyncRun } from "@/services/curriculum-sync.service";
import { ResyncButton } from "./resync-button";
import { GitBranch, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";

export const metadata = { title: "Curriculum (Git) | Admin" };

const statusTone: Record<string, string> = {
  SUCCESS: "chip chip-success",
  PARTIAL: "chip chip-accent",
  RUNNING: "chip chip-neutral",
  FAILED: "chip chip-neutral text-destructive",
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default async function AdminCurriculumPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const configured = isCurriculaConfigured();
  const [lastRun, courses] = await Promise.all([
    getLastSyncRun().catch(() => null),
    db.course
      .findMany({
        where: { managedByGit: true },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          syncStatus: true,
          sourcePath: true,
          sourceCommitSha: true,
          updatedAt: true,
          _count: { select: { modules: true } },
        },
        orderBy: { title: "asc" },
      })
      .catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Curriculum (Git)"
        description="Curriculum content is owned by the STEM-Curricula repository and synced into the platform. It is read-only here — edit it in Git."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Curriculum" }]}
        actions={<ResyncButton disabled={!configured} currentRunId={lastRun?.id ?? null} />}
      />

      {!configured && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">Curriculum sync is not configured.</p>
            <p className="mt-1">
              Set <code className="font-mono">CURRICULA_REPO</code> and{" "}
              <code className="font-mono">CURRICULA_GITHUB_TOKEN</code> to enable
              syncing from GitHub.
            </p>
          </div>
        </div>
      )}

      {/* Source + last sync */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card-premium p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <GitBranch className="h-3.5 w-3.5" aria-hidden />
            Source
          </div>
          {configured ? (
            <>
              <p className="font-mono text-sm text-foreground">{curriculaRepo()}</p>
              <p className="text-xs text-muted-foreground">branch: {curriculaBranch()}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Not configured</p>
          )}
        </div>

        <div className="card-premium p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            Last sync
          </div>
          {lastRun ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={statusTone[lastRun.status] ?? "chip chip-neutral"}>
                  {lastRun.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(lastRun.startedAt)} · {lastRun.trigger}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {lastRun.coursesUpserted} new course(s), {lastRun.lessonsUpserted} lesson(s)
                written, {lastRun.coursesArchived} archived
              </p>
              {lastRun.commitSha && (
                <p className="font-mono text-[11px] text-muted-foreground">
                  commit {lastRun.commitSha.slice(0, 10)}
                </p>
              )}
              {lastRun.error && (
                <p className="text-xs text-destructive">{lastRun.error}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No sync has run yet.</p>
          )}
        </div>
      </div>

      {/* Managed courses */}
      <div className="card-premium overflow-hidden">
        <div className="border-b border-border px-5 py-3 text-sm font-semibold text-foreground">
          Git-managed courses ({courses.length})
        </div>
        {courses.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No Git-managed courses yet. Run a sync to import them.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 text-start">Course</th>
                  <th className="px-5 py-3 text-start">Status</th>
                  <th className="px-5 py-3 text-center">Modules</th>
                  <th className="px-5 py-3 text-start">Source path</th>
                  <th className="px-5 py-3 text-start">Commit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {courses.map((course) => (
                  <tr key={course.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {course.title}
                      </Link>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        /{course.slug}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      {course.syncStatus === "REMOVED" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-destructive">
                          <XCircle className="h-3.5 w-3.5" aria-hidden /> Removed in Git
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {course.status}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">{course._count.modules}</td>
                    <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">
                      {course.sourcePath ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">
                      {course.sourceCommitSha ? course.sourceCommitSha.slice(0, 10) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
