"use server";

import { after } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { audit } from "@/lib/audit";
import { isCurriculaConfigured } from "@/lib/github-curricula";
import { getLastSyncRun, runCurriculumSync } from "@/services/curriculum-sync.service";

// A full resync streams hundreds of files from GitHub and can run for minutes.
// We must NOT hold the Server Action request open for the whole sync: a
// reverse-proxy / Cloudflare read timeout would drop the client connection and
// the resulting unhandled rejection would trip the admin error boundary
// ("Error loading admin panel") — even though the sync completed fine
// server-side. Instead we kick the sync off in `after()` (mirroring the GitHub
// push webhook handler) and let the UI poll getCurriculumSyncStatus for the
// outcome.

// A RUNNING run older than this is treated as crashed/abandoned and no longer
// blocks a fresh trigger.
const RUNNING_STALE_MS = 15 * 60 * 1000;

export type ResyncResult = {
  success: boolean;
  alreadyRunning?: boolean;
  error?: string;
};

// Admin-triggered full resync. Returns as soon as the sync is scheduled; the
// actual work runs in the background and the client polls for completion.
export async function resyncCurriculum(): Promise<ResyncResult> {
  try {
    const session = await requireAdmin();
    const actorId = session.user!.id;

    if (!isCurriculaConfigured()) {
      return { success: false, error: "Curriculum sync is not configured" };
    }

    // Best-effort guard against overlapping runs (e.g. an impatient double-click
    // while the previous sync is still in flight). The sync is idempotent, so
    // this is a courtesy rather than a correctness requirement.
    const last = await getLastSyncRun();
    if (
      last &&
      last.status === "RUNNING" &&
      Date.now() - last.startedAt.getTime() < RUNNING_STALE_MS
    ) {
      return { success: true, alreadyRunning: true };
    }

    after(async () => {
      try {
        const result = await runCurriculumSync({ trigger: "MANUAL", force: true });
        await audit({
          actorId,
          action: "curriculum.resync",
          resource: "CurriculumSyncRun",
          resourceId: result.runId || null,
          metadata: {
            status: result.status,
            coursesUpserted: result.coursesUpserted,
            lessonsUpserted: result.lessonsUpserted,
            coursesArchived: result.coursesArchived,
          },
        });
      } catch (e) {
        console.error("resyncCurriculum background sync error:", e);
      }
    });

    return { success: true };
  } catch (error) {
    console.error("resyncCurriculum error:", error);
    return { success: false, error: "Failed to start curriculum resync" };
  }
}

export type SyncStatus = {
  runId: string;
  status: string;
  trigger: string;
  startedAt: string;
  finishedAt: string | null;
  coursesUpserted: number;
  lessonsUpserted: number;
  coursesArchived: number;
  error: string | null;
};

// Lightweight poll target for the resync button. Returns the latest sync run so
// the client can detect when a backgrounded resync has finished.
export async function getCurriculumSyncStatus(): Promise<SyncStatus | null> {
  await requireAdmin();
  const run = await getLastSyncRun();
  if (!run) return null;
  return {
    runId: run.id,
    status: run.status,
    trigger: run.trigger,
    startedAt: run.startedAt.toISOString(),
    finishedAt: run.finishedAt?.toISOString() ?? null,
    coursesUpserted: run.coursesUpserted,
    lessonsUpserted: run.lessonsUpserted,
    coursesArchived: run.coursesArchived,
    error: run.error,
  };
}
