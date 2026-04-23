import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, rows = 4, ...rest }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "input-pretty flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...rest}
      />
    );
  }
);
Textarea.displayName = "Textarea";
