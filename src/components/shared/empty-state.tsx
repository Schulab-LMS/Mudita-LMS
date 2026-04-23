import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyTone = "default" | "error" | "offline" | "first-use";

interface EmptyStateProps {
  icon?: ReactNode;
  illustration?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  tone?: EmptyTone;
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
}

const TONE_BG: Record<EmptyTone, string> = {
  default: "bg-card",
  error: "bg-red-50/60 dark:bg-red-500/5",
  offline: "bg-amber-50/60 dark:bg-amber-500/5",
  "first-use": "bg-launch-gradient-soft",
};

const SIZE_PAD: Record<NonNullable<EmptyStateProps["size"]>, string> = {
  sm: "px-4 py-8",
  md: "px-6 py-14",
  lg: "px-6 py-20",
};

export function EmptyState({
  icon,
  illustration,
  title,
  description,
  action,
  secondaryAction,
  tone = "default",
  size = "md",
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-border text-center",
        TONE_BG[tone],
        SIZE_PAD[size],
        className
      )}
    >
      {illustration && <div className="mb-5">{illustration}</div>}
      {icon && !illustration && <div className="mb-4 text-5xl text-muted-foreground">{icon}</div>}
      <h3 className="font-display text-lg font-bold text-foreground sm:text-xl">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {children && <div className="mt-4 w-full max-w-md">{children}</div>}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action && (
            <Link
              href={action.href}
              className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
            >
              {action.label}
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="inline-flex items-center rounded-lg border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
