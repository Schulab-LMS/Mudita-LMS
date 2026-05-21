"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { RefreshCw } from "lucide-react";
import { resyncCurriculum } from "@/actions/curriculum.actions";

export function ResyncButton({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function onClick() {
    setMessage(null);
    startTransition(async () => {
      const res = await resyncCurriculum();
      if (res.success && res.result) {
        const r = res.result;
        setMessage({
          ok: true,
          text: `${r.status}: ${r.coursesUpserted} new course(s), ${r.lessonsUpserted} lesson(s) written, ${r.coursesArchived} archived.`,
        });
        router.refresh();
      } else {
        setMessage({ ok: false, text: res.error ?? "Sync failed" });
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || pending}
        className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-launch-gradient px-3 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} aria-hidden />
        {pending ? "Syncing…" : "Resync from Git"}
      </button>
      {message && (
        <p
          className={`text-xs ${message.ok ? "text-emerald-600" : "text-destructive"}`}
          role="status"
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
