import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface Quest {
  id: string;
  title: string;
  reward: number; // XP
  progress: number; // 0..1
  done: boolean;
}

interface QuestListProps {
  quests: Quest[];
  className?: string;
}

/** Daily quests panel — gives kids micro-goals. */
export function QuestList({ quests, className }: QuestListProps) {
  const t = useTranslations("dashboard");
  return (
    <div className={cn("card-stem p-5 shadow-elev", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          {t("dailyQuests")}
        </h3>
        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
          {t("questResets")}
        </span>
      </div>
      <ul className="space-y-2.5">
        {quests.map((q, i) => (
          <li
            key={q.id}
            className="group relative flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 transition-all hover:border-primary/30 hover:bg-muted/40"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center">
              {q.done ? (
                <CheckCircle2 className="h-7 w-7 text-emerald-500 animate-bounce-in" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground/40 transition-colors group-hover:text-primary/60" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm font-semibold",
                  q.done && "text-muted-foreground line-through"
                )}
              >
                {q.title}
              </p>
              {/* Mini progress bar */}
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="xp-bar h-full"
                  style={{ width: `${Math.min(100, q.progress * 100)}%` }}
                />
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
              +{q.reward} XP
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
