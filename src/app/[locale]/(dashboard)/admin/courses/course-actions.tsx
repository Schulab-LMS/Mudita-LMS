"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteCourse, toggleCourseStatus } from "@/actions/admin.actions";
import { Link } from "@/i18n/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Props {
  courseId: string;
  status: string;
}

export function CourseActions({ courseId, status }: Props) {
  const tConfirm = useTranslations("admin.confirm.deleteCourse");
  const tCommon = useTranslations("admin.common");
  const tActions = useTranslations("admin.actions");
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      const result = await toggleCourseStatus(courseId, newStatus);
      if (!result.success) alert(result.error ?? tCommon("genericError"));
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCourse(courseId);
      if (!result.success) alert(result.error ?? tCommon("genericError"));
      setConfirmOpen(false);
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Status toggle */}
      {status === "DRAFT" && (
        <button
          onClick={() => handleStatusChange("PUBLISHED")}
          disabled={pending}
          className="rounded px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
        >
          {tActions("publish")}
        </button>
      )}
      {status === "PUBLISHED" && (
        <button
          onClick={() => handleStatusChange("ARCHIVED")}
          disabled={pending}
          className="rounded px-2 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
        >
          {tActions("archive")}
        </button>
      )}
      {status === "ARCHIVED" && (
        <button
          onClick={() => handleStatusChange("DRAFT")}
          disabled={pending}
          className="rounded px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
        >
          {tActions("reopen")}
        </button>
      )}

      {/* Edit */}
      <Link
        href={`/admin/courses/${courseId}/edit`}
        className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
      >
        {tCommon("edit")}
      </Link>

      {/* Delete */}
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={pending}
        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {tCommon("delete")}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title={tConfirm("title")}
        description={tConfirm("body")}
        confirmLabel={tConfirm("confirm")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        variant="destructive"
        loading={pending}
      />
    </div>
  );
}
