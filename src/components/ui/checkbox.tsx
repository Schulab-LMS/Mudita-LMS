"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, indeterminate, id, ...rest }, ref) => {
    const generated = useId();
    const inputId = id ?? `cb-${generated}`;
    return (
      <label htmlFor={inputId} className={cn("inline-flex items-start gap-2.5 cursor-pointer select-none", className)}>
        <span className="relative mt-0.5 inline-flex h-5 w-5 shrink-0">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-checked={indeterminate ? "mixed" : undefined}
            {...rest}
          />
          <span
            aria-hidden
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center rounded-md border border-input bg-background transition-colors",
              "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
            )}
          >
            {indeterminate ? (
              <Minus className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Check className="hidden h-3.5 w-3.5 peer-checked:block" />
            )}
          </span>
        </span>
        {(label || description) && (
          <span className="min-w-0">
            {label && <span className="block text-sm font-medium leading-tight text-foreground">{label}</span>}
            {description && <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>}
          </span>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
