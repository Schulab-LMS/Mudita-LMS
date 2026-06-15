"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { PreviewBanner } from "@/components/layout/preview-banner";
import type { PreviewableRole } from "@/lib/view-as";

interface DashboardShellProps {
  children: React.ReactNode;
  helpPanel: React.ReactNode;
  unreadNotifications?: number;
  /** Effective role (preview role when previewing, else the real role) — drives nav. */
  effectiveRole?: string | null;
  /** Whether the real user may use the preview switcher (admins only). */
  canPreview?: boolean;
  isPreviewing?: boolean;
  previewRole?: PreviewableRole | null;
}

export function DashboardShell({
  children,
  helpPanel,
  unreadNotifications = 0,
  effectiveRole = null,
  canPreview = false,
  isPreviewing = false,
  previewRole = null,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        effectiveRole={effectiveRole}
        canPreview={canPreview}
        previewRole={previewRole}
      />
      <div className="md:ms-64">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          unreadNotifications={unreadNotifications}
        />
        {isPreviewing && previewRole && <PreviewBanner role={previewRole} />}
        <main className="min-h-[calc(100vh-4rem)] bg-muted/30 p-6">
          {children}
        </main>
      </div>
      {helpPanel}
    </div>
  );
}
