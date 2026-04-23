import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "input-pretty flex h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 pe-9 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    );
  }
);
Select.displayName = "Select";
