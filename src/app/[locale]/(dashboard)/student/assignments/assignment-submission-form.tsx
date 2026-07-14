"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { submitTutorAssignment } from "@/actions/tutor-assignment.actions";

export function AssignmentSubmissionForm({
  assignmentId,
  existingContent,
}: {
  assignmentId: string;
  existingContent: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [content, setContent] = useState(existingContent ?? "");
  const [message, setMessage] = useState<string | null>(null);

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const result = await submitTutorAssignment({ assignmentId, content });
      setMessage(result.success ? "Submitted to your tutor." : result.error ?? "Could not submit");
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={5}
        maxLength={10000}
        placeholder="Write your response, paste a link, or describe the work you completed…"
        className="input-pretty w-full p-3"
      />
      <div className="flex items-center gap-3">
        <button type="button" onClick={submit} disabled={pending || !content.trim()} className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50">
          {existingContent ? "Resubmit" : "Submit work"}
        </button>
        {message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
