"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import { verifyTutor, rejectTutor, deleteTutorProfile } from "@/actions/tutor.actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function VerifyTutorButton({ tutorId }: { tutorId: string }) {
  const tActions = useTranslations("admin.actions");
  const tCommon = useTranslations("admin.common");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(async () => {
        const result = await verifyTutor(tutorId);
        if (!result.success) alert(result.error ?? tCommon("genericError"));
      })}
      disabled={isPending}
      className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
      title={tActions("approve")}
    >
      <CheckCircle className="h-3.5 w-3.5" />
      {tActions("approve")}
    </button>
  );
}

export function RejectTutorButton({ tutorId }: { tutorId: string }) {
  const tActions = useTranslations("admin.actions");
  const tCommon = useTranslations("admin.common");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(async () => {
        const result = await rejectTutor(tutorId);
        if (!result.success) alert(result.error ?? tCommon("genericError"));
      })}
      disabled={isPending}
      className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
      title={tActions("revoke")}
    >
      <XCircle className="h-3.5 w-3.5" />
      {tActions("revoke")}
    </button>
  );
}

export function DeleteTutorButton({ tutorId, name }: { tutorId: string; name: string }) {
  const t = useTranslations("admin.confirm.deleteTutor");
  const tCommon = useTranslations("admin.common");
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTutorProfile(tutorId);
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
        description={t("body", { name })}
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
