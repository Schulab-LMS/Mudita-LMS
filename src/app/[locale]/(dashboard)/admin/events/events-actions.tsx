"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { deleteEvent, toggleEventListing } from "@/actions/event.actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Props {
  eventId: string;
  listingStatus: string;
}

const STATUSES = ["ACTIVE", "OPTIONAL", "ARCHIVED"] as const;

export function EventRowActions({ eventId, listingStatus }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleStatus(next: string) {
    startTransition(async () => {
      const res = await toggleEventListing(eventId, next);
      if (!res.success) alert(res.error ?? "Failed to update status");
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteEvent(eventId);
      if (!res.success) alert(res.error ?? "Failed to delete event");
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <select
        value={listingStatus}
        disabled={pending}
        onChange={(e) => handleStatus(e.target.value)}
        aria-label="Listing status"
        className="rounded border border-input bg-background px-2 py-1 text-xs disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </option>
        ))}
      </select>

      <Link
        href={`/admin/events/${eventId}`}
        className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
      >
        Edit
      </Link>

      <button
        onClick={() => setConfirmOpen(true)}
        disabled={pending}
        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Delete
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete event"
        description="This removes the event and all its course/bundle recommendations. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        variant="destructive"
        loading={pending}
      />
    </div>
  );
}
