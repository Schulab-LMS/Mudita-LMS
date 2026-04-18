import { cn } from "@/lib/utils";

interface SchulabLogoProps {
  className?: string;
  size?: number;
  variant?: "mark" | "tile";
}

const SPARK = "#B8F02D";

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
            <stop offset="0%" stopColor="#3B2FD9" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#schulab-tile-bg)" />
        {/* Flask rim */}
        <path
          d="M15 10 H25"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Flask body */}
        <path
          d="M16.5 10 V17 L11.5 27 A3 3 0 0 0 14 31 H26 A3 3 0 0 0 28.5 27 L23.5 17 V10"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Liquid */}
        <path
          d="M13.2 24 L26.8 24 A3 3 0 0 1 26 31 H14 A3 3 0 0 1 13.2 24 Z"
          fill={SPARK}
          opacity="0.9"
        />
        {/* Bubble */}
        <circle cx="18" cy="21" r="1.4" fill={SPARK} />
        {/* Sparkle */}
        <path
          d="M31 9 L31.6 11 M31 9 L30.4 7 M31 9 L33 9.6 M31 9 L29 8.4"
          stroke={SPARK}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
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
      {/* Flask rim */}
      <path
        d="M8.5 3 H15.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Flask body */}
      <path
        d="M9.5 3 V8.5 L6 16 A2.5 2.5 0 0 0 8.3 19.5 H15.7 A2.5 2.5 0 0 0 18 16 L14.5 8.5 V3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Liquid */}
      <path
        d="M7.1 14 L16.9 14 A2.5 2.5 0 0 1 15.7 19.5 H8.3 A2.5 2.5 0 0 1 7.1 14 Z"
        fill={SPARK}
        opacity="0.9"
      />
      {/* Bubble */}
      <circle cx="10.5" cy="11.5" r="0.9" fill={SPARK} />
      {/* Sparkle */}
      <path
        d="M19.5 3 L19.9 4.3 M19.5 3 L19.1 1.7 M19.5 3 L20.8 3.4 M19.5 3 L18.2 2.6"
        stroke={SPARK}
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
