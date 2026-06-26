import { Link } from "@/i18n/navigation";
import { BookOpen, CheckCircle2, Circle, Layers } from "lucide-react";

export interface RoadmapStage {
  key: string;
  label: string;
  kind: "bundle" | "course";
  href: string;
  targetTitle: string;
  done: boolean;
}

interface PathwayRoadmapProps {
  stages: RoadmapStage[];
}

// Vertical stepper. Each node links to its bundle or course; a green tick marks
// stages the signed-in learner has completed (all nodes show an empty circle
// for anonymous visitors, since `done` is false without a session).
export function PathwayRoadmap({ stages }: PathwayRoadmapProps) {
  return (
    <ol className="relative space-y-4">
      {stages.map((stage, i) => {
        const isLast = i === stages.length - 1;
        return (
          <li key={stage.key} className="relative ps-12">
            {/* Connector line */}
            {!isLast && (
              <span
                className="absolute start-[18px] top-9 h-[calc(100%+1rem)] w-0.5 bg-border"
                aria-hidden
              />
            )}
            {/* Node marker */}
            <span className="absolute start-0 top-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-card shadow-sm">
              {stage.done ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </span>

            <Link
              href={stage.href}
              className="group block rounded-2xl border border-border bg-card p-4 shadow-soft transition-colors hover:border-primary/40"
            >
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                {stage.kind === "bundle" ? (
                  <Layers className="h-3.5 w-3.5" />
                ) : (
                  <BookOpen className="h-3.5 w-3.5" />
                )}
                <span className="uppercase tracking-wide">
                  Stage {i + 1} · {stage.kind === "bundle" ? "Bundle" : "Course"}
                </span>
                {stage.done && (
                  <span className="ms-auto rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                    Completed
                  </span>
                )}
              </div>
              <p className="font-display text-lg font-bold transition-colors group-hover:text-primary">
                {stage.label || stage.targetTitle}
              </p>
              {stage.label && stage.label !== stage.targetTitle && (
                <p className="text-sm text-muted-foreground">{stage.targetTitle}</p>
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
