"use client";

import { useState, useTransition } from "react";
import { deleteCourse, toggleCourseStatus } from "@/actions/admin.actions";
import { Link } from "@/i18n/navigation";

interface Props {
  courseId: string;
  status: string;
}

export function CourseActions({ courseId, status }: Props) {
  const [pending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      const result = await toggleCourseStatus(courseId, newStatus);
      if (!result.success) alert(result.error);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCourse(courseId);
      if (!result.success) alert(result.error);
      setShowConfirm(false);
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
          Publish
        </button>
      )}
      {status === "PUBLISHED" && (
        <button
          onClick={() => handleStatusChange("ARCHIVED")}
          disabled={pending}
          className="rounded px-2 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
        >
          Archive
        </button>
      )}
      {status === "ARCHIVED" && (
        <button
          onClick={() => handleStatusChange("DRAFT")}
          disabled={pending}
          className="rounded px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
        >
          Reopen
        </button>
      )}

      {/* Edit */}
      <Link
        href={`/admin/courses/${courseId}/edit`}
        className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
      >
        Edit
      </Link>

      {/* Delete */}
      {showConfirm ? (
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            disabled={pending}
            className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {pending ? "..." : "Confirm"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="rounded px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      )}
    </div>
  );
}
