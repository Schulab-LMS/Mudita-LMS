import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getThread, markThreadAsRead } from "@/services/message.service";
import { markMessageNotificationsRead } from "@/services/notification.service";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { SendForm } from "./send-form";
import { getInitials } from "@/lib/utils";

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

function formatTime(date: Date, locale: string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }
  if (diffDays < 7) {
    return new Intl.DateTimeFormat(locale, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function ThreadPage({ params }: Props) {
  const { userId: otherUserId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (otherUserId === session.user.id) redirect("/messages");

  const otherUser = await db.user.findUnique({
    where: { id: otherUserId },
    select: { id: true, name: true, avatar: true, role: true },
  });
  if (!otherUser) notFound();

  // Opening the thread reads the messages and clears their bell badges.
  await Promise.all([
    markThreadAsRead(session.user.id, otherUserId),
    markMessageNotificationsRead(session.user.id, otherUserId),
  ]);
  const [t, tRoles, locale, messages] = await Promise.all([
    getTranslations("messages"),
    getTranslations("roles"),
    getLocale(),
    getThread(session.user.id, otherUserId),
  ]);

  return (
    <div className="card-premium flex h-[calc(100vh-8rem)] flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
        <Link
          href="/messages"
          className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
          <span className="hidden sm:inline">{t("inbox")}</span>
        </Link>
        <div className="h-4 w-px bg-border" />
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative shrink-0">
            {otherUser.avatar ? (
              <Image
                src={otherUser.avatar}
                alt={otherUser.name ?? ""}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-xs font-semibold text-foreground">
                {getInitials(otherUser.name ?? "?")}
              </div>
            )}
            <span
              aria-hidden
              className="absolute -bottom-0.5 -end-0.5 inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-card"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {otherUser.name ?? t("unknownUser")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {tRoles(otherUser.role as "STUDENT" | "TUTOR" | "PARENT" | "ADMIN" | "SUPER_ADMIN" | "B2B_PARTNER")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-launch-gradient-soft">
              <span className="text-3xl" role="img" aria-label="wave">
                👋
              </span>
            </div>
            <p className="font-semibold text-foreground">
              {t("startWith", { name: otherUser.name ?? t("unknownUser") })}
            </p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              {t("privateMessages")}
            </p>
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
                      {formatTime(msg.createdAt, locale)}
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

      <SendForm receiverId={otherUserId} />
    </div>
  );
}
