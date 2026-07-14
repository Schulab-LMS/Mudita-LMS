"use client";

import { Download } from "lucide-react";
import type { AdminUserTableRow } from "./user-filter";
import { usersToCsv } from "./user-export";

export function ExportUsersButton({
  users,
}: {
  users: AdminUserTableRow[];
}) {
  function handleExport() {
    const blob = new Blob([usersToCsv(users)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `schulab-users-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
    >
      <Download className="h-3.5 w-3.5" aria-hidden />
      Export CSV
    </button>
  );
}
