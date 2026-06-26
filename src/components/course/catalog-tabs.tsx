"use client";

import { Link, usePathname } from "@/i18n/navigation";

// Top-level catalog navigation. Three sibling routes (Courses | Bundles |
// Pathways), highlighted by the active pathname. Kept locale-agnostic via the
// i18n navigation helpers (pathname has the locale prefix stripped).
const TABS = [
  { href: "/courses", label: "Courses" },
  { href: "/bundles", label: "Bundles" },
  { href: "/pathways", label: "Pathways" },
] as const;

export function CatalogTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-full border border-border bg-card p-1 shadow-soft">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-launch-gradient text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
