import { Link } from "@/i18n/navigation";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, CheckCircle2 } from "lucide-react";

interface EnrollmentListProps {
  hasAnyEnrollments?: boolean;
  enrollments: Array<{
    id: string;
    progress: number;
    status: string;
    course: {
      id: string;
      title: string;
      slug: string;
      thumbnail: string | null;
      category: string;
    };
  }>;
}

const categoryIcons: Record<string, string> = {
  math: "∑",
  coding: "</>",
  science: "🔬",
  robotics: "🤖",
  engineering: "⚙️",
  ai: "🧠",
  electronics: "⚡",
  biology: "🧬",
  chemistry: "⚗️",
  physics: "⚛️",
};

const categoryColors: Record<string, string> = {
  math: "bg-amber-100",
  coding: "bg-emerald-100",
  science: "bg-cyan-100",
  robotics: "bg-purple-100",
  engineering: "bg-orange-100",
  ai: "bg-blue-100",
  electronics: "bg-teal-100",
  biology: "bg-lime-100",
  chemistry: "bg-pink-100",
  physics: "bg-indigo-100",
};

export function EnrollmentList({
  enrollments,
  hasAnyEnrollments = false,
}: EnrollmentListProps) {
  if (enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-14 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
          🚀
        </div>
        <p className="font-display text-lg font-semibold text-foreground">
          {hasAnyEnrollments ? "All caught up!" : "Ready for an adventure?"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasAnyEnrollments
            ? "You have completed every enrolled course. Pick another adventure when you are ready."
            : "Start your first course and begin earning XP!"}
        </p>
        <Link
          href="/courses"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          <BookOpen className="h-4 w-4" />
          Browse courses
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {enrollments.map((enrollment) => {
        const icon = categoryIcons[enrollment.course.category] ?? "📚";
        const iconBg = categoryColors[enrollment.course.category] ?? "bg-gray-100";
        const isComplete = enrollment.status === "COMPLETED";

        return (
          <Link
            key={enrollment.id}
            href="/student/courses"
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover-lift"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${iconBg}`}>
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold text-foreground group-hover:text-primary">
                {enrollment.course.title}
              </p>
              <div className="mt-2">
                <Progress
                  value={enrollment.progress}
                  variant={isComplete ? "success" : "xp"}
                  size="sm"
                  showLabel
                />
              </div>
            </div>
            <div className="shrink-0">
              {isComplete ? (
                <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Done
                </div>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Play className="h-4 w-4" />
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
