"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === "dark";
  const dim = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const icon = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring",
        dim,
        className
      )}
    >
      <Sun className={cn(icon, "transition-all duration-300", isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100")} aria-hidden />
      <Moon className={cn(icon, "absolute transition-all duration-300", isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0")} aria-hidden />
    </button>
  );
}
