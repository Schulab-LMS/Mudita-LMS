import { DashboardShell } from "@/components/layout/dashboard-shell";
import { HelpProvider } from "@/components/help/help-provider";
import { auth } from "@/lib/auth";
import { getUnreadCount } from "@/services/notification.service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Seed the topbar bell with the current unread count. Individual pages
  // still own the auth redirect; if there's no session we fall back to 0
  // rather than redirecting from the layout.
  const session = await auth();
  const unreadNotifications = session?.user?.id
    ? await getUnreadCount(session.user.id)
    : 0;

  return (
    <DashboardShell helpPanel={<HelpProvider />} unreadNotifications={unreadNotifications}>
      {children}
    </DashboardShell>
  );
}
