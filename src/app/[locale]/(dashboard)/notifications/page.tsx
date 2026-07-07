import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { getNotifications } from "@/services/notification.service";
import { MarkAllReadButton } from "./mark-all-read-button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoNotificationsScene } from "@/components/illustrations/empty-scenes";
import {
  Bell,
  BookOpen,
  GraduationCap,
  Award,
  MessageSquare,
  Trophy,
  Settings,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

export const metadata = { title: "Notifications" };

// Map notification `type` strings to a visual treatment. Unknown types fall
// back to a generic Bell icon on primary tone.
interface TypeVisual {
  icon: LucideIcon;
  tone: string; // tailwind classes for the icon container
}

const TYPE_VISUAL: Record<string, TypeVisual> = {
  ENROLLMENT: {
    icon: BookOpen,
    tone: "bg-primary/10 text-primary",
  },
  COURSE_COMPLETED: {
    icon: GraduationCap,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  CERTIFICATE: {
    icon: Award,
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  MESSAGE: {
    icon: MessageSquare,
    tone: "bg-secondary/10 text-secondary",
  },
  COMPETITION: {
    icon: Trophy,
    tone: "bg-accent/10 text-accent",
  },
  BADGE: {
    icon: Award,
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  SYSTEM: {
    icon: Settings,
    tone: "bg-muted text-muted-foreground",
  },
};

function getVisual(type: string): TypeVisual {
  return (
    TYPE_VISUAL[type.toUpperCase()] ?? {
      icon: Bell,
      tone: "bg-primary/10 text-primary",
    }
  );
}

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

function startOfDay(d: Date): number {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [t, locale, notifications] = await Promise.all([
    getTranslations("notifications"),
    getLocale(),
    getNotifications(session.user.id),
  ]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Group notifications by day
  const dayFmt = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const groups = new Map<
    number,
    { label: string; items: typeof notifications }
  >();
  const today = startOfDay(new Date());
  const yesterday = today - 86_400_000;

  for (const n of notifications) {
    const key = startOfDay(new Date(n.createdAt));
    const label =
      key === today
        ? "Today"
        : key === yesterday
          ? "Yesterday"
          : dayFmt.format(new Date(n.createdAt));
    if (!groups.has(key)) groups.set(key, { label, items: [] });
    groups.get(key)!.items.push(n);
  }

  const sortedKeys = [...groups.keys()].sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={
          unreadCount > 0
            ? t("unreadCount", { count: unreadCount })
            : `${notifications.length} notification${
                notifications.length === 1 ? "" : "s"
              }`
        }
        actions={unreadCount > 0 ? <MarkAllReadButton /> : undefined}
      />

      {notifications.length === 0 ? (
        <EmptyState
          illustration={<NoNotificationsScene />}
          title={t("emptyTitle")}
          description={t("emptyBody")}
          tone="default"
          size="lg"
        />
      ) : (
        <div className="space-y-6">
          {sortedKeys.map((dayKey) => {
            const group = groups.get(dayKey)!;
            return (
              <section key={dayKey}>
                {/* Sticky day header */}
                <div className="sticky top-16 z-10 -mx-4 mb-3 bg-background/80 px-4 backdrop-blur-sm sm:-mx-0 sm:px-0">
                  <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.label}
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-bold text-foreground">
                      {group.items.length}
                    </span>
                  </h2>
                </div>
                <div className="card-premium divide-y divide-border overflow-hidden">
                  {group.items.map((n) => {
                    const visual = getVisual(n.type);
                    const Icon = visual.icon;
                    const content = (
                      <div
                        className={`flex items-start gap-3 px-5 py-4 transition-colors ${
                          n.link ? "cursor-pointer hover:bg-muted/40" : ""
                        } ${!n.isRead ? "bg-primary/5" : ""}`}
                      >
                        <span
                          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${visual.tone}`}
                        >
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p
                              className={`text-sm ${
                                !n.isRead
                                  ? "font-semibold text-foreground"
                                  : "font-medium text-foreground"
                              }`}
                            >
                              {n.title}
                            </p>
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              {formatRelative(n.createdAt, locale)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {n.body}
                          </p>
                        </div>
                        {n.link && (
                          <ArrowRight
                            className="mt-1 h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180"
                            aria-hidden
                          />
                        )}
                        {!n.isRead && (
                          <span
                            aria-label="Unread"
                            className="absolute start-1 top-1/2 inline-flex h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary"
                          />
                        )}
                      </div>
                    );

                    return n.link ? (
                      <Link
                        key={n.id}
                        href={n.link}
                        className="relative block"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div key={n.id} className="relative">
                        {content}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
