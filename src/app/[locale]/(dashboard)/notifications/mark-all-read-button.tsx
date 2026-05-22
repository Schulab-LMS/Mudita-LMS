"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { CheckCheck } from "lucide-react";
import { markAllNotificationsRead } from "@/actions/notification.actions";
import { emitNotificationsChanged } from "@/lib/notification-events";

export function MarkAllReadButton() {
  const t = useTranslations("notifications");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await markAllNotificationsRead();
      // Refresh this page's list and clear the topbar badge immediately.
      router.refresh();
      emitNotificationsChanged();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
    >
      <CheckCheck className="h-3.5 w-3.5" aria-hidden />
      {t("markAllRead")}
    </button>
  );
}
