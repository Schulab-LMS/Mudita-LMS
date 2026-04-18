import { Zap, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyGoalProps {
  /** XP earned today. */
  earned: number;
  /** Daily goal target in XP. */
  goal?: number;
  /** Current streak length in days. */
  streak?: number;
  className?: string;
}

/**
 * Duolingo-inspired daily goal widget. Animated ring shows progress,
 * flame streak counter keeps kids coming back each day.
 */
export function DailyGoal({
  earned,
  goal = 100,
  streak = 0,
  className,
}: DailyGoalProps) {
  const pct = Math.min(1, earned / goal);
  const size = 110;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div
      className={cn(
        "card-stem flex items-center gap-5 p-5 shadow-elev",
        className
      )}
    >
      {/* Ring */}
      <div className="relative h-[110px] w-[110px] shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="xpring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4f3ff0" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ff8a3d" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="currentColor"
            className="text-muted"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="url(#xpring)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-extrabold leading-none">
            {earned}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            / {goal} XP
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-bold">Daily goal</h3>
          {streak > 0 && (
            <span className="streak-pill">
              <Flame className="h-3.5 w-3.5" />
              {streak}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {pct >= 1
            ? "You crushed today's goal! 🎉"
            : `Earn ${goal - earned} more XP to keep your streak alive.`}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>Complete lessons, quizzes, or practice to earn XP.</span>
        </div>
      </div>
    </div>
  );
}
