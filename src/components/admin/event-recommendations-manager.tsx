"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addEventRecommendation, removeEventRecommendation } from "@/actions/event.actions";
import { BookOpen, Layers, Trash2 } from "lucide-react";

interface Rec {
  id: string;
  title: string;
  type: string;
  reason: string;
}

interface Props {
  eventId: string;
  courseRecs: Rec[];
  bundleRecs: Rec[];
  courses: { id: string; title: string }[];
  bundles: { id: string; title: string }[];
}

const REC_TYPES = [
  { value: "RECOMMENDED", label: "Recommended" },
  { value: "PREREQUISITE", label: "Prerequisite" },
  { value: "ADVANCED_PREPARATION", label: "Advanced preparation" },
];

const TYPE_LABEL: Record<string, string> = {
  RECOMMENDED: "Recommended",
  PREREQUISITE: "Prerequisite",
  ADVANCED_PREPARATION: "Advanced prep",
};

const inputCls =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function EventRecommendationsManager({ eventId, courseRecs, bundleRecs, courses, bundles }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<"course" | "bundle">("bundle");
  const [targetId, setTargetId] = useState("");
  const [type, setType] = useState("RECOMMENDED");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const options = target === "course" ? courses : bundles;

  function handleAdd() {
    setError(null);
    if (!targetId) {
      setError("Pick a course or bundle.");
      return;
    }
    if (!reason.trim()) {
      setError("Add a reason.");
      return;
    }
    startTransition(async () => {
      const res = await addEventRecommendation({
        eventId,
        target,
        targetId,
        recommendationType: type,
        reason: reason.trim(),
        minimumCompletionPercentage: 100,
      });
      if (!res.success) {
        setError(res.error ?? "Failed to add recommendation");
        return;
      }
      setTargetId("");
      setReason("");
      router.refresh();
    });
  }

  function handleRemove(id: string, t: "course" | "bundle") {
    startTransition(async () => {
      const res = await removeEventRecommendation(id, t);
      if (!res.success) alert(res.error ?? "Failed to remove");
      router.refresh();
    });
  }

  return (
    <div className="mt-4 space-y-5">
      {/* Existing */}
      <div className="space-y-2">
        <RecList icon="bundle" recs={bundleRecs} onRemove={(id) => handleRemove(id, "bundle")} pending={pending} />
        <RecList icon="course" recs={courseRecs} onRemove={(id) => handleRemove(id, "course")} pending={pending} />
        {courseRecs.length + bundleRecs.length === 0 && (
          <p className="text-sm text-muted-foreground">No recommendations yet.</p>
        )}
      </div>

      {/* Add */}
      <div className="rounded-lg border border-dashed border-border p-4">
        <p className="mb-3 text-sm font-semibold">Add a recommendation</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={target}
            onChange={(e) => {
              setTarget(e.target.value as "course" | "bundle");
              setTargetId("");
            }}
            className={inputCls}
          >
            <option value="bundle">Bundle</option>
            <option value="course">Course</option>
          </select>
          <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className={inputCls}>
            <option value="">Select {target}…</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>{o.title}</option>
            ))}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            {REC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason shown to students"
            className={inputCls}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          onClick={handleAdd}
          disabled={pending}
          className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function RecList({
  recs,
  icon,
  onRemove,
  pending,
}: {
  recs: Rec[];
  icon: "course" | "bundle";
  onRemove: (id: string) => void;
  pending: boolean;
}) {
  return (
    <>
      {recs.map((r) => (
        <div key={r.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-medium text-foreground">
              {icon === "bundle" ? (
                <Layers className="h-4 w-4 shrink-0 text-primary" />
              ) : (
                <BookOpen className="h-4 w-4 shrink-0 text-primary" />
              )}
              <span className="truncate">{r.title}</span>
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {TYPE_LABEL[r.type] ?? r.type}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{r.reason}</p>
          </div>
          <button
            onClick={() => onRemove(r.id)}
            disabled={pending}
            aria-label="Remove recommendation"
            className="shrink-0 rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </>
  );
}
