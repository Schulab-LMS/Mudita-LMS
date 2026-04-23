"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastInput {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends ToastInput {
  id: string;
  leaving?: boolean;
}

interface ToastContextValue {
  toast: (t: ToastInput) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  error: "border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200",
  info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200",
  warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    const rm = timers.current.get(id);
    if (rm) clearTimeout(rm);
    const out = setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(id);
    }, 260);
    timers.current.set(id, out);
  }, []);

  const toast = useCallback(
    (t: ToastInput) => {
      const id = Math.random().toString(36).slice(2);
      const item: ToastItem = { variant: "info", duration: 4500, ...t, id };
      setItems((prev) => [...prev, item]);
      if (item.duration && item.duration > 0) {
        const h = setTimeout(() => dismiss(id), item.duration);
        timers.current.set(id, h);
      }
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    const snapshot = timers.current;
    return () => {
      snapshot.forEach((t) => clearTimeout(t));
      snapshot.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed top-4 end-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2 p-2 sm:top-6 sm:end-6"
      >
        {items.map((t) => {
          const Icon = ICONS[t.variant || "info"];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "pointer-events-auto relative flex gap-3 rounded-xl border px-4 py-3 shadow-elev backdrop-blur-sm",
                STYLES[t.variant || "info"],
                t.leaving ? "animate-toast-out" : "animate-toast-in"
              )}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <div className="flex-1 space-y-0.5 text-sm">
                {t.title && <p className="font-semibold leading-tight">{t.title}</p>}
                {t.description && <p className="text-[13px] leading-snug opacity-90">{t.description}</p>}
                {t.action && (
                  <button
                    type="button"
                    onClick={() => {
                      t.action?.onClick();
                      dismiss(t.id);
                    }}
                    className="mt-1 inline-flex text-[13px] font-semibold underline-offset-2 hover:underline"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="-me-1 -mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-current/70 transition-colors hover:bg-current/10"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: () => "",
      dismiss: () => {},
    };
  }
  return ctx;
}
