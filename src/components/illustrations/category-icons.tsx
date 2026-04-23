/**
 * STEM category icon set — 12 hand-drawn SVG illustrations mapped to the extended
 * --stem-* palette tokens in globals.css. Designed to work at 40–96px.
 * Consistent stroke, 0.8 opacity, gradient fills scoped by linearGradient id.
 */

import { cn } from "@/lib/utils";

type IconProps = { size?: number; className?: string };

const box = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 64 64",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
});

export function SpaceIcon({ size = 48, className }: IconProps) {
  return (
    <svg {...box(size)} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="spaceG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f3ff0" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="14" fill="url(#spaceG)" />
      <ellipse cx="32" cy="32" rx="22" ry="6" stroke="#4f3ff0" strokeWidth="1.5" transform="rotate(-20 32 32)" />
      <circle cx="50" cy="18" r="1.5" fill="#ff8a3d" />
      <circle cx="14" cy="48" r="1.2" fill="#4f3ff0" />
      <circle cx="52" cy="46" r="1" fill="#8b5cf6" />
    </svg>
  );
}

export function RobotIcon({ size = 48, className }: IconProps) {
  return (
    <svg {...box(size)} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="robotG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#4f3ff0" />
        </linearGradient>
      </defs>
      <rect x="18" y="20" width="28" height="26" rx="6" fill="url(#robotG)" />
      <circle cx="26" cy="30" r="2.5" fill="#fff" />
      <circle cx="38" cy="30" r="2.5" fill="#fff" />
      <rect x="26" y="38" width="12" height="3" rx="1.5" fill="#fff" opacity=".7" />
      <path d="M32 14v6" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="12" r="2" fill="#ff8a3d" />
      <rect x="14" y="28" width="4" height="10" rx="2" fill="#8b5cf6" />
      <rect x="46" y="28" width="4" height="10" rx="2" fill="#8b5cf6" />
    </svg>
  );
}

