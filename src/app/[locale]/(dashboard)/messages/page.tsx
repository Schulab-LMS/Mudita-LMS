import { redirect } from "next/navigation";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getInbox, getMessageableUsers } from "@/services/message.service";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoMessagesScene } from "@/components/illustrations/empty-scenes";
import {
  MessageSquare,
  Plus,
  Search,
  Inbox,
  Users as UsersIcon,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

export const metadata = { title: "Messages | Schulab" };

function formatRelative(date: Date, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return rtf.format(0, "minute");
  if (diffMins < 60) return rtf.format(-diffMins, "minute");
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return rtf.format(-diffHours, "hour");
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return rtf.format(-diffDays, "day");
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(date)
  );
}

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [t, tRoles, locale, inbox, contacts] = await Promise.all([
    getTranslations("messages"),
    getTranslations("roles"),
    getLocale(),
    getInbox(session.user.id),
    getMessageableUsers(session.user.id, session.user.role ?? "STUDENT"),
  ]);

  const unreadTotal = inbox.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("conversationsCount", { count: inbox.length })}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main inbox column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Search + unread summary */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
            <div className="relative min-w-[200px] flex-1">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search conversations…"
                className="input-pretty h-10 w-full rounded-lg border border-input bg-background ps-9 pe-3 text-sm focus-visible:outline-none"
              />
            </div>
            {unreadTotal > 0 && (
              <span className="chip chip-primary">
                <Inbox className="h-3 w-3" aria-hidden />
                {unreadTotal} unread
              </span>
            )}
          </div>

          {inbox.length === 0 ? (
            <EmptyState
              illustration={<NoMessagesScene />}
              title={t("emptyTitle")}
              description={t("emptyBody")}
              tone="default"
              size="lg"
            />
          ) : (
            <div className="card-premium divide-y divide-border overflow-hidden">
              {inbox.map((conv) => (
                <Link
                  key={conv.partnerId}
                  href={`/messages/${conv.partnerId}`}
                  className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-muted/40"
                >
                  <div className="relative shrink-0">
                    {conv.partnerAvatar ? (
                      <Image
                        src={conv.partnerAvatar}
                        alt={conv.partnerName ?? t("unknownUser")}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-sm font-semibold text-foreground">
                        {getInitials(conv.partnerName ?? "?")}
                      </div>
                    )}
                    {/* Presence dot — placeholder until real presence wires in */}
                    <span
                      aria-hidden
                      className="absolute -bottom-0.5 -end-0.5 inline-flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-card"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm ${
                          conv.unreadCount > 0
                            ? "font-semibold text-foreground"
                            : "font-medium text-foreground"
                        }`}
                      >
                        {conv.partnerName ?? t("unknownUser")}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatRelative(conv.lastMessageAt, locale)}
                      </span>
                    </div>
                    <p
                      className={`mt-0.5 truncate text-sm ${
                        conv.unreadCount > 0
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {conv.lastMessage}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="mt-1 inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Contacts rail */}
        <aside className="space-y-3">
          <div className="card-premium p-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Plus className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {t("startConversation")}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  {contacts.length} {contacts.length === 1 ? "person" : "people"} you can message
                </p>
              </div>
            </div>

            {contacts.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                {t("noContacts")}
              </p>
            ) : (
              <div className="mt-4 divide-y divide-border">
                {contacts.slice(0, 10).map((user) => (
                  <Link
                    key={user.id}
                    href={`/messages/${user.id}`}
                    className="flex items-center gap-3 px-1 py-2.5 transition-colors hover:bg-muted/40 rounded-md"
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name ?? ""}
                        width={36}
                        height={36}
                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 text-xs font-semibold text-foreground">
                        {getInitials(user.name ?? "?")}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {user.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {tRoles(
                          user.role as
                            | "STUDENT"
                            | "TUTOR"
                            | "PARENT"
                            | "ADMIN"
                            | "SUPER_ADMIN"
                            | "B2B_PARTNER"
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Helpful tip */}
          <div className="rounded-2xl border border-primary/20 bg-launch-gradient-soft p-4">
            <div className="flex items-start gap-2">
              <UsersIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <div className="text-xs">
                <p className="font-semibold text-foreground">Stay connected</p>
                <p className="mt-1 text-muted-foreground">
                  Message your tutors, classmates, or children directly. Everyone
                  is verified and every conversation is encrypted in transit.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile-only "new conversation" FAB */}
      <div className="fixed bottom-20 end-4 z-10 lg:hidden">
        <Link
          href="#"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-launch-gradient text-white shadow-lg"
          aria-label="New conversation"
        >
          <MessageSquare className="h-5 w-5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
