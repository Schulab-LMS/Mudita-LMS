"use client";

import { createContext, useCallback, useContext, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type TabsVariant = "underline" | "pill" | "segmented";

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
  variant: TabsVariant;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext(name: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<${name}> must be used inside <Tabs>`);
  return ctx;
}

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  variant?: TabsVariant;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue = "", value, onValueChange, variant = "underline", className, children }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  const baseId = useId();

  const setValue = useCallback(
    (v: string) => {
      if (value === undefined) setInternal(v);
      onValueChange?.(v);
    },
    [onValueChange, value]
  );

  const ctx = useMemo<TabsContextValue>(() => ({ value: active, setValue, variant, baseId }), [active, setValue, variant, baseId]);

  return (
    <TabsContext.Provider value={ctx}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = useTabsContext("TabsList");
  const listRef = useRef<HTMLDivElement | null>(null);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!listRef.current) return;
    const buttons = Array.from(listRef.current.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
    const idx = buttons.findIndex((b) => b === document.activeElement);
    if (idx === -1) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      buttons[(idx + 1) % buttons.length]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      buttons[(idx - 1 + buttons.length) % buttons.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      buttons[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      buttons[buttons.length - 1]?.focus();
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={onKeyDown}
      className={cn(
        "flex items-center gap-1",
        variant === "underline" && "border-b border-border",
        variant === "pill" && "rounded-full bg-muted p-1",
        variant === "segmented" && "rounded-xl border border-border bg-muted/40 p-1",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, children, ...rest }: TabsTriggerProps) {
  const { value: active, setValue, variant, baseId } = useTabsContext("TabsTrigger");
  const isActive = active === value;

  return (
    <button
      role="tab"
      type="button"
      id={`${baseId}-trigger-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-content-${value}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setValue(value)}
      className={cn(
        "relative inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "underline" && "px-3 py-2 -mb-px border-b-2 border-transparent text-muted-foreground hover:text-foreground",
        variant === "underline" && isActive && "border-primary text-foreground",
        variant === "pill" && "rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground",
        variant === "pill" && isActive && "bg-white text-foreground shadow-sm dark:bg-card",
        variant === "segmented" && "flex-1 rounded-lg px-3 py-1.5 text-muted-foreground hover:text-foreground",
        variant === "segmented" && isActive && "bg-background text-foreground shadow-sm",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

export function TabsContent({ value, forceMount, className, children, ...rest }: TabsContentProps) {
  const { value: active, baseId } = useTabsContext("TabsContent");
  const isActive = active === value;
  if (!isActive && !forceMount) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-content-${value}`}
      aria-labelledby={`${baseId}-trigger-${value}`}
      hidden={!isActive}
      className={cn("mt-4 focus-visible:outline-none", className)}
      tabIndex={0}
      {...rest}
    >
      {children}
    </div>
  );
}
