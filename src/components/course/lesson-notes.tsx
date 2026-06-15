"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, NotebookPen } from "lucide-react";
import { saveLessonNote } from "@/actions/lesson-engagement.actions";

type SaveState = "idle" | "saving" | "saved" | "error";

// Private per-learner notes for a lesson. Debounced autosave (1.2s after the
// last keystroke) plus a flush on blur, so notes persist without a Save button.
export function LessonNotes({
  lessonId,
  initialContent,
  readOnly = false,
}: {
  lessonId: string;
  initialContent: string;
  readOnly?: boolean;
}) {
  const [content, setContent] = useState(initialContent);
  const [state, setState] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest typed value, read by the debounced timer without re-arming it.
  const latest = useRef(initialContent);
  // The last value we successfully persisted — avoids re-saving unchanged text.
  const lastSaved = useRef(initialContent);

  const flush = useCallback(async () => {
    if (readOnly) return;
    const value = latest.current;
    if (value === lastSaved.current) return;
    setState("saving");
    const res = await saveLessonNote({ lessonId, content: value });
    if (res.success) {
      lastSaved.current = value;
      setState("saved");
    } else {
      setState("error");
    }
  }, [lessonId, readOnly]);

  // Clear any pending debounce timer when the component unmounts.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function onChange(value: string) {
    setContent(value);
    latest.current = value;
    if (readOnly) return;
    setState(value === lastSaved.current ? "saved" : "idle");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), 1200);
  }

  if (readOnly) {
    return (
      <div className="space-y-3">
        <textarea
          value={content}
          readOnly
          rows={8}
          placeholder="Notes are disabled while previewing."
          className="input-pretty w-full rounded-lg border border-input bg-muted/40 p-3 text-sm focus-visible:outline-none"
        />
        <p className="text-xs text-muted-foreground">
          Sign in as a student to keep private notes on this lesson.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <NotebookPen className="h-3.5 w-3.5" aria-hidden />
          Your private notes
        </label>
        <SaveBadge state={state} />
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => void flush()}
        rows={8}
        placeholder="Jot down what you're learning. Only you can see this — it saves automatically."
        className="input-pretty w-full rounded-lg border border-input bg-background p-3 text-sm leading-relaxed focus-visible:outline-none"
      />
    </div>
  );
}

function SaveBadge({ state }: { state: SaveState }) {
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" role="status">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> Saving…
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400" role="status">
        <Check className="h-3 w-3" aria-hidden /> Saved
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="text-xs text-red-600 dark:text-red-400" role="status">
        Couldn’t save — check your connection
      </span>
    );
  }
  return null;
}
