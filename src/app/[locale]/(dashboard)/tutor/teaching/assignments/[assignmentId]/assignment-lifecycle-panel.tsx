"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  deleteTutorAssignment,
  setTutorAssignmentStatus,
  updateTutorAssignment,
} from "@/actions/tutor-assignment.actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type AssignmentLifecyclePanelProps = {
  assignment: {
    id: string;
    title: string;
    instructions: string;
    kind: "ASSIGNMENT" | "QUIZ" | "PROJECT";
    status: "DRAFT" | "PUBLISHED" | "CLOSED";
    dueAt: string;
    maxPoints: number;
  };
  hasSubmission: boolean;
};

export function AssignmentLifecyclePanel({ assignment, hasSubmission }: AssignmentLifecyclePanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function save(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateTutorAssignment({
        assignmentId: assignment.id,
        title: String(formData.get("title") ?? ""),
        instructions: String(formData.get("instructions") ?? ""),
        kind: String(formData.get("kind") ?? assignment.kind) as AssignmentLifecyclePanelProps["assignment"]["kind"],
        dueAt: String(formData.get("dueAt") ?? "") || null,
        maxPoints: Number(formData.get("maxPoints") ?? assignment.maxPoints),
      });
      setMessage(result.success ? "Assignment updated." : result.error ?? "Could not update assignment");
      if (result.success) {
        setEditing(false);
        router.refresh();
      }
    });
  }

  function changeStatus(status: "PUBLISHED" | "CLOSED") {
    setMessage(null);
    startTransition(async () => {
      const result = await setTutorAssignmentStatus({ assignmentId: assignment.id, status });
      setMessage(
        result.success
          ? status === "CLOSED" ? "Assignment closed." : "Assignment reopened."
          : result.error ?? "Could not change assignment status"
      );
      if (result.success) router.refresh();
    });
  }

  function remove() {
    setMessage(null);
    startTransition(async () => {
      const result = await deleteTutorAssignment({ assignmentId: assignment.id });
      if (result.success) {
        router.push("/tutor/teaching");
        router.refresh();
        return;
      }
      setConfirmDelete(false);
      setMessage(result.error ?? "Could not delete assignment");
    });
  }

  return (
    <section className="card-premium space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Manage assignment</h2>
          <p className="text-xs text-muted-foreground">
            Close submissions temporarily, reopen them later, or edit terms before work is submitted.
          </p>
        </div>
        <span className={assignment.status === "CLOSED" ? "chip chip-accent" : "chip chip-success"}>
          {assignment.status.toLowerCase()}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending || hasSubmission}
          onClick={() => setEditing((value) => !value)}
          className="h-9 rounded-lg border border-input px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {editing ? "Cancel editing" : "Edit assignment"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => changeStatus(assignment.status === "CLOSED" ? "PUBLISHED" : "CLOSED")}
          className="h-9 rounded-lg border border-input px-4 text-xs font-semibold disabled:opacity-50"
        >
          {assignment.status === "CLOSED" ? "Reopen submissions" : "Close submissions"}
        </button>
        <button
          type="button"
          disabled={pending || hasSubmission}
          onClick={() => setConfirmDelete(true)}
          className="h-9 rounded-lg border border-red-300 px-4 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
        >
          Delete assignment
        </button>
      </div>

      {hasSubmission && (
        <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          Submitted work is preserved: assignment terms can no longer be edited or deleted. Close submissions if no more work should be accepted.
        </p>
      )}

      {editing && !hasSubmission && (
        <form action={save} className="space-y-4 rounded-xl border border-border bg-muted/20 p-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
            <label className="space-y-1.5 text-sm font-medium">
              Title
              <input name="title" required maxLength={160} defaultValue={assignment.title} className="input-pretty w-full" />
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Type
              <select name="kind" defaultValue={assignment.kind} disabled={assignment.kind === "QUIZ"} className="input-pretty w-full disabled:opacity-60">
                <option value="ASSIGNMENT">Assignment</option>
                <option value="QUIZ">Quiz / questions</option>
                <option value="PROJECT">Project</option>
              </select>
            </label>
          </div>
          <label className="block space-y-1.5 text-sm font-medium">
            Instructions
            <textarea name="instructions" required rows={6} maxLength={10000} defaultValue={assignment.instructions} className="input-pretty w-full p-3" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium">
              Due date (optional)
              <input name="dueAt" type="datetime-local" defaultValue={assignment.dueAt} className="input-pretty w-full" />
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Maximum points
              <input name="maxPoints" type="number" min={1} max={10000} required defaultValue={assignment.maxPoints} className="input-pretty w-full" />
            </label>
          </div>
          <button type="submit" disabled={pending} className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50">
            {pending ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}

      {message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete assignment?"
        description={`Delete “${assignment.title}” permanently? This is allowed only before the learner submits work.`}
        confirmLabel="Delete assignment"
        cancelLabel="Cancel"
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
        variant="destructive"
        loading={pending}
      />
    </section>
  );
}
