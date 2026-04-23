"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
  className?: string;
  interactive?: boolean;
  onChange?: (v: number) => void;
  "aria-label"?: string;
}

const SIZES = {
  sm: { star: "h-3.5 w-3.5", text: "text-xs" },
  md: { star: "h-4 w-4", text: "text-sm" },
  lg: { star: "h-5 w-5", text: "text-base" },
};

export function RatingStars({
  value,
  max = 5,
  size = "md",
  showValue,
  count,
  className,
  interactive,
  onChange,
  ...rest
}: RatingStarsProps) {
  const label = rest["aria-label"] ?? `Rating: ${value.toFixed(1)} out of ${max}`;
  const sz = SIZES[size];

  return (
    <div
      role={interactive ? "radiogroup" : "img"}
      aria-label={label}
      className={cn("inline-flex items-center gap-1.5", className)}
    >
      <div className="relative inline-flex">
        <div className="inline-flex gap-0.5 text-muted-foreground/40">
          {Array.from({ length: max }).map((_, i) => (
            <Star key={`bg-${i}`} className={sz.star} aria-hidden />
          ))}
        </div>
        <div
          className="absolute inset-0 inline-flex gap-0.5 overflow-hidden text-amber-400"
          style={{ width: `${(Math.max(0, Math.min(max, value)) / max) * 100}%` }}
          aria-hidden
        >
          {Array.from({ length: max }).map((_, i) => (
            <Star key={`fg-${i}`} className={cn(sz.star, "fill-current")} aria-hidden />
          ))}
        </div>
        {interactive && (
          <div className="absolute inset-0 inline-flex gap-0.5">
            {Array.from({ length: max }).map((_, i) => (
              <button
                key={`btn-${i}`}
                type="button"
                role="radio"
                aria-checked={i < Math.round(value)}
                onClick={() => onChange?.(i + 1)}
                className={cn(sz.star, "cursor-pointer bg-transparent")}
                aria-label={`${i + 1} star${i === 0 ? "" : "s"}`}
              />
            ))}
          </div>
        )}
      </div>
      {showValue && <span className={cn("font-semibold text-foreground", sz.text)}>{value.toFixed(1)}</span>}
      {typeof count === "number" && (
        <span className={cn("text-muted-foreground", sz.text)}>({count.toLocaleString()})</span>
      )}
    </div>
  );
}
