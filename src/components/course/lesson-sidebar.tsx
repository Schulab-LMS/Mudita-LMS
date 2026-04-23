import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  Video,
  FileText,
  ClipboardList,
  Cpu,
  ClipboardCheck,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration?: number | null;
  order: number;
  type?: string;
}

interface LessonSidebarProps {
  lessons: Lesson[];
  currentLessonId: string;
  completedLessonIds: string[];
  courseSlug: string;
  courseTitle?: string;
  progressPercent?: number;
}

const typeIcons: Record<string, React.ElementType> = {
  VIDEO: Video,
  TEXT: FileText,
  QUIZ: ClipboardList,
  INTERACTIVE: Cpu,
  ASSIGNMENT: ClipboardCheck,
};

const typeColors: Record<string, string> = {
  VIDEO: "text-blue-500",
  TEXT: "text-emerald-500",
  QUIZ: "text-amber-500",
  INTERACTIVE: "text-violet-500",
  ASSIGNMENT: "text-orange-500",
};

export async function LessonSidebar({
  lessons,
  currentLessonId,
  completedLessonIds,
  courseSlug,
  courseTitle,
  progressPercent,
}: LessonSidebarProps) {
  const t = await getTranslations("lesson");
  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const completedCount = completedLessonIds.length;
  const pct =
    progressPercent ??
    (lessons.length > 0
      ? Math.round((completedCount / lessons.length) * 100)
      : 0);

  return (
    <aside className="card-premium sticky top-20 h-fit overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        {courseTitle && (
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {courseTitle}
          </p>
        )}
        <h3 className="mt-0.5 text-sm font-semibold text-foreground">
          {t("courseContent")}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-launch-gradient-horizontal transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-foreground">
            {completedCount}/{lessons.length}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {pct}% complete
        </p>
      </div>

      {/* Lesson list */}
      <nav
        aria-label="Course lessons"
        className="max-h-[calc(100vh-18rem)] overflow-y-auto"
      >
        <ul className="divide-y divide-border">
          {sorted.map((lesson, i) => {
            const isCompleted = completedLessonIds.includes(lesson.id);
            const isCurrent = lesson.id === currentLessonId;
            const TypeIcon = typeIcons[lesson.type ?? "VIDEO"] ?? Video;
            const typeColor =
              typeColors[lesson.type ?? "VIDEO"] ?? "text-blue-500";

            return (
              <li key={lesson.id}>
                <Link
                  href={`/student/learn/${courseSlug}/${lesson.id}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`group relative flex items-start gap-3 px-4 py-3 text-sm transition-colors ${
                    isCurrent
                      ? "bg-primary/5"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  {/* Active indicator bar */}
                  {isCurrent && (
                    <span
                      aria-hidden
                      className="absolute start-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-e-full bg-launch-gradient-horizontal"
                    />
                  )}

                  {/* Number badge */}
                  <span
                    className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`line-clamp-2 leading-snug ${
                        isCurrent
                          ? "font-semibold text-foreground"
                          : isCompleted
                            ? "text-foreground"
                            : ""
                      }`}
                    >
                      {lesson.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <TypeIcon
                          className={`h-3 w-3 ${isCurrent ? "text-primary" : typeColor}`}
                          aria-hidden
                        />
                        {(lesson.type ?? "VIDEO").toLowerCase()}
                      </span>
                      {lesson.duration && (
                        <span>· {Math.round(lesson.duration / 60)}m</span>
                      )}
                    </div>
                  </div>

                  {/* Status indicator */}
                  <span className="mt-1 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2
                        className="h-4 w-4 text-emerald-500"
                        aria-label="Completed"
                      />
                    ) : isCurrent ? (
                      <PlayCircle
                        className="h-4 w-4 text-primary"
                        aria-label="Playing"
                      />
                    ) : (
                      <Circle
                        className="h-4 w-4 text-muted-foreground/40"
                        aria-hidden
                      />
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
