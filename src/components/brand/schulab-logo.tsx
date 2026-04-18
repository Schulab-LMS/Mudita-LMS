import { cn } from "@/lib/utils";

interface SchulabLogoProps {
  className?: string;
  size?: number;
  variant?: "mark" | "tile";
}

const INDIGO = "#4F3FF0";
const PURPLE = "#8B5CF6";
const ORANGE = "#FF8A3D";

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
            <stop offset="55%" stopColor={PURPLE} />
            <stop offset="100%" stopColor={ORANGE} />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#schulab-tile-bg)" />
        {/* Rocket body */}
        <path
          d="M20 7 C17 9.5 15.2 13 15.2 17 L15.2 23 L24.8 23 L24.8 17 C24.8 13 23 9.5 20 7 Z"
          fill="white"
        />
        {/* Brain hemisphere line */}
        <line
          x1="20"
          y1="7"
          x2="20"
          y2="17"
          stroke={INDIGO}
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.35"
        />
        {/* Window (idea light) */}
        <circle cx="20" cy="16" r="1.8" fill={ORANGE} />
        {/* Fins */}
        <path d="M15.2 20 L11.5 26 L15.2 24.5 Z" fill="white" />
        <path d="M24.8 20 L28.5 26 L24.8 24.5 Z" fill="white" />
        {/* Flame */}
        <path
          d="M17.5 23 L20 27 L22.5 23 Z"
          fill={ORANGE}
        />
        {/* Open book V (launchpad) */}
        <path
          d="M8 33 L20 30 L32 33"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="20"
          y1="30"
          x2="20"
          y2="33"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Idea sparkle */}
        <path
          d="M32 8 L32 12 M30 10 L34 10"
          stroke={ORANGE}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="32" cy="10" r="1.1" fill={ORANGE} />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      role="img"
      aria-label="Schulab"
    >
      {/* Rocket body */}
      <path
        d="M12 2.5 C10 4 8.8 6.5 8.8 9.5 L8.8 14 L15.2 14 L15.2 9.5 C15.2 6.5 14 4 12 2.5 Z"
        fill="currentColor"
      />
      {/* Brain hemisphere line */}
      <line
        x1="12"
        y1="2.5"
        x2="12"
        y2="10"
        stroke="white"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.45"
      />
      {/* Window */}
      <circle cx="12" cy="9" r="1.2" fill={ORANGE} />
      {/* Fins */}
      <path d="M8.8 12 L6.3 16 L8.8 15 Z" fill="currentColor" />
      <path d="M15.2 12 L17.7 16 L15.2 15 Z" fill="currentColor" />
      {/* Flame */}
      <path d="M10.3 14 L12 17 L13.7 14 Z" fill={ORANGE} />
      {/* Open book V launchpad */}
      <path
        d="M3 21 L12 18.5 L21 21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <line
        x1="12"
        y1="18.5"
        x2="12"
        y2="21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Idea sparkle */}
      <path
        d="M19.5 2.5 L19.5 5.5 M18 4 L21 4"
        stroke={ORANGE}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="19.5" cy="4" r="0.9" fill={ORANGE} />
    </svg>
  );
}
