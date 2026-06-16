import { cn } from "@/lib/utils";

interface SchulabLogoProps {
  className?: string;
  size?: number;
  variant?: "mark" | "tile";
}

/**
 * Brand palette — kept identical to the app design tokens so the mark matches
 * the rest of the UI:
 *   INDIGO  → --primary    (#4f3ff0)
 *   PURPLE  → --secondary  (#8b5cf6)
 *   ORANGE  → --stem-math  (#ff8a3d)
 *
 * v2 — refined, geometric rocket rebuilt on a clean grid. Preserves the core
 * brand idea (rocket + indigo→purple→orange gradient) and stays crisp down to
 * 16px. The "mark" variant is a single-color version for dense / mono contexts.
 */
const INDIGO = "#4F3FF0";
const PURPLE = "#8B5CF6";
const ORANGE = "#FF8A3D";

// Shared geometry, authored in a 40×40 space and reused (scaled) by both variants.
const BODY =
  "M20 4.8C23.2 7.2 26 12 26 17.6L26 23.2C26 26.8 23.2 28.4 20 28.4C16.8 28.4 14 26.8 14 23.2L14 17.6C14 12 16.8 7.2 20 4.8Z";
const BASE =
  "M20 27.6C16 30 11.2 32.4 7.2 34.8C12 33.2 16.4 32.4 20 32.4C23.6 32.4 28 33.2 32.8 34.8C28.8 32.4 24 30 20 27.6Z";
const FIN_L = "M14 21.6L9.6 26.8L14 25.6Z";
const FIN_R = "M26 21.6L30.4 26.8L26 25.6Z";
const SPARK =
  "M32 4.4L32.88 6.72L35.2 7.6L32.88 8.48L32 10.8L31.12 8.48L28.8 7.6L31.12 6.72Z";

export function SchulabLogo({
  className,
  size = 24,
  variant = "mark",
}: SchulabLogoProps) {
  if (variant === "tile") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(className)}
        role="img"
        aria-label="Schulab"
      >
        <defs>
          <linearGradient id="schulab-tile-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={INDIGO} />
            <stop offset="52%" stopColor={PURPLE} />
            <stop offset="100%" stopColor={ORANGE} />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#schulab-tile-bg)" />
        {/* Soft top sheen for depth */}
        <ellipse cx="12.8" cy="9.6" rx="20.8" ry="16" fill="#fff" opacity="0.1" />
        {/* Rocket body */}
        <path d={BODY} fill="#fff" />
        {/* Swept-wing launch base */}
        <path d={BASE} fill="#fff" />
        {/* Fins */}
        <path d={FIN_L} fill="#fff" />
        <path d={FIN_R} fill="#fff" />
        {/* Node / window (the learning + AI core) */}
        <circle cx="20" cy="16" r="3.4" fill={ORANGE} />
        {/* Curiosity spark */}
        <path d={SPARK} fill={ORANGE} />
      </svg>
    );
  }

  // Single-color mark — inherits color via currentColor; the node + spark keep a
  // touch of brand orange.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      role="img"
      aria-label="Schulab"
    >
      <path d={BODY} fill="currentColor" />
      <path d={BASE} fill="currentColor" />
      <path d={FIN_L} fill="currentColor" />
      <path d={FIN_R} fill="currentColor" />
      <circle cx="20" cy="16" r="3.4" fill={ORANGE} />
      <path d={SPARK} fill={ORANGE} />
    </svg>
  );
}
