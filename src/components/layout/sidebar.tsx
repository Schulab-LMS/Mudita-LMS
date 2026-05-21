"use client";

import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { dashboardNavItems, type Role } from "@/config/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  GraduationCap,
  Calendar,
  Users,
  ShoppingBag,
  User,
  Clock,
  Package,
  Trophy,
  FileText,
  Settings,
  LogOut,
  X,
  ShieldCheck,
  Lock,
  MessageSquare,
  HelpCircle,
  Bell,
  ClipboardList,
  GitBranch,
} from "lucide-react";
import { SchulabLogo } from "@/components/brand/schulab-logo";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BookOpen,
  Award,
  GraduationCap,
  Calendar,
  Users,
  ShoppingBag,
  User,
  Clock,
  Package,
  Trophy,
  FileText,
  Settings,
  ShieldCheck,
  Lock,
  MessageSquare,
  HelpCircle,
  Bell,
  ClipboardList,
  GitBranch,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const pathname = usePathname();

  const role = (session?.user as { role?: Role } | undefined)?.role;
  const navItems = role ? dashboardNavItems[role] ?? [] : [];

  const sidebarContent = (
    <div className="flex h-full w-full flex-col border-e border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-6">
        <SchulabLogo size={28} className="text-primary" />
        <span className="font-display text-xl font-bold tracking-tight">Schulab</span>
        {/* Close button on mobile */}
        <button
          onClick={onClose}
          className="ms-auto rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Role badge */}
      {role && (
        <div className="border-b border-border/60 px-6 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Role</p>
          <p className="mt-0.5 text-sm font-semibold capitalize text-foreground">{role.replace(/_/g, " ").toLowerCase()}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Dashboard navigation">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const tKey = item.labelKey.replace("nav.", "");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute start-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-e-full bg-launch-gradient-horizontal"
                    />
                  )}
                  {Icon && (
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                  )}
                  <span className="truncate">{t(tKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Free-tier upgrade promo card (only for students) */}
        {role === "STUDENT" && (
          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-launch-gradient-soft p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Upgrade</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-foreground">
              Unlock 1:1 tutoring
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Join Family plan and learn with expert mentors.</p>
            <Link
              href="/pricing"
              onClick={onClose}
              className="mt-2 inline-flex h-8 items-center justify-center rounded-md bg-launch-gradient px-3 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            >
              See plans
            </Link>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="border-t border-border/60 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>{t("logout")}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:start-0 md:z-30 md:flex md:w-64">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 start-0 z-50 w-72 animate-sheet-left">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
