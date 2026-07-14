"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { gradeTutorAssignment } from "@/actions/tutor-assignment.actions";

export function GradeForm({
  submissionId,
  maxPoints,
  existingPoints,
  existingFeedback,
}: {
  submissionId: string;
  maxPoints: number;
  existingPoints: number | null;
  existingFeedback: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function submit(formData: FormData, outcome: "REVIEWED" | "RETURNED") {
    setMessage(null);
    startTransition(async () => {
      const result = await gradeTutorAssignment({
        submissionId,
        points: String(formData.get("points") ?? "") === "" ? null : Number(formData.get("points")),
        feedback: String(formData.get("feedback") ?? ""),
        outcome,
      });
      setMessage(result.success ? (outcome === "REVIEWED" ? "Grade saved." : "Returned for revision.") : result.error ?? "Could not save feedback");
      if (result.success) router.refresh();
    });
  }

  return (
    <form
      action={(formData) => submit(formData, "REVIEWED")}
      className="space-y-4 rounded-xl border border-border bg-muted/20 p-5"
    >
      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        <label className="space-y-1.5 text-sm font-medium">
          Points / {maxPoints}
          <input name="points" type="number" min={0} max={maxPoints} defaultValue={existingPoints ?? ""} className="input-pretty w-full" />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Feedback
          <textarea name="feedback" rows={4} required maxLength={10000} defaultValue={existingFeedback ?? ""} className="input-pretty w-full p-3" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50">
          Save grade
        </button>
        <button
          type="submit"
          formNoValidate={false}
          disabled={pending}
          onClick={(event) => {
            event.preventDefault();
            const form = event.currentTarget.form;
            if (form && form.reportValidity()) submit(new FormData(form), "RETURNED");
          }}
          className="h-9 rounded-lg border border-input px-4 text-xs font-semibold disabled:opacity-50"
        >
          Return for revision
        </button>
        {message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}
      </div>
    </form>
  );
}
