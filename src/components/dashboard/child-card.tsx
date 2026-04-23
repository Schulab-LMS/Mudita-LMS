import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/avatar";
import { BookOpen, Award, TrendingUp, ArrowRight } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface ChildCardProps {
  child: {
    id: string;
    name: string;
    avatar: string | null;
    enrollments: Array<{
      progress: number;
      status: string;
      course: { title: string };
    }>;
  };
}

export function ChildCard({ child }: ChildCardProps) {
  const totalEnrollments = child.enrollments.length;
  const completed = child.enrollments.filter(
    (e) => e.status === "COMPLETED"
  ).length;
  const active = child.enrollments.filter(
    (e) => e.status === "ACTIVE"
  ).length;
  const avgProgress =
    totalEnrollments > 0
      ? Math.round(
          child.enrollments.reduce((sum, e) => sum + e.progress, 0) /
            totalEnrollments
        )
      : 0;

  const initials = getInitials(child.name);

  return (
    <Link
      href={`/parent/children/${child.id}`}
      className="card-premium group relative flex flex-col overflow-hidden p-5"
    >
      {/* Accent bar */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-launch-gradient-horizontal"
      />

      <div className="flex items-center gap-3">
        <Avatar
          src={child.avatar ?? undefined}
          alt={child.name}
          fallback={initials}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">
            {child.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {totalEnrollments} course{totalEnrollments !== 1 ? "s" : ""}
          </p>
        </div>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
          aria-hidden
        />
      </div>

      {totalEnrollments > 0 ? (
        <>
          {/* Mini stat row */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniStat
              icon={<BookOpen className="h-3 w-3" />}
              label="Active"
              value={active}
            />
            <MiniStat
              icon={<Award className="h-3 w-3" />}
              label="Done"
              value={completed}
            />
            <MiniStat
              icon={<TrendingUp className="h-3 w-3" />}
              label="Avg"
              value={`${avgProgress}%`}
            />
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
              <span>Overall progress</span>
              <span className="font-semibold text-foreground">
                {avgProgress}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-launch-gradient-horizontal transition-all"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
          </div>
        </>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          No enrollments yet — encourage them to pick their first course.
        </p>
      )}
    </Link>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-2 text-center">
      <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 font-display text-sm font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}
