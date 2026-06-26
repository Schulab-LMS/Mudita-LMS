"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Send, CheckCircle2, MessageSquare } from "lucide-react";
import { submitBundleProject } from "@/actions/activity.actions";

interface ExistingSubmission {
  content: string;
  status: string;
  feedback: string | null;
}

// Student-facing capstone panel: submit/revise the bundle's final project and
// see reviewer feedback. Mirrors the lesson ActivitySubmission component.
export function BundleProjectSubmission({
  bundleId,
  existing,
}: {
  bundleId: string;
  existing: ExistingSubmission | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState(existing?.content ?? "");
  const [msg, setMsg] = useState<string | null>(null);

  function onSubmit() {
    setMsg(null);
    startTransition(async () => {
      const res = await submitBundleProject({ bundleId, content });
      setMsg(res.success ? "Submitted — it will be reviewed soon." : res.error ?? "Failed");
      if (res.success) router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {existing?.feedback && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50/60 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <MessageSquare className="h-3.5 w-3.5" aria-hidden /> Reviewer feedback
          </p>
          <p className="whitespace-pre-wrap text-sm text-foreground">{existing.feedback}</p>
        </div>
      )}

      <label className="block text-xs font-semibold text-muted-foreground">
        Your project
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        disabled={pending}
        placeholder="Describe your project, paste a link (e.g. your Scratch project or repo), and reflect on what you built…"
        className="input-pretty w-full rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={pending || !content.trim()}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" aria-hidden />
          {existing ? "Update submission" : "Submit project"}
        </button>
        {existing && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
            {existing.status === "REVIEWED" ? "Reviewed" : "Submitted"}
          </span>
        )}
      </div>
      {msg && <p className="text-xs text-muted-foreground" role="status">{msg}</p>}
    </div>
  );
}
