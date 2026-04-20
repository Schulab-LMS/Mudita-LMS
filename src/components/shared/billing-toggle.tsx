"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BillingCycle = "monthly" | "annual";

interface BillingToggleProps {
  value: BillingCycle;
  onChange: (next: BillingCycle) => void;
  saveLabel?: string;
  className?: string;
}

export function BillingToggle({
  value,
  onChange,
  saveLabel = "Save 20%",
  className,
}: BillingToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border border-border bg-white/80 p-1 shadow-sm backdrop-blur",
        className
      )}
      role="radiogroup"
      aria-label="Billing cycle"
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === "monthly"}
        onClick={() => onChange("monthly")}
        className={cn(
          "rounded-xl px-4 py-2 text-sm font-semibold transition-all",
          value === "monthly"
            ? "bg-launch-gradient text-white shadow-md"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Monthly
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "annual"}
        onClick={() => onChange("annual")}
        className={cn(
          "relative rounded-xl px-4 py-2 text-sm font-semibold transition-all",
          value === "annual"
            ? "bg-launch-gradient text-white shadow-md"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Annual
        <span
          className={cn(
            "ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            value === "annual"
              ? "bg-white/25 text-white"
              : "bg-[#34d399]/15 text-[#047857]"
          )}
        >
          {saveLabel}
        </span>
      </button>
    </div>
  );
}

/** Helper used by the pricing page to keep number formatting consistent. */
export function PriceLabel({
  monthlyPrice,
  cycle,
  annualMultiplier = 0.8,
  currency = "$",
}: {
  monthlyPrice: number;
  cycle: BillingCycle;
  annualMultiplier?: number;
  currency?: string;
}): ReactNode {
  if (monthlyPrice === 0) return <span>{currency}0</span>;
  const display =
    cycle === "annual"
      ? Math.round(monthlyPrice * annualMultiplier)
      : monthlyPrice;
  return (
    <span>
      {currency}
      {display}
    </span>
  );
}
