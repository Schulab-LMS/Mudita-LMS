"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  UserCog,
} from "lucide-react";
import type { Role } from "@/config/navigation";

const dashboardHref: Record<Role, string> = {
  STUDENT: "/student",
  PARENT: "/parent",
  TUTOR: "/tutor",
  ADMIN: "/admin",
  SUPER_ADMIN: "/admin",
  // No dedicated dashboard yet — /account avoids the admin-gate redirect loop.
  B2B_PARTNER: "/account",
  ORG_ADMIN: "/account",
};

const profileHref: Record<Role, string | null> = {
  STUDENT: null,
  PARENT: null,
  TUTOR: "/tutor/profile",
  ADMIN: null,
  SUPER_ADMIN: null,
  B2B_PARTNER: null,
  ORG_ADMIN: null,
};

const settingsHref: Record<Role, string | null> = {
  STUDENT: null,
  PARENT: null,
  TUTOR: null,
  ADMIN: "/admin/settings",
  SUPER_ADMIN: "/admin/settings",
  B2B_PARTNER: null,
  ORG_ADMIN: null,
};

interface UserMenuProps {
  variant?: "topbar" | "navbar";
}

export function UserMenu({ variant = "topbar" }: UserMenuProps) {
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!session?.user) return null;

  const name = session.user.name ?? "";
  const email = session.user.email ?? "";
  const image = session.user.image ?? undefined;
  const role = (session.user as { role?: Role }).role ?? "STUDENT";

  const dashboard = dashboardHref[role];
  const profile = profileHref[role];
  const settings = settingsHref[role];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          variant === "navbar"
            ? "inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            : "inline-flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted"
        }
      >
        <Avatar
          src={image}
          alt={name}
          fallback={getInitials(name || "U")}
          size="sm"
        />
        <span className="hidden text-sm font-medium md:inline-block">
          {name || t("account")}
        </span>
        <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:inline-block" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border bg-white shadow-lg animate-slide-down"
        >
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {name || t("account")}
            </p>
            {email && (
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            )}
          </div>
          <div className="py-1">
            <Link
              href={dashboard}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              {t("dashboard")}
            </Link>
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <UserCog className="h-4 w-4 text-muted-foreground" />
              {t("account")}
            </Link>
            {profile && (
              <Link
                href={profile}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                {t("profile")}
              </Link>
            )}
            {settings && (
              <Link
                href={settings}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                {t("settings")}
              </Link>
            )}
          </div>
          <div className="border-t py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
              {t("logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
