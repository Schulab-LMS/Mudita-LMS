"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addCoursePrerequisite,
  removeCoursePrerequisite,
} from "@/actions/prerequisite.actions";
import { Plus, Trash2, GitBranch } from "lucide-react";

export interface PrereqRow {
  id: string;
  prerequisiteId: string;
  title: string;
}

export interface PickableCourse {
  id: string;
  title: string;
}

interface CoursePrerequisiteManagerProps {
  courseId: string;
  prerequisites: PrereqRow[];
  availableCourses: PickableCourse[];
}

export function CoursePrerequisiteManager({
  courseId,
  prerequisites,
  availableCourses,
}: CoursePrerequisiteManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [picker, setPicker] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.success) router.refresh();
      else setError(res.error ?? "Action failed");
    });
  }

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <select
          value={picker}
          onChange={(e) => setPicker(e.target.value)}
          className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
        >
          <option value="">Require a course first…</option>
          {availableCourses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <button
          type="button"
          disabled={!picker || pending}
          onClick={() => {
            run(() => addCoursePrerequisite(courseId, picker));
            setPicker("");
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {prerequisites.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No prerequisites. Learners can enrol in this course directly.
        </p>
      ) : (
        <ul className="space-y-2">
          {prerequisites.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <GitBranch className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-medium">{p.title}</span>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => removeCoursePrerequisite(p.id))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input text-red-600 hover:bg-red-50 disabled:opacity-40"
                title="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
