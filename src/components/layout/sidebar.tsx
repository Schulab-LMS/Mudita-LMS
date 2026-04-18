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
    <div className="flex h-full flex-col bg-white border-r">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <SchulabLogo size={28} className="text-primary" />
        <span className="text-xl font-bold tracking-tight">Schulab</span>
        {/* Close button on mobile */}
        <button
          onClick={onClose}
          className="ml-auto rounded-md p-1 hover:bg-muted md:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            // Extract the translation key (e.g. "nav.dashboard" -> "dashboard")
            const tKey = item.labelKey.replace("nav.", "");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  )}
                  <span>{t(tKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t p-3">
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
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 w-64">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
