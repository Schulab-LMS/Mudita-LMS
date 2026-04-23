import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { getUserEnrollments } from "@/services/enrollment.service";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import { CategoryIcon } from "@/components/illustrations/category-icons";
import {
  BookOpen,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  Trophy,
} from "lucide-react";

export const metadata = { title: "My Courses | Schulab" };

export default async function StudentCoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const enrollments = await getUserEnrollments(session.user.id);

  const active = enrollments.filter((e) => e.status === "ACTIVE");
  const completed = enrollments.filter((e) => e.status === "COMPLETED");
  const saved = enrollments.filter(
    (e) => e.status !== "ACTIVE" && e.status !== "COMPLETED"
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        description={`${enrollments.length} course${
          enrollments.length === 1 ? "" : "s"
        } · ${active.length} active · ${completed.length} completed`}
        breadcrumbs={[{ label: "Courses" }]}
        actions={
          <Link
            href="/courses"
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-launch-gradient px-3 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            Browse more
          </Link>
        }
      />

      {enrollments.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title="No courses yet"
          description="Start your learning journey today — pick a course that excites you."
          action={{ label: "Browse courses", href: "/courses" }}
          tone="first-use"
          size="lg"
        />
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <CourseSection
              title="In progress"
              tone="primary"
              enrollments={active}
            />
          )}
          {completed.length > 0 && (
            <CourseSection
              title="Completed"
              tone="success"
              enrollments={completed}
            />
          )}
          {saved.length > 0 && (
            <CourseSection
              title="Saved"
              tone="neutral"
              enrollments={saved}
            />
          )}
        </div>
      )}
    </div>
  );
}

type Enrollment = Awaited<ReturnType<typeof getUserEnrollments>>[number];

function CourseSection({
  title,
  tone,
  enrollments,
}: {
  title: string;
  tone: "primary" | "success" | "neutral";
  enrollments: Enrollment[];
}) {
  const chip: Record<typeof tone, string> = {
    primary: "chip chip-primary",
    success: "chip chip-success",
    neutral: "chip chip-neutral",
  };
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <span className={chip[tone]}>{enrollments.length}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((enrollment) => {
          const allLessons = enrollment.course.modules.flatMap(
            (m) => m.lessons
          );
          const totalLessons = allLessons.length;
          const isDone = enrollment.status === "COMPLETED";
          const firstLessonId = allLessons[0]?.id;
          const category = enrollment.course.category ?? "rocket";

          return (
            <div
              key={enrollment.id}
              className="card-premium group overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="relative flex h-32 items-center justify-center overflow-hidden bg-launch-gradient-soft">
                <div className="rounded-2xl bg-white/70 p-3 shadow-soft ring-1 ring-border backdrop-blur">
                  <CategoryIcon category={category} size={56} />
                </div>
                {isDone && (
                  <span className="absolute top-3 end-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                    <Trophy className="h-3 w-3" aria-hidden />
                    Completed
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="mb-2 line-clamp-2 font-display font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                  {enrollment.course.title}
                </h3>

                <div className="mb-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <BookOpen className="h-3 w-3" aria-hidden />
                  {totalLessons} lesson{totalLessons === 1 ? "" : "s"}
                  <span>·</span>
                  <span>
                    {enrollment.progress}% complete
                  </span>
                </div>

                <Progress
                  value={enrollment.progress}
                  className="h-1.5"
                />

                <div className="mt-4 flex items-center justify-between">
                  {firstLessonId && (
                    <Link
                      href={`/student/learn/${enrollment.course.slug}/${firstLessonId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-transform hover:translate-x-0.5 rtl:rotate-180 rtl:hover:-translate-x-0.5"
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                          Review
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-3.5 w-3.5" aria-hidden />
                          {enrollment.progress > 0 ? "Continue" : "Start"}
                        </>
                      )}
                    </Link>
                  )}
                  <ArrowRight
                    className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
