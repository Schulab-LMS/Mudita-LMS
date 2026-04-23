/**
 * Empty-state scene illustrations — larger, friendlier SVGs for use inside EmptyState.
 * Target 160–220px wide, currentColor-aware where useful.
 */

import { cn } from "@/lib/utils";

type SceneProps = { className?: string };

const wrap = (w = 180) => ({
  width: w,
  height: (w * 3) / 4,
  viewBox: "0 0 240 180",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
});

export function NoCoursesScene({ className }: SceneProps) {
  return (
    <svg {...wrap()} className={cn("text-primary", className)} aria-hidden>
      <defs>
        <linearGradient id="ncGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f3ff0" stopOpacity=".12" />
          <stop offset="1" stopColor="#ff8a3d" stopOpacity=".12" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="240" height="180" rx="18" fill="url(#ncGrad)" />
      <rect x="54" y="50" width="132" height="92" rx="10" fill="#fff" stroke="#4f3ff0" strokeOpacity=".3" />
      <rect x="66" y="62" width="56" height="6" rx="3" fill="#4f3ff0" opacity=".55" />
      <rect x="66" y="74" width="108" height="4" rx="2" fill="#8b5cf6" opacity=".25" />
      <rect x="66" y="84" width="90" height="4" rx="2" fill="#8b5cf6" opacity=".2" />
      <rect x="66" y="100" width="40" height="20" rx="4" fill="#4f3ff0" opacity=".2" />
      <rect x="112" y="100" width="40" height="20" rx="4" fill="#ff8a3d" opacity=".2" />
      <circle cx="200" cy="40" r="6" fill="#ff8a3d" />
      <circle cx="40" cy="150" r="4" fill="#8b5cf6" />
    </svg>
  );
}

export function NoMessagesScene({ className }: SceneProps) {
  return (
    <svg {...wrap()} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="nmGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" stopOpacity=".12" />
          <stop offset="1" stopColor="#4f3ff0" stopOpacity=".12" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="240" height="180" rx="18" fill="url(#nmGrad)" />
      <rect x="44" y="54" width="120" height="64" rx="14" fill="#fff" stroke="#8b5cf6" strokeOpacity=".3" />
      <path d="M80 118v12l14-12" fill="#fff" stroke="#8b5cf6" strokeOpacity=".3" />
      <rect x="60" y="74" width="60" height="5" rx="2.5" fill="#8b5cf6" opacity=".5" />
      <rect x="60" y="86" width="88" height="4" rx="2" fill="#8b5cf6" opacity=".25" />
      <rect x="60" y="96" width="70" height="4" rx="2" fill="#8b5cf6" opacity=".2" />
      <circle cx="190" cy="80" r="18" fill="#ff8a3d" opacity=".2" />
      <circle cx="190" cy="80" r="10" fill="#ff8a3d" opacity=".4" />
    </svg>
  );
}

export function NoNotificationsScene({ className }: SceneProps) {
  return (
    <svg {...wrap()} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="nnGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d399" stopOpacity=".12" />
          <stop offset="1" stopColor="#4f3ff0" stopOpacity=".12" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="240" height="180" rx="18" fill="url(#nnGrad)" />
      <path d="M120 46c-16 0-28 10-28 26v18l-8 10h72l-8-10V72c0-16-12-26-28-26z" fill="#fff" stroke="#4f3ff0" strokeOpacity=".3" />
      <circle cx="120" cy="38" r="4" fill="#ff8a3d" />
      <path d="M108 116c2 6 6 10 12 10s10-4 12-10h-24z" fill="#4f3ff0" opacity=".35" />
      <circle cx="66" cy="70" r="3" fill="#34d399" />
      <circle cx="180" cy="130" r="3" fill="#8b5cf6" />
    </svg>
  );
}

export function NoResultsScene({ className }: SceneProps) {
  return (
    <svg {...wrap()} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="nrGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f3ff0" stopOpacity=".1" />
          <stop offset="1" stopColor="#ff8a3d" stopOpacity=".1" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="240" height="180" rx="18" fill="url(#nrGrad)" />
      <circle cx="108" cy="82" r="32" fill="#fff" stroke="#4f3ff0" strokeOpacity=".4" strokeWidth="3" />
      <path d="M132 106l22 22" stroke="#4f3ff0" strokeWidth="6" strokeLinecap="round" strokeOpacity=".7" />
      <path d="M96 80l24 0M96 88l16 0" stroke="#4f3ff0" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />
      <circle cx="180" cy="44" r="4" fill="#ff8a3d" />
    </svg>
  );
}

export function NotFoundScene({ className }: SceneProps) {
  return (
    <svg {...wrap(220)} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="nfGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8a3d" stopOpacity=".18" />
          <stop offset="1" stopColor="#4f3ff0" stopOpacity=".15" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="240" height="180" rx="18" fill="url(#nfGrad)" />
      <text x="120" y="108" textAnchor="middle" fontFamily="sans-serif" fontSize="72" fontWeight="800" fill="#4f3ff0" opacity=".85">404</text>
      <path d="M64 132l16-4 10 6 18-8 12 6 14-4 18 8 14-6" stroke="#ff8a3d" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="44" cy="40" r="3" fill="#8b5cf6" />
      <circle cx="196" cy="148" r="3" fill="#4f3ff0" />
    </svg>
  );
}

export function OfflineScene({ className }: SceneProps) {
  return (
    <svg {...wrap()} className={cn(className)} aria-hidden>
      <defs>
        <linearGradient id="offGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f59e0b" stopOpacity=".12" />
          <stop offset="1" stopColor="#ef4444" stopOpacity=".1" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="240" height="180" rx="18" fill="url(#offGrad)" />
      <path d="M80 96c22-22 58-22 80 0" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M92 112c14-14 42-14 56 0" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".7" />
      <circle cx="120" cy="128" r="5" fill="#f59e0b" />
      <path d="M56 56l128 80" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
