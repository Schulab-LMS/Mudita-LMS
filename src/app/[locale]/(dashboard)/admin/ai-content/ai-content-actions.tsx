"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { setLessonAiStatus } from "@/actions/ai-content.actions";

const STATUSES = [
  "SOURCE_COLLECTED",
  "AI_GENERATED",
  "UNDER_REVIEW",
  "REVISION_NEEDED",
  "APPROVED",
] as const;

interface Props {
  lessonId: string;
  currentStatus: (typeof STATUSES)[number];
  /** APPROVED is disabled until the lesson has at least one source citation. */
  canApprove: boolean;
}

export function AiContentActions({ lessonId, currentStatus, canApprove }: Props) {
  const t = useTranslations("admin.aiContent");
  const tCommon = useTranslations("admin.common");
  const [pending, startTransition] = useTransition();

  function handleChange(next: string) {
    if (next === currentStatus) return;
    startTransition(async () => {
      const result = await setLessonAiStatus(lessonId, next);
      if (!result.success) alert(result.error ?? tCommon("genericError"));
    });
  }

  return (
    <div className="flex justify-end">
      <select
        aria-label={t("changeStatus")}
        value={currentStatus}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value)}
        className="input-pretty h-8 rounded-lg border border-input bg-background px-2 text-xs focus-visible:outline-none disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s} disabled={s === "APPROVED" && !canApprove}>
            {t(`status.${s}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
