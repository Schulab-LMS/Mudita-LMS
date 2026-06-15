"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { RefreshCw } from "lucide-react";
import { getCurriculumSyncStatus, resyncCurriculum } from "@/actions/curriculum.actions";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

export function ResyncButton({
  disabled,
  currentRunId,
}: {
  disabled?: boolean;
  currentRunId?: string | null;
}) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // The run shown when the page rendered — anything newer is the run we just
  // triggered. `trackedRunId` is the specific run we're waiting to finish.
  const baselineRunId = useRef<string | null>(currentRunId ?? null);
  const trackedRunId = useRef<string | null>(null);
  const timers = useRef<{
    poll?: ReturnType<typeof setInterval>;
    timeout?: ReturnType<typeof setTimeout>;
  }>({});

  const stopPolling = useCallback(() => {
    if (timers.current.poll) clearInterval(timers.current.poll);
    if (timers.current.timeout) clearTimeout(timers.current.timeout);
    timers.current = {};
  }, []);

  // Clean up timers if the component unmounts mid-poll.
  useEffect(() => () => stopPolling(), [stopPolling]);

  const finish = useCallback(
    (msg: { ok: boolean; text: string }) => {
      stopPolling();
      setSyncing(false);
      setMessage(msg);
      router.refresh();
    },
    [router, stopPolling]
  );

  const startPolling = useCallback(() => {
    stopPolling();

    timers.current.poll = setInterval(async () => {
      let run;
      try {
        run = await getCurriculumSyncStatus();
      } catch {
        return; // transient — keep polling
      }
      if (!run) return;

      // Identify the run produced by this trigger. The background sync creates
      // its RUNNING row a beat after the action returns, so until a newer run
      // appears we keep seeing the baseline and just wait.
      if (trackedRunId.current === null) {
        if (run.runId !== baselineRunId.current) {
          trackedRunId.current = run.runId;
        } else {
          return;
        }
      }

      if (run.runId === trackedRunId.current && run.status !== "RUNNING") {
        baselineRunId.current = run.runId;
        finish({
          ok: run.status === "SUCCESS",
          text:
            run.status === "FAILED"
              ? `Sync failed${run.error ? `: ${run.error}` : "."}`
              : `${run.status}: ${run.coursesUpserted} new course(s), ${run.lessonsUpserted} lesson(s) written, ${run.coursesArchived} archived.`,
        });
      }
    }, POLL_INTERVAL_MS);

    timers.current.timeout = setTimeout(() => {
      finish({
        ok: true,
        text: "Sync is taking a while — refresh the page to see the latest status.",
      });
    }, POLL_TIMEOUT_MS);
  }, [finish, stopPolling]);

  async function onClick() {
    setMessage(null);
    setSyncing(true);
    baselineRunId.current = currentRunId ?? null;
    trackedRunId.current = null;

    try {
      const res = await resyncCurriculum();
      if (!res.success) {
        setSyncing(false);
        setMessage({ ok: false, text: res.error ?? "Sync failed to start" });
        return;
      }
      if (res.alreadyRunning) {
        // Wait on the run that's already in flight rather than a new one.
        trackedRunId.current = currentRunId ?? null;
        setMessage({ ok: true, text: "A sync is already running — watching for completion…" });
      }
      startPolling();
    } catch {
      // The trigger request itself failed (e.g. a transient network/proxy
      // error). The sync may still have started server-side, so poll for the
      // result instead of crashing or hard-failing.
      setMessage({ ok: true, text: "Sync started — watching for completion…" });
      startPolling();
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || syncing}
        className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-launch-gradient px-3 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} aria-hidden />
        {syncing ? "Syncing…" : "Resync from Git"}
      </button>
      {message && (
        <p
          className={`text-xs ${message.ok ? "text-emerald-600" : "text-destructive"}`}
          role="status"
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
