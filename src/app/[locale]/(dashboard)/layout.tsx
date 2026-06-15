import { DashboardShell } from "@/components/layout/dashboard-shell";
import { HelpProvider } from "@/components/help/help-provider";
import { isAdminRole } from "@/lib/auth-helpers";
import { getViewContext } from "@/lib/view-as.server";
import { getUnreadCount } from "@/services/notification.service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolve the effective role (the admin role-preview overlay) once here and
  // pass it into the shell so the nav, role badge, and preview banner render
  // for the previewed role. Seed the topbar bell with the unread count.
  const { session, realRole, effectiveRole, isPreviewing, previewRole } =
    await getViewContext();
  const unreadNotifications = session?.user?.id
    ? await getUnreadCount(session.user.id)
    : 0;

  return (
    <DashboardShell
      helpPanel={<HelpProvider />}
      unreadNotifications={unreadNotifications}
      effectiveRole={effectiveRole ?? null}
      canPreview={isAdminRole(realRole)}
      isPreviewing={isPreviewing}
      previewRole={previewRole}
    >
      {children}
    </DashboardShell>
  );
}
