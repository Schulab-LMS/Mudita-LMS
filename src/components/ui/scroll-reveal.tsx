"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealMode = "up" | "fade" | "left" | "right" | "scale";

interface ScrollRevealProps {
  children: ReactNode;
  as?: keyof HTMLElementTagNameMap;
  mode?: RevealMode;
  delay?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  as = "div",
  mode = "up",
  delay = 0,
  threshold = 0.15,
  className,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      el.dataset.visible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.dataset.visible = "true";
            if (once) observer.unobserve(el);
          } else if (!once) {
            el.dataset.visible = "false";
          }
        });
      },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  const Tag = as as "div";
  const revealValue = mode === "up" ? "" : mode;

  return (
    <Tag
      ref={ref as never}
      data-reveal={revealValue || ""}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
