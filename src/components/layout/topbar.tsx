"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { Menu, Bell, Search, Globe } from "lucide-react";
import { HelpButton } from "@/components/help/help-button";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";

interface TopbarProps {
  onMenuClick: () => void;
  unreadNotifications?: number;
  breadcrumbs?: BreadcrumbItem[];
}

function pathToBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];
  const items: BreadcrumbItem[] = [];
  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
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
          {unreadNotifications > 0 && (
            <span
              aria-label={`${unreadNotifications} unread`}
              className="absolute end-1 top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-sm"
            >
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
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
