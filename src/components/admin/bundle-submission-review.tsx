"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { giveActivityFeedback } from "@/actions/activity.actions";
import { Send } from "lucide-react";

export function BundleSubmissionReview({
  submissionId,
  existingFeedback,
}: {
  submissionId: string;
  existingFeedback: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState(existingFeedback ?? "");
  const [msg, setMsg] = useState<string | null>(null);

  function onSend() {
    setMsg(null);
    startTransition(async () => {
      const res = await giveActivityFeedback(submissionId, feedback);
      setMsg(res.success ? "Feedback sent." : res.error ?? "Failed");
      if (res.success) router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={3}
        disabled={pending}
        placeholder="Give the student specific, encouraging feedback…"
        className="input-pretty w-full rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSend}
          disabled={pending || !feedback.trim()}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" /> {existingFeedback ? "Update feedback" : "Send feedback"}
        </button>
        {msg && <span className="text-xs text-muted-foreground" role="status">{msg}</span>}
      </div>
    </div>
  );
}
