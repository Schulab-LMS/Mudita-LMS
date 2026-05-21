"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { BookOpen, Link2, CheckCircle2 } from "lucide-react";
import {
  setSessionLesson,
  setSessionMeetingUrl,
  completeSession,
} from "@/actions/session.actions";

interface CourseTree {
  id: string;
  title: string;
  modules: {
    id: string;
    title: string;
    lessons: { id: string; title: string }[];
  }[];
}

export function TutorControls({
  bookingId,
  currentLessonId,
  meetingUrl,
  status,
  courses,
}: {
  bookingId: string;
  currentLessonId: string | null;
  meetingUrl: string | null;
  status: string;
  courses: CourseTree[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [lessonId, setLessonId] = useState(currentLessonId ?? "");
  const [url, setUrl] = useState(meetingUrl ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function run(fn: () => Promise<{ success: boolean; error?: string }>, ok: string) {
    setMsg(null);
    startTransition(async () => {
      const res = await fn();
      setMsg(res.success ? { ok: true, text: ok } : { ok: false, text: res.error ?? "Failed" });
      if (res.success) router.refresh();
    });
  }

  const isDone = status === "COMPLETED" || status === "CANCELLED";

  return (
    <div className="card-premium space-y-5 p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <BookOpen className="h-4 w-4 text-primary" aria-hidden /> Session controls
      </h2>

      {/* Lesson assignment */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">
          Lesson to teach
        </label>
        <select
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value)}
          disabled={pending || isDone}
          className="input-pretty h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
        >
          <option value="">— Select a lesson —</option>
          {courses.map((c) => (
            <optgroup key={c.id} label={c.title}>
              {c.modules.flatMap((m) =>
                m.lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {m.title} · {l.title}
                  </option>
                ))
              )}
            </optgroup>
          ))}
        </select>
        <button
          type="button"
          disabled={pending || isDone || !lessonId || lessonId === currentLessonId}
          onClick={() => run(() => setSessionLesson(bookingId, lessonId), "Lesson set")}
          className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Set lesson
        </button>
      </div>

      {/* Meeting link */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Link2 className="h-3.5 w-3.5" aria-hidden /> Video meeting link
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={pending || isDone}
          placeholder="https://meet.google.com/…"
          className="input-pretty h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
        />
        <button
          type="button"
          disabled={pending || isDone}
          onClick={() => run(() => setSessionMeetingUrl(bookingId, url), "Meeting link saved")}
          className="inline-flex h-9 items-center rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
        >
          Save link
        </button>
      </div>

      {/* Complete */}
      {!isDone && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => completeSession(bookingId), "Session marked complete")}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-launch-gradient px-3 text-xs font-semibold text-white hover:-translate-y-0.5 disabled:opacity-50"
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Mark session complete
        </button>
      )}

      {msg && (
        <p className={`text-xs ${msg.ok ? "text-emerald-600" : "text-destructive"}`} role="status">
          {msg.text}
        </p>
      )}
    </div>
  );
}
