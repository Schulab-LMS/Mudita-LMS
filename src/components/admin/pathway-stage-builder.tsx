"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addPathwayStage,
  removePathwayStage,
  reorderPathwayStages,
} from "@/actions/pathway.actions";
import { ArrowDown, ArrowUp, BookOpen, Layers, Plus, Trash2 } from "lucide-react";

export interface StageRow {
  id: string;
  kind: "bundle" | "course";
  targetTitle: string;
  title: string | null;
}

export interface PickItem {
  id: string;
  title: string;
}

interface PathwayStageBuilderProps {
  pathwayId: string;
  stages: StageRow[];
  bundles: PickItem[];
  courses: PickItem[];
}

export function PathwayStageBuilder({ pathwayId, stages, bundles, courses }: PathwayStageBuilderProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [kind, setKind] = useState<"bundle" | "course">("bundle");
  const [targetId, setTargetId] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.success) router.refresh();
      else setError(res.error ?? "Action failed");
    });
  }

  function add() {
    if (!targetId) return;
    run(() =>
      addPathwayStage({
        pathwayId,
        title: label || null,
        bundleId: kind === "bundle" ? targetId : undefined,
        courseId: kind === "course" ? targetId : undefined,
      })
    );
    setTargetId("");
    setLabel("");
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...stages];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    run(() => reorderPathwayStages(pathwayId, next.map((s) => s.id)));
  }

  const options = kind === "bundle" ? bundles : courses;

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Add stage — Bundle XOR Course */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setKind("bundle"); setTargetId(""); }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${kind === "bundle" ? "bg-primary text-white" : "border border-input hover:bg-muted"}`}
          >
            <Layers className="h-4 w-4" /> Bundle
          </button>
          <button
            type="button"
            onClick={() => { setKind("course"); setTargetId(""); }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${kind === "course" ? "bg-primary text-white" : "border border-input hover:bg-muted"}`}
          >
            <BookOpen className="h-4 w-4" /> Course
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none">
            <option value="">Select a {kind}…</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>{o.title}</option>
            ))}
          </select>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Stage label (optional)" className="h-10 w-48 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none" />
          <button type="button" disabled={!targetId || pending} onClick={add} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60">
            <Plus className="h-4 w-4" /> Add stage
          </button>
        </div>
      </div>

      {/* Ordered stages */}
      {stages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No stages yet. Add a bundle or course above.
        </p>
      ) : (
        <ol className="space-y-2">
          {stages.map((stage, i) => (
            <li key={stage.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{i + 1}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase text-muted-foreground">
                {stage.kind === "bundle" ? <Layers className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                {stage.kind}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{stage.title || stage.targetTitle}</p>
                {stage.title && <p className="truncate text-xs text-muted-foreground">{stage.targetTitle}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button type="button" disabled={pending || i === 0} onClick={() => move(i, -1)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-muted disabled:opacity-40" title="Move up">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" disabled={pending || i === stages.length - 1} onClick={() => move(i, 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-muted disabled:opacity-40" title="Move down">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button type="button" disabled={pending} onClick={() => run(() => removePathwayStage(stage.id))} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input text-red-600 hover:bg-red-50 disabled:opacity-40" title="Remove">
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
