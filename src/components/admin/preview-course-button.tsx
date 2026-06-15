"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Eye } from "lucide-react";
import { setPreviewRole } from "@/actions/preview.actions";

// Admin entry point: enter student preview and jump straight into this course's
// learner view (works for DRAFT courses too — the learner page skips the
// enrolment gate while previewing). Exit is via the global preview banner.
export function PreviewCourseButton({
  courseSlug,
  firstLessonId,
}: {
  courseSlug: string;
  firstLessonId: string;
}) {
  const t = useTranslations("preview");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function go() {
    startTransition(async () => {
      const res = await setPreviewRole("STUDENT");
      if (res.success) {
        router.push(`/student/learn/${courseSlug}/${firstLessonId}`);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={go}
      disabled={pending}
      className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
    >
      <Eye className="h-3.5 w-3.5" aria-hidden />
      {pending ? "…" : t("courseButton")}
    </button>
  );
}
