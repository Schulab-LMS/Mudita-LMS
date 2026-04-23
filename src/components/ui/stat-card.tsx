import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  description?: string;
  icon?: LucideIcon;
  tone?: "primary" | "secondary" | "accent" | "success" | "warning" | "neutral";
  delta?: { value: number; direction?: "up" | "down" | "flat"; suffix?: string };
  sparkline?: number[];
  className?: string;
}

const TONES = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  neutral: "bg-muted text-muted-foreground",
};

export function StatCard({ label, value, description, icon: Icon, tone = "primary", delta, sparkline, className }: StatCardProps) {
  const direction = delta?.direction ?? (delta && delta.value > 0 ? "up" : delta && delta.value < 0 ? "down" : "flat");

  const DeltaIcon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  const deltaColor =
    direction === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : direction === "down"
      ? "text-red-600 dark:text-red-400"
      : "text-muted-foreground";

  return (
    <div className={cn("card-premium p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">{value}</p>
          {description && <p className="mt-1 truncate text-xs text-muted-foreground">{description}</p>}
        </div>
        {Icon && (
          <span className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", TONES[tone])}>
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        )}
      </div>
      {(delta || sparkline) && (
        <div className="mt-3 flex items-center justify-between gap-2">
          {delta && (
            <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", deltaColor)}>
              <DeltaIcon className="h-3.5 w-3.5" aria-hidden />
              {Math.abs(delta.value)}
              {delta.suffix ?? "%"}
            </span>
          )}
          {sparkline && sparkline.length > 1 && <Sparkline values={sparkline} />}
        </div>
      )}
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const w = 80;
  const h = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="text-primary/70" aria-hidden>
      <polyline fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" points={points} />
      <polyline
        fill="currentColor"
        opacity={0.12}
        points={`${points} ${w},${h} 0,${h}`}
      />
    </svg>
  );
}
