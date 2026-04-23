"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PopoverContextValue {
  open: boolean;
  setOpen: (o: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const PopoverContext = createContext<PopoverContextValue | undefined>(undefined);

function usePopoverContext(name: string) {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error(`<${name}> must be used inside <Popover>`);
  return ctx;
}

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  children: React.ReactNode;
}

export function Popover({ open: controlled, onOpenChange, children }: PopoverProps) {
  const [internal, setInternal] = useState(false);
  const open = controlled ?? internal;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const setOpen = useCallback(
    (o: boolean) => {
      if (controlled === undefined) setInternal(o);
      onOpenChange?.(o);
    },
    [controlled, onOpenChange]
  );

  useEffect(() => {
    if (!open) return;
    function onDocPointer(e: PointerEvent) {
      const t = e.target as Node;
      if (contentRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointer);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("pointerdown", onDocPointer);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, setOpen]);

  const value = useMemo<PopoverContextValue>(() => ({ open, setOpen, triggerRef, contentRef }), [open, setOpen]);

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function PopoverTrigger({ children, onClick, ...rest }: PopoverTriggerProps) {
  const { open, setOpen, triggerRef } = usePopoverContext("PopoverTrigger");
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-expanded={open}
      aria-haspopup="dialog"
      onClick={(e) => {
        setOpen(!open);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  side?: "top" | "bottom";
  sideOffset?: number;
}

export function PopoverContent({ align = "start", side = "bottom", sideOffset = 8, className, children, ...rest }: PopoverContentProps) {
  const { open, contentRef } = usePopoverContext("PopoverContent");
  if (!open) return null;

  return (
    <div
      ref={contentRef}
      role="dialog"
      className={cn(
        "absolute z-50 min-w-[12rem] rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg animate-popover-in",
        side === "bottom" && "top-full",
        side === "top" && "bottom-full",
        align === "start" && "start-0",
        align === "center" && "start-1/2 -translate-x-1/2",
        align === "end" && "end-0",
        className
      )}
      style={{ marginTop: side === "bottom" ? sideOffset : undefined, marginBottom: side === "top" ? sideOffset : undefined }}
      {...rest}
    >
      {children}
    </div>
  );
}
