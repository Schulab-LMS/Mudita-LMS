"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { Menu, Bell, Search, Globe } from "lucide-react";
import { HelpButton } from "@/components/help/help-button";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { getUnreadNotificationCount } from "@/actions/notification.actions";

// How often the bell re-checks for new notifications while the user stays
// on a page. The dashboard layout is preserved across client navigations,
// so its server-rendered count never refreshes on its own.
const NOTIFICATION_POLL_MS = 30_000;

interface TopbarProps {
  onMenuClick: () => void;
  unreadNotifications?: number;
  breadcrumbs?: BreadcrumbItem[];
}

// Segments that look like a database ID rather than a meaningful route
// name. We drop these from the auto-derived topbar breadcrumb so users
// don't see raw cuids like "cmnhcll510090abp4jqywbqua" — the PageHeader
// below already carries the readable title.
const ID_LIKE = [
  /^c[a-z0-9]{20,}$/i, // cuid
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, // uuid
  /^[0-9a-f]{24}$/i, // mongo-style objectid
  /^\d{6,}$/, // long numeric ids
];

function isIdLike(seg: string): boolean {
  return ID_LIKE.some((r) => r.test(seg));
}

function pathToBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];
  const items: BreadcrumbItem[] = [];
  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    if (isIdLike(seg)) continue; // skip raw IDs in the trail
    const label = seg
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    items.push({ label, href: acc });
  }
  // Last crumb is current page — strip href.
  if (items.length > 0) items[items.length - 1].href = undefined;
  return items;
}

export function Topbar({ onMenuClick, unreadNotifications = 0, breadcrumbs }: TopbarProps) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  // Seed with the server-rendered count to avoid a flash, then keep it
  // fresh by polling and re-checking whenever the tab regains focus or the
  // route changes — so a newly arrived message badges the bell without a
  // manual reload.
  const [unread, setUnread] = useState(unreadNotifications);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const count = await getUnreadNotificationCount();
        if (active) setUnread(count);
      } catch {
        // transient failure — keep the last known count
      }
    };

    const interval = setInterval(refresh, NOTIFICATION_POLL_MS);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    // Re-check on every navigation (e.g. landing on /notifications and
    // marking everything read should drop the badge promptly).
    refresh();

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname]);

  const crumbs = breadcrumbs ?? pathToBreadcrumbs(pathname);

  function handleLocaleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLocale = e.target.value as Locale;
    router.replace(pathname, { locale: newLocale });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/courses?q=${encodeURIComponent(q)}` : "/courses");
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      {/* Hamburger menu - mobile only */}
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs — hidden on small screens to save space */}
      {crumbs.length > 0 && (
        <div className="hidden min-w-0 flex-1 lg:block">
          <Breadcrumbs items={crumbs} />
        </div>
      )}

      {/* Search — takes the space when no breadcrumbs visible */}
      <form
        onSubmit={handleSearchSubmit}
        className={`flex items-center ${crumbs.length > 0 ? "lg:w-64" : "flex-1"}`}
        role="search"
      >
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search")}
            aria-label={t("search")}
            className="input-pretty h-9 w-full rounded-lg border border-input bg-muted/40 ps-9 pe-4 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <ThemeToggle size="sm" />

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t("notifications")}
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span
              aria-label={`${unread} unread`}
              className="absolute end-1 top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-sm"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>

        {/* Help */}
        <HelpButton variant="topbar" />

        {/* Locale switcher */}
        <div className="relative hidden items-center sm:flex">
          <Globe className="pointer-events-none absolute start-2 h-4 w-4 text-muted-foreground" />
          <select
            value={locale}
            onChange={handleLocaleChange}
            aria-label={t("language")}
            className="h-9 cursor-pointer appearance-none rounded-lg border border-input bg-transparent py-1 ps-7 pe-3 text-sm outline-none hover:bg-muted focus:border-primary"
          >
            {locales.map((loc) => (
              <option key={loc} value={loc}>
                {localeNames[loc]}
              </option>
            ))}
          </select>
        </div>

        {/* User menu */}
        <UserMenu variant="topbar" />
      </div>
    </header>
  );
}
