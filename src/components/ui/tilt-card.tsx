"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. */
  max?: number;
  /** Disable the spotlight glare. */
  noGlare?: boolean;
}

/**
 * Tilt-on-hover card with spotlight glare. Uses pointer position —
 * no dependency, and disables cleanly on touch / reduced-motion.
 */
export function TiltCard({
  children,
  className,
  max = 6,
  noGlare = false,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - y) * max * 2;
    const ry = (x - 0.5) * max * 2;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn(
        "relative transition-transform duration-200 ease-out motion-reduce:transform-none",
        "[transform:perspective(1000px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]",
        className
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
      {!noGlare && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 motion-reduce:hidden [background:radial-gradient(400px_circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,0.35),transparent_45%)]"
          style={{ opacity: "var(--glare, 0)" }}
        />
      )}
    </div>
  );
}
