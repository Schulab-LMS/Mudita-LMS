"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/actions/product.actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeleteProductButton({ productId, name }: { productId: string; name: string }) {
  const t = useTranslations("admin.confirm.deleteProduct");
  const tCommon = useTranslations("admin.common");
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProduct(productId);
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
