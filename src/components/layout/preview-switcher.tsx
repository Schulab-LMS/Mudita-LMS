"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Eye } from "lucide-react";
import { setPreviewRole } from "@/actions/preview.actions";
import { PREVIEWABLE_ROLES, type PreviewableRole } from "@/lib/view-as";
import { cn } from "@/lib/utils";

// Admin-only control in the sidebar to enter role preview. The active role is
// highlighted; exiting is handled by the always-visible PreviewBanner.
export function PreviewSwitcher({ current }: { current: PreviewableRole | null }) {
  const t = useTranslations("preview");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function enter(role: PreviewableRole) {
    startTransition(async () => {
      const res = await setPreviewRole(role);
      if (res.success) {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <div className="border-b border-border/60 px-3 py-3">
      <p className="mb-1.5 flex items-center gap-1 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <Eye className="h-3 w-3" aria-hidden /> {t("switch")}
      </p>
      <div className="grid grid-cols-3 gap-1">
        {PREVIEWABLE_ROLES.map((role) => {
          const active = current === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => enter(role)}
              disabled={pending}
              aria-pressed={active}
              className={cn(
                "rounded-md px-1.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {t(role.toLowerCase() as "student" | "tutor" | "parent")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
