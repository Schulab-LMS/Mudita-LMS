"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuContextValue {
  open: boolean;
  setOpen: (o: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

function useMenu(name: string) {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error(`<${name}> must be used inside <DropdownMenu>`);
  return ctx;
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: PointerEvent) => {
      const t = e.target as Node;
      if (contentRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("pointerdown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const value = useMemo<MenuContextValue>(() => ({ open, setOpen, triggerRef, contentRef }), [open]);
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function DropdownMenuTrigger({ className, onClick, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerRef } = useMenu("DropdownMenuTrigger");
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={(e) => {
        setOpen(!open);
        onClick?.(e);
      }}
      className={cn("inline-flex items-center gap-2", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

interface MenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end" | "center";
  side?: "bottom" | "top";
  sideOffset?: number;
}

export function DropdownMenuContent({ align = "end", side = "bottom", sideOffset = 8, className, children, ...rest }: MenuContentProps) {
  const { open, contentRef } = useMenu("DropdownMenuContent");
  if (!open) return null;

  const itemsKeyNav = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = contentRef.current ? Array.from(contentRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')) : [];
    const idx = items.findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  return (
    <div
      ref={contentRef}
      role="menu"
      onKeyDown={itemsKeyNav}
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

interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
  destructive?: boolean;
}

export function DropdownMenuItem({ className, inset, destructive, onClick, children, ...rest }: MenuItemProps) {
  const { setOpen } = useMenu("DropdownMenuItem");
  return (
    <button
      role="menuitem"
      type="button"
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium outline-none transition-colors",
        "hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        destructive ? "text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10" : "text-foreground",
        inset && "ps-8",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  children,
  className,
  ...rest
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
}) {
  return (
    <button
      role="menuitemcheckbox"
      type="button"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...rest}
    >
      <span className="flex h-4 w-4 items-center justify-center">
        {checked ? <Check className="h-4 w-4 text-primary" aria-hidden /> : null}
      </span>
      {children}
    </button>
  );
}

export function DropdownMenuLabel({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground", className)}>{children}</div>;
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div role="separator" className={cn("my-1 h-px bg-border/70", className)} />;
}

export function DropdownMenuShortcut({ className, children }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("ms-auto text-xs tracking-widest text-muted-foreground", className)}>{children}</span>;
}

export function DropdownMenuSubtrigger({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
      <ChevronRight className="ms-auto h-4 w-4" aria-hidden />
    </div>
  );
}
