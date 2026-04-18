import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
  /**
   * 49 = 7 cols × 7 rows, one value per day in the last 49 days.
   * Each value 0..4 represents an intensity bucket.
   */
  data?: number[];
  className?: string;
}

const DEFAULT_DATA: number[] = [
  0,1,2,1,0,1,2, 3,1,0,2,3,4,2, 1,2,3,4,3,2,1, 0,1,2,3,4,3,2,
  2,3,4,3,2,1,2, 3,2,1,0,1,2,3, 4,3,2,1,2,3,4,
];

const toneFor = (n: number) =>
  n <= 0
    ? "bg-muted"
    : n === 1
      ? "bg-indigo-200"
      : n === 2
        ? "bg-indigo-300"
        : n === 3
          ? "bg-indigo-500"
          : "bg-indigo-700";

/** GitHub-style mini activity heatmap. Reassures parents, motivates kids. */
export function ActivityHeatmap({
  data = DEFAULT_DATA,
  className,
}: ActivityHeatmapProps) {
  return (
    <div className={cn("card-stem p-5 shadow-elev", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold flex items-center gap-2">
          <Activity className="h-5 w-5 text-[var(--stem-space)]" />
          Last 7 weeks
        </h3>
        <span className="text-xs text-muted-foreground">Learning activity</span>
      </div>
      <div
        className="grid grid-flow-col gap-1.5"
        style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
      >
        {data.map((v, i) => (
          <span
            key={i}
            className={cn(
              "aspect-square w-full rounded-[4px] transition-transform hover:scale-125",
              toneFor(v)
            )}
            title={`${v} activities`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={cn("h-3 w-3 rounded-[3px]", toneFor(n))}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
