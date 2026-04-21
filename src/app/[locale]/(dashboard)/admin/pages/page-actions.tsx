"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { deletePage, togglePagePublish } from "@/actions/page.actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeletePageButton({ pageId, title }: { pageId: string; title: string }) {
  const t = useTranslations("admin.confirm.deletePage");
  const tCommon = useTranslations("admin.common");
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePage(pageId);
      if (!result.success) alert(result.error ?? tCommon("genericError"));
      setConfirmOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
        title={tCommon("delete")}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title={t("title")}
        description={t("body", { name: title })}
        confirmLabel={t("confirm")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        variant="destructive"
        loading={isPending}
      />
    </>
  );
}

export function TogglePublishButton({ pageId, isPublished }: { pageId: string; isPublished: boolean }) {
  const tActions = useTranslations("admin.actions");
  const tCommon = useTranslations("admin.common");
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await togglePagePublish(pageId);
      if (!result.success) alert(result.error ?? tCommon("genericError"));
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
      title={isPublished ? tActions("unpublish") : tActions("publish")}
    >
      {isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}
