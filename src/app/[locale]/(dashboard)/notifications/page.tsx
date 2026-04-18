import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getNotifications } from "@/services/notification.service";
import { markAllNotificationsRead } from "@/actions/notification.actions";

export const metadata = { title: "Notifications | Schulab" };

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await getNotifications(session.user.id);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <form
            action={async () => {
              "use server";
              await markAllNotificationsRead();
            }}
          >
            <button
              type="submit"
              className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-5xl">🔔</p>
          <p className="mt-3 text-lg font-medium">No notifications yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;re all caught up!
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden divide-y">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex gap-3 px-5 py-4 ${
                !notification.isRead ? "bg-blue-50/50" : ""
              }`}
            >
              <div className="mt-1.5 flex-shrink-0">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    notification.isRead ? "bg-gray-300" : "bg-blue-500"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm ${
                    notification.isRead ? "text-foreground" : "font-semibold"
                  }`}
                >
                  {notification.title}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {notification.body}
                </p>
              </div>
              <p className="flex-shrink-0 text-xs text-muted-foreground">
                {timeAgo(notification.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
