"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  description?: string;
  size?: "sm" | "md";
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, size = "md", id, ...rest }, ref) => {
    const generated = useId();
    const inputId = id ?? `switch-${generated}`;

    const track =
      size === "sm"
        ? "w-9 h-5 after:w-4 after:h-4 after:top-0.5 after:start-0.5 peer-checked:after:translate-x-4 rtl:peer-checked:after:-translate-x-4"
        : "w-11 h-6 after:w-5 after:h-5 after:top-0.5 after:start-0.5 peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5";

    return (
      <label htmlFor={inputId} className={cn("inline-flex items-start gap-3 cursor-pointer select-none", className)}>
        <input ref={ref} id={inputId} type="checkbox" role="switch" className="peer sr-only" {...rest} />
        <span
          aria-hidden
          className={cn(
            "relative inline-flex shrink-0 rounded-full bg-muted transition-colors",
            "after:absolute after:rounded-full after:bg-white after:shadow-sm after:transition-transform",
            "peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
            "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
            track
          )}
        />
        {(label || description) && (
          <span className="min-w-0 flex-1 text-start">
            {label && <span className="block text-sm font-medium leading-tight text-foreground">{label}</span>}
            {description && <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>}
          </span>
        )}
      </label>
    );
  }
);
Switch.displayName = "Switch";
