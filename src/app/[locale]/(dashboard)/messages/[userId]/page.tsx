import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { getThread, markThreadAsRead } from "@/services/message.service";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { SendForm } from "./send-form";

interface Props {
  params: Promise<{ userId: string; locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { userId } = await params;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  return { title: `${user?.name ?? "Messages"} | Schulab` };
}

function formatTime(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function ThreadPage({ params }: Props) {
  const { userId: otherUserId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Prevent messaging self
  if (otherUserId === session.user.id) redirect("/messages");

  // Verify the other user exists
  const otherUser = await db.user.findUnique({
    where: { id: otherUserId },
    select: { id: true, name: true, avatar: true, role: true },
  });
  if (!otherUser) notFound();

  // Mark incoming messages as read, then fetch thread
  await markThreadAsRead(session.user.id, otherUserId);
  const messages = await getThread(session.user.id, otherUserId);

  const roleLabel: Record<string, string> = {
    STUDENT: "Student",
    TUTOR: "Tutor",
    ADMIN: "Admin",
    PARENT: "Parent",
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link
          href="/messages"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Inbox</span>
        </Link>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-3">
          {otherUser.avatar ? (
            <Image
              src={otherUser.avatar}
              alt={otherUser.name ?? ""}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
              {(otherUser.name ?? "?")[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">{otherUser.name ?? "Unknown User"}</p>
            <p className="text-xs text-muted-foreground">{roleLabel[otherUser.role] ?? otherUser.role}</p>
          </div>
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-4xl mb-3">👋</p>
            <p className="font-medium text-muted-foreground">
              Start the conversation with {otherUser.name}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">Your messages are private.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.senderId === session.user.id;
            const showTime =
              index === 0 ||
              new Date(msg.createdAt).getTime() -
                new Date(messages[index - 1].createdAt).getTime() >
                5 * 60 * 1000;

            return (
              <div key={msg.id}>
                {showTime && (
                  <div className="flex justify-center">
                    <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-3 py-0.5 my-1">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                )}
                <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                  {!isMine && (
                    <div className="shrink-0 mb-1">
                      {msg.sender.avatar ? (
                        <Image
                          src={msg.sender.avatar}
                          alt=""
                          width={28}
                          height={28}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                          {(msg.sender.name ?? "?")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isMine
                        ? "rounded-br-sm bg-primary text-white"
                        : "rounded-bl-sm bg-muted text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Send form */}
      <SendForm receiverId={otherUserId} />
    </div>
  );
}
