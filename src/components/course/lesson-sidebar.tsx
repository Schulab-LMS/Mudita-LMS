import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import {
  CheckCircle,
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
}: LessonSidebarProps) {
  const t = await getTranslations("lesson");
  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const completedCount = completedLessonIds.length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <nav className="w-72 shrink-0 rounded-xl border bg-white shadow-sm">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">{t("courseContent")}</h3>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {completedCount}/{lessons.length}
          </span>
        </div>
      </div>

      <ul className="divide-y max-h-[calc(100vh-16rem)] overflow-y-auto">
        {sorted.map((lesson) => {
          const isCompleted = completedLessonIds.includes(lesson.id);
          const isCurrent = lesson.id === currentLessonId;
          const TypeIcon = typeIcons[lesson.type ?? "VIDEO"] ?? Video;
          const typeColor = typeColors[lesson.type ?? "VIDEO"] ?? "text-blue-500";

          return (
            <li key={lesson.id}>
              <Link
                href={`/student/learn/${courseSlug}/${lesson.id}`}
                className={`flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/60 ${
                  isCurrent
                    ? "bg-primary/5 font-medium text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {/* Type icon */}
                <span className={`mt-0.5 shrink-0 ${isCurrent ? "text-primary" : typeColor}`}>
                  <TypeIcon className="h-4 w-4" />
                </span>

                {/* Title */}
                <span className="flex-1 leading-snug">{lesson.title}</span>

                {/* Duration */}
                {lesson.duration && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {Math.round(lesson.duration / 60)}m
                  </span>
                )}

                {/* Status indicator */}
                <span className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : isCurrent ? (
                    <PlayCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
