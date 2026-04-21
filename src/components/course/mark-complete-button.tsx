"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { markLessonDone } from "@/actions/enrollment.actions";
import { CheckCircle, Circle } from "lucide-react";

interface MarkCompleteButtonProps {
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  nextLessonId?: string;
  courseSlug: string;
}

export function MarkCompleteButton({
  lessonId,
  courseId,
  isCompleted,
  nextLessonId,
  courseSlug,
}: MarkCompleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(isCompleted);
  const router = useRouter();
  const t = useTranslations("lesson");

  async function handleMark() {
    if (done) return;
    setLoading(true);
    await markLessonDone(lessonId, courseId);
    setDone(true);
    setLoading(false);
    if (nextLessonId) {
      router.push(`/student/learn/${courseSlug}/${nextLessonId}`);
    } else {
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleMark}
      disabled={loading || done}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        done
          ? "bg-green-100 text-green-700 cursor-default"
          : "bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
      }`}
    >
      {done ? (
        <>
          <CheckCircle className="h-4 w-4" />
          {t("completed")}
        </>
      ) : (
        <>
          <Circle className="h-4 w-4" />
          {loading ? t("saving") : t("markComplete")}
        </>
      )}
    </button>
  );
}
