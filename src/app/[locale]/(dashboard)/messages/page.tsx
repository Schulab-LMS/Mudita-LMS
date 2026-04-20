import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { getInbox, getMessageableUsers } from "@/services/message.service";
import { Link } from "@/i18n/navigation";
import { MessageSquare, Plus } from "lucide-react";

export const metadata = { title: "Messages | Schulab" };

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return diffDays < 7 ? `${diffDays}d ago` : new Date(date).toLocaleDateString();
}

const roleLabel: Record<string, string> = {
  STUDENT: "Student",
  TUTOR: "Tutor",
  ADMIN: "Admin",
  PARENT: "Parent",
};

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [inbox, contacts] = await Promise.all([
    getInbox(session.user.id),
    getMessageableUsers(session.user.id, session.user.role ?? "STUDENT"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground text-sm">
            {inbox.length === 0 ? "No conversations yet" : `${inbox.length} conversation${inbox.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversations list */}
        <div className="lg:col-span-2">
          {inbox.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center">
              <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">No messages yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start a conversation with a tutor or student.
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-xl border bg-card overflow-hidden">
              {inbox.map((conv) => (
                <Link
                  key={conv.partnerId}
                  href={`/messages/${conv.partnerId}`}
                  className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {conv.partnerAvatar ? (
                      <Image
                        src={conv.partnerAvatar}
                        alt={conv.partnerName ?? "User"}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                        {(conv.partnerName ?? "?")[0].toUpperCase()}
                      </div>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-semibold truncate ${conv.unreadCount > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                        {conv.partnerName ?? "Unknown User"}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {timeAgo(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className={`mt-0.5 text-sm truncate ${conv.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* New conversation panel */}
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <Plus className="h-4 w-4" />
            Start a Conversation
          </h2>
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts available.</p>
          ) : (
            <div className="divide-y rounded-xl border bg-card overflow-hidden">
              {contacts.slice(0, 10).map((user) => (
                <Link
                  key={user.id}
                  href={`/messages/${user.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name ?? ""}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/10 text-secondary font-bold">
                      {(user.name ?? "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{roleLabel[user.role] ?? user.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
