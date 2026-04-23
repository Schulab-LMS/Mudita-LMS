import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  homeHref?: string;
}

export function Breadcrumbs({ items, className, showHome = true, homeHref = "/" }: BreadcrumbsProps) {
  const list: BreadcrumbItem[] = showHome
    ? [{ label: "Home", href: homeHref, icon: <Home className="h-3.5 w-3.5" aria-hidden /> }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-xs font-medium text-muted-foreground">
        {list.map((item, i) => {
          const isLast = i === list.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-hidden />}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn("inline-flex items-center gap-1 truncate", isLast && "text-foreground")}
                >
                  {item.icon}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.icon}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
