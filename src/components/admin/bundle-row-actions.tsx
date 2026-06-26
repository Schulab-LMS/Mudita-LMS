"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { deleteBundle } from "@/actions/bundle.actions";
import { Pencil, ListOrdered, Trash2 } from "lucide-react";

export function BundleRowActions({ bundleId }: { bundleId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function onDelete() {
    startTransition(async () => {
      const res = await deleteBundle(bundleId);
      if (res.success) router.refresh();
      else setConfirming(false);
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/bundles/${bundleId}/courses`}
        className="inline-flex h-8 items-center gap-1 rounded-md border border-input px-2 text-xs font-medium hover:bg-muted"
        title="Manage courses"
      >
        <ListOrdered className="h-3.5 w-3.5" /> Courses
      </Link>
      <Link
        href={`/admin/bundles/${bundleId}/edit`}
        className="inline-flex h-8 items-center gap-1 rounded-md border border-input px-2 text-xs font-medium hover:bg-muted"
      >
        <Pencil className="h-3.5 w-3.5" /> Edit
      </Link>
      {confirming ? (
        <>
          <button
            onClick={onDelete}
            disabled={pending}
            className="inline-flex h-8 items-center rounded-md bg-red-600 px-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? "…" : "Confirm"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="inline-flex h-8 items-center rounded-md border border-input px-2 text-xs font-medium hover:bg-muted"
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-input px-2 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      )}
    </div>
  );
}
