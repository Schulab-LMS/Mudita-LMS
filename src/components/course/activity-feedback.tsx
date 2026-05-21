"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Send } from "lucide-react";
import { giveActivityFeedback } from "@/actions/activity.actions";

interface Submission {
  id: string;
  content: string;
  status: string;
  feedback: string | null;
}

// Tutor-facing panel: read the student's activity submission and leave feedback.
export function ActivityFeedback({ submission }: { submission: Submission | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState(submission?.feedback ?? "");
  const [msg, setMsg] = useState<string | null>(null);

  if (!submission) {
    return (
      <p className="text-sm text-muted-foreground">
        The student hasn&apos;t submitted the activity yet.
      </p>
    );
  }

  function onSend() {
    setMsg(null);
    startTransition(async () => {
      const res = await giveActivityFeedback(submission!.id, feedback);
      setMsg(res.success ? "Feedback sent." : res.error ?? "Failed");
      if (res.success) router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-muted/50 p-3">
        <p className="mb-1 text-xs font-semibold text-muted-foreground">
          Student submission ({submission.status === "REVIEWED" ? "reviewed" : "awaiting review"})
        </p>
        <p className="whitespace-pre-wrap text-sm text-foreground">{submission.content}</p>
      </div>
      <label className="block text-xs font-semibold text-muted-foreground">Your feedback</label>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={4}
        disabled={pending}
        placeholder="Give the student specific, encouraging feedback…"
        className="input-pretty w-full rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={pending || !feedback.trim()}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" aria-hidden />
        {submission.feedback ? "Update feedback" : "Send feedback"}
      </button>
      {msg && <p className="text-xs text-muted-foreground" role="status">{msg}</p>}
    </div>
  );
}
