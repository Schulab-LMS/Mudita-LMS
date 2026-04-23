"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Side = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: React.ReactNode;
  side?: Side;
  delayMs?: number;
  className?: string;
  children: React.ReactNode;
}

/**
 * Wraps arbitrary children in a <span> that carries hover/focus listeners.
 * We intentionally don't clone the child or forward refs — this keeps the
 * component pure and avoids triggering React Compiler's ref/impure rules.
 */
export function Tooltip({ content, side = "top", delayMs = 120, className, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delayMs);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  };

  const sidePos: Record<Side, string> = {
    top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
    bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
    left: "right-full top-1/2 me-2 -translate-y-1/2",
    right: "left-full top-1/2 ms-2 -translate-y-1/2",
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          id={id}
          className={cn(
            "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-elev animate-tooltip-in",
            sidePos[side],
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
