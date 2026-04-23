"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SheetSide = "right" | "left" | "bottom" | "top";

interface SheetProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  side?: SheetSide;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const SIDE_POSITION: Record<SheetSide, string> = {
  right: "top-0 end-0 h-full w-full max-w-md animate-sheet-right",
  left: "top-0 start-0 h-full w-full max-w-md animate-sheet-left",
  bottom: "start-0 end-0 bottom-0 w-full max-h-[90vh] rounded-t-2xl animate-sheet-bottom",
  top: "start-0 end-0 top-0 w-full max-h-[90vh] rounded-b-2xl animate-sheet-top",
};

export function Sheet({ open, onOpenChange, side = "right", title, description, children, className, contentClassName }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className={cn("fixed inset-0 z-[70]", className)} role="dialog" aria-modal="true" aria-label={title}>
      <div
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm animate-fade-in"
        aria-hidden
      />
      <div
        className={cn(
          "absolute overflow-y-auto border-border bg-card text-card-foreground shadow-xl",
          SIDE_POSITION[side],
          side === "right" || side === "left" ? "border-s" : "border-t",
          contentClassName
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold leading-tight">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
