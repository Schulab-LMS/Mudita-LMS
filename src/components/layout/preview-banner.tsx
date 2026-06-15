"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Eye, X } from "lucide-react";
import { clearPreviewRole } from "@/actions/preview.actions";
import type { PreviewableRole } from "@/lib/view-as";

// Always-visible bar shown while an admin is previewing as another role. Makes
// the overlay obvious and gives a one-click exit. Rendered by DashboardShell.
export function PreviewBanner({ role }: { role: PreviewableRole }) {
  const t = useTranslations("preview");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const roleLabel = t(role.toLowerCase() as "student" | "tutor" | "parent");

  function exit() {
    startTransition(async () => {
      await clearPreviewRole();
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div
      role="status"
      className="sticky top-0 z-20 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100"
    >
      <span className="inline-flex items-center gap-1.5 font-medium">
        <Eye className="h-4 w-4 shrink-0" aria-hidden />
        {t("previewingAs", { role: roleLabel })}
        <span className="opacity-70">· {t("readOnly")}</span>
      </span>
      <button
        type="button"
        onClick={exit}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-md border border-amber-400 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-200 disabled:opacity-60 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-100"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
        {pending ? "…" : t("exit")}
      </button>
    </div>
  );
}
