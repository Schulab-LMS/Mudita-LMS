"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  /** Target number to count up to. */
  value: number;
  /** Milliseconds over which the count runs. */
  duration?: number;
  /** Optional prefix e.g. "$". */
  prefix?: string;
  /** Optional suffix e.g. "+", "%", "k". */
  suffix?: string;
  /** Decimal precision. */
  decimals?: number;
  /** Locale-aware grouping (commas etc). */
  locale?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1400,
  prefix = "",
  suffix = "",
  decimals = 0,
  locale,
  className,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(() => {
    if (typeof window === "undefined") return 0;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? value
      : 0;
  });
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) return;

    const run = () => {
      if (started.current) return;
      started.current = true;

      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // easeOutExpo
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setDisplay(value * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  const formatted = display.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
