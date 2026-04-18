import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { getUserEnrollments } from "@/services/enrollment.service";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export const metadata = { title: "My Courses | Schulab" };

export default async function StudentCoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const enrollments = await getUserEnrollments(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">
            {enrollments.length} course{enrollments.length !== 1 ? "s" : ""} enrolled
          </p>
        </div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <BookOpen className="h-4 w-4" />
          Browse more
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <BookOpen className="mb-3 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-muted-foreground">
            No courses yet
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Start your learning journey today.
          </p>
          <Link
            href="/courses"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const allLessons = enrollment.course.modules.flatMap((m) => m.lessons);
            const totalLessons = allLessons.length;

            return (
              <div
                key={enrollment.id}
                className="rounded-xl border bg-white overflow-hidden"
              >
                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <span className="text-4xl">📚</span>
                </div>
                <div className="p-4">
                  <h3 className="mb-1 font-semibold line-clamp-2">
                    {enrollment.course.title}
                  </h3>
                  <div className="mb-3 flex items-center gap-2">
                    <Badge
                      variant={
                        enrollment.status === "COMPLETED" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {enrollment.status === "COMPLETED" ? "Completed" : "In progress"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {totalLessons} lessons
                    </span>
                  </div>
                  <Progress value={enrollment.progress} className="h-1.5 mb-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {enrollment.progress}% complete
                    </span>
                    {totalLessons > 0 && (
                      <Link
                        href={`/student/learn/${enrollment.course.slug}/${allLessons[0]?.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {enrollment.progress > 0 ? "Continue" : "Start"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
