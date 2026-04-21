"use client";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { HelpButton } from "@/components/help/help-button";
import { SchulabLogo } from "@/components/brand/schulab-logo";
import { UserMenu } from "@/components/layout/user-menu";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { publicNavItems } from "@/config/navigation";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const t = useTranslations();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/55">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-xl font-extrabold"
        >
          <span className="transition-transform duration-300 group-hover:rotate-[-8deg]">
            <SchulabLogo variant="tile" size={32} />
          </span>
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Schulab
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {publicNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(item.labelKey)}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute left-3 right-3 -bottom-[9px] h-0.5 origin-center rounded-full bg-launch-gradient-horizontal transition-transform duration-300 ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Locale Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLocaleOpen(!localeOpen)}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <Globe className="h-4 w-4" />
              {localeNames[locale]}
              <ChevronDown className="h-3 w-3" />
            </button>
            {localeOpen && (
              <div className="absolute end-0 top-full mt-1 w-40 rounded-lg border bg-white py-1 shadow-lg">
                {locales.map((l) => (
                  <a
                    key={l}
                    href={`/${l}${pathname}`}
                    className={`block px-4 py-2 text-sm transition-colors hover:bg-muted ${
                      l === locale
                        ? "font-medium text-primary"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setLocaleOpen(false)}
                  >
                    {localeNames[l]}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Help */}
          <HelpButton variant="navbar" />

          {/* Auth */}
          {session?.user ? (
            <UserMenu variant="navbar" />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/register"
                className="shine relative inline-flex h-9 items-center justify-center gap-1 overflow-hidden rounded-xl bg-launch-gradient px-4 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                {t("nav.register")}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t bg-white md:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {t(item.labelKey)}
              </Link>
            ))}

            {/* Mobile Locale Switcher */}
            <div className="border-t pt-3">
              <p className="px-3 pb-1 text-xs font-semibold uppercase text-muted-foreground">
                {t("nav.language")}
              </p>
              {locales.map((l) => (
                <a
                  key={l}
                  href={`/${l}${pathname}`}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted ${
                    l === locale
                      ? "font-medium text-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {localeNames[l]}
                </a>
              ))}
            </div>

            {/* Mobile Help */}
            <div className="border-t pt-3">
              <HelpButton
                variant="navbar"
                className="w-full justify-start"
              />
            </div>

            {/* Mobile Auth */}
            <div className="border-t pt-3">
              {session?.user ? (
                <div className="px-3">
                  <UserMenu variant="navbar" />
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
