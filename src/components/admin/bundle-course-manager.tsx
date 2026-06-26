"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addCourseToBundle,
  removeCourseFromBundle,
  setBundleCourseRequired,
  reorderBundleCourses,
} from "@/actions/bundle.actions";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

export interface BundleLink {
  id: string;
  courseId: string;
  courseTitle: string;
  isRequired: boolean;
}

export interface PickableCourse {
  id: string;
  title: string;
}

interface BundleCourseManagerProps {
  bundleId: string;
  links: BundleLink[];
  availableCourses: PickableCourse[];
}

export function BundleCourseManager({ bundleId, links, availableCourses }: BundleCourseManagerProps) {
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

  function move(index: number, dir: -1 | 1) {
    const next = [...links];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    run(() => reorderBundleCourses(bundleId, next.map((l) => l.id)));
  }

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Add course */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <select
          value={picker}
          onChange={(e) => setPicker(e.target.value)}
          className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
        >
          <option value="">Add a course…</option>
          {availableCourses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <button
          type="button"
          disabled={!picker || pending}
          onClick={() => {
            run(() => addCourseToBundle(bundleId, picker));
            setPicker("");
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {/* Ordered links */}
      {links.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No courses in this bundle yet. Add one above.
        </p>
      ) : (
        <ol className="space-y-2">
          {links.map((link, i) => (
            <li key={link.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{link.courseTitle}</span>

              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={link.isRequired}
                  disabled={pending}
                  onChange={(e) => run(() => setBundleCourseRequired(link.id, e.target.checked))}
                  className="h-4 w-4 rounded border-input"
                />
                Required
              </label>

              <div className="flex items-center gap-1">
                <button type="button" disabled={pending || i === 0} onClick={() => move(i, -1)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-muted disabled:opacity-40" title="Move up">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" disabled={pending || i === links.length - 1} onClick={() => move(i, 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-muted disabled:opacity-40" title="Move down">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button type="button" disabled={pending} onClick={() => run(() => removeCourseFromBundle(link.id))} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input text-red-600 hover:bg-red-50 disabled:opacity-40" title="Remove">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