export function ScienceIcon({ size = 48, className }: IconProps) {
  return (
    <svg {...box(size)} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="sciG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path d="M26 14h12v12l10 18a4 4 0 0 1-3.5 6h-25a4 4 0 0 1-3.5-6l10-18V14z" fill="url(#sciG)" opacity=".9" />
      <rect x="26" y="12" width="12" height="4" rx="1.5" fill="#34d399" />
      <circle cx="30" cy="42" r="1.5" fill="#fff" />
      <circle cx="36" cy="38" r="1" fill="#fff" />
      <circle cx="34" cy="46" r="1.2" fill="#fff" />
    </svg>
  );
}

export function CodeIcon({ size = 48, className }: IconProps) {
  return (
    <svg {...box(size)} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="codeG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#4f3ff0" />
        </linearGradient>
      </defs>
      <rect x="8" y="14" width="48" height="36" rx="6" fill="url(#codeG)" />
      <path d="M22 26l-6 6 6 6M42 26l6 6-6 6M34 24l-4 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function MathIcon({ size = 48, className }: IconProps) {
  return (
    <svg {...box(size)} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="mathG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8a3d" />
          <stop offset="1" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="44" height="44" rx="10" fill="url(#mathG)" />
      <path d="M18 26h6m14 0h6M18 38h6m14 0h6M32 22v20M22 32h20" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function RocketIcon({ size = 48, className }: IconProps) {
  return (
    <svg {...box(size)} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="rocketG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8a3d" />
          <stop offset="1" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <path d="M32 8c8 6 12 14 12 24l-4 8H24l-4-8c0-10 4-18 12-24z" fill="url(#rocketG)" />
      <circle cx="32" cy="26" r="4" fill="#fff" />
      <path d="M20 40l-6 6 8-2M44 40l6 6-8-2" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 48h8l-2 6h-4z" fill="#ff8a3d" opacity=".8" />
    </svg>
  );
}

export function ArtIcon({ size = 48, className }: IconProps) {
  return (
    <svg {...box(size)} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="artG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ec4899" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <path d="M32 10c12 0 22 9 22 20 0 7-6 12-12 12h-4a3 3 0 0 0 0 6c0 4-3 6-6 6-12 0-22-9-22-22 0-12 10-22 22-22z" fill="url(#artG)" />
      <circle cx="22" cy="24" r="2.5" fill="#fff" />
      <circle cx="32" cy="20" r="2.5" fill="#ff8a3d" />
      <circle cx="42" cy="24" r="2.5" fill="#4f3ff0" />
      <circle cx="44" cy="34" r="2.5" fill="#34d399" />
    </svg>
  );
}

export function MusicIcon({ size = 48, className }: IconProps) {
  return (
    <svg {...box(size)} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="musicG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#ff8a3d" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="44" height="44" rx="12" fill="url(#musicG)" />
      <path d="M24 42V22l18-4v20" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="22" cy="44" r="4" fill="#fff" />
      <circle cx="40" cy="40" r="4" fill="#fff" />
    </svg>
  );
}

export function LanguageIcon({ size = 48, className }: IconProps) {
  return (
    <svg {...box(size)} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="langG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="22" fill="url(#langG)" />
      <path d="M10 32h44M32 10c6 8 6 36 0 44M32 10c-6 8-6 36 0 44" stroke="#fff" strokeWidth="1.5" fill="none" />
      <ellipse cx="32" cy="32" rx="22" ry="10" stroke="#fff" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export function BiologyIcon({ size = 48, className }: IconProps) {
  return (
    <svg {...box(size)} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="bioG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#84cc16" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path d="M32 8c10 6 16 14 16 26 0 14-8 22-16 22S16 48 16 34c0-12 6-20 16-26z" fill="url(#bioG)" />
      <path d="M32 16c-4 8-4 16 0 24M32 16c4 8 4 16 0 24" stroke="#fff" strokeWidth="1.5" opacity=".8" fill="none" />
    </svg>
  );
}

export function ChemistryIcon({ size = 48, className }: IconProps) {
  return (
    <svg {...box(size)} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="chemG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a855f7" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="22" r="6" fill="url(#chemG)" />
      <circle cx="44" cy="24" r="5" fill="#ec4899" opacity=".8" />
      <circle cx="34" cy="42" r="7" fill="#4f3ff0" opacity=".8" />
      <path d="M22 22l12 20M44 24l-10 18M22 22l22 2" stroke="#a855f7" strokeWidth="1.5" opacity=".6" />
    </svg>
  );
}

export function EngineeringIcon({ size = 48, className }: IconProps) {
  return (
    <svg {...box(size)} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="engG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4f3ff0" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="10" fill="url(#engG)" />
      <circle cx="42" cy="40" r="8" fill="#8b5cf6" opacity=".8" />
      <path d="M24 14v-4M24 38v-4M14 24h-4M38 24h-4M17 17l-3-3M30 30l-3-3M17 31l-3 3M30 18l-3 3" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="24" r="3" fill="#fff" />
      <circle cx="42" cy="40" r="2.5" fill="#fff" />
    </svg>
  );
}

export const CATEGORY_ICONS = {
  space: SpaceIcon,
  robot: RobotIcon,
  robotics: RobotIcon,
  science: ScienceIcon,
  code: CodeIcon,
  coding: CodeIcon,
  programming: CodeIcon,
  math: MathIcon,
  rocket: RocketIcon,
  art: ArtIcon,
  music: MusicIcon,
  language: LanguageIcon,
  languages: LanguageIcon,
  biology: BiologyIcon,
  chemistry: ChemistryIcon,
  engineering: EngineeringIcon,
} as const;

export type CategoryKey = keyof typeof CATEGORY_ICONS;

export function CategoryIcon({ category, size, className }: { category: string; size?: number; className?: string }) {
  const key = category.toLowerCase() as CategoryKey;
  const Icon = CATEGORY_ICONS[key] ?? RocketIcon;
  return <Icon size={size} className={className} />;
}
