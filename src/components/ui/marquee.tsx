"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  /** Reverse scroll direction. */
  reverse?: boolean;
  /** Seconds per loop (bigger = slower). */
  speed?: number;
  /** Fade mask edges. */
  fade?: boolean;
  /** Pause on hover. */
  pauseOnHover?: boolean;
  className?: string;
}

/**
 * Infinite horizontal marquee built from two duplicated rows.
 * Wrap a single flex-row of items; they'll loop endlessly.
 */
export function Marquee({
  children,
  reverse = false,
  speed = 40,
  fade = true,
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group relative flex w-full overflow-hidden",
        fade &&
          "[mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]",
        className
      )}
    >
      <div
        className={cn(
          "flex min-w-full shrink-0 items-center gap-12",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          "flex min-w-full shrink-0 items-center gap-12",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
    </div>
  );
}
