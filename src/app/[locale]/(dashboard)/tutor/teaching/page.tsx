import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { getTutorTeachingOverview } from "@/services/tutor-teaching.service";
import { getTutorAssignments } from "@/services/tutor-assignment.service";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import {
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";

export const metadata = { title: "Teaching" };

export default async function TutorTeachingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [overview, assignments] = await Promise.all([
    getTutorTeachingOverview(session.user.id),
    getTutorAssignments(session.user.id),
  ]);
  if (!overview) redirect("/tutor/profile");

  if (overview.totals.learners === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Teaching"
          description="Courses, learner progress, assessment reviews, and attendance in one place."
          breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Teaching" }]}
          icon={<GraduationCap className="h-5 w-5" />}
        />
        <EmptyState
          illustration={<NoCoursesScene />}
          title="No assigned learners yet"
          description="Your teaching workspace will populate after a learner books a session with you."
          action={{ label: "View bookings", href: "/tutor/bookings" }}
          tone="first-use"
          size="lg"
        />
      </div>
    );
  }

  const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Teaching"
        description="Courses, learner progress, assessment reviews, and attendance in one place."
        breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Teaching" }]}
        icon={<GraduationCap className="h-5 w-5" />}
        actions={
          <Link href="/tutor/teaching/assignments/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" aria-hidden /> New assignment
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned learners" value={overview.totals.learners} icon={Users} tone="primary" />
        <StatCard label="Teaching courses" value={overview.totals.courses} icon={BookOpen} tone="secondary" />
        <StatCard label="Awaiting review" value={overview.totals.awaitingReview} icon={ClipboardCheck} tone="accent" />
        <StatCard label="Recorded sessions" value={overview.totals.recordedSessions} icon={CalendarCheck} tone="success" />
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Learner progress</h2>
          <p className="text-sm text-muted-foreground">Only learners who have booked you are included.</p>
        </div>
        <div className="space-y-4">
          {overview.learners.map((learner) => (
            <article key={learner.id} className="card-premium p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{learner.name}</h3>
                  <p className="text-xs text-muted-foreground">{learner.email}</p>
                </div>
                <Link
                  href={`/messages/${learner.id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input px-3 text-xs font-semibold hover:bg-muted"
                >
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden /> Message
                </Link>
              </div>
              {learner.courses.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No active or completed courses.</p>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {learner.courses.map((course) => (
                    <div key={course.id} className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">{course.title}</p>
                        <span className="chip chip-primary">{course.status.toLowerCase()}</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-launch-gradient-horizontal" style={{ width: `${course.progress}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {course.progress}% complete · {course.completedLessons} lessons completed
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="card-premium overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="font-semibold">Tutor assignments</h2>
            <p className="text-xs text-muted-foreground">Published tasks, submissions, grades, and revision requests.</p>
          </div>
          <Link href="/tutor/teaching/assignments/new" className="text-xs font-semibold text-primary hover:underline">Create assignment</Link>
        </div>
        {assignments.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No tutor-authored assignments yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {assignments.slice(0, 12).map((assignment) => {
              const submission = assignment.submissions[0] ?? null;
              return (
                <li key={assignment.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{assignment.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {assignment.student.name} · {assignment.course.title}
                      {assignment.dueAt ? ` · due ${dateFmt.format(assignment.dueAt)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={submission?.status === "REVIEWED" ? "chip chip-success" : submission ? "chip chip-accent" : "chip chip-neutral"}>
                      {submission?.status.toLowerCase() ?? "not submitted"}
                    </span>
                    <Link href={`/tutor/teaching/assignments/${assignment.id}`} className="text-xs font-semibold text-primary hover:underline">
                      {submission ? "Review" : "Open"}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card-premium overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="font-semibold">Assignment reviews</h2>
            <p className="text-xs text-muted-foreground">Hands-on lesson submissions from assigned learners.</p>
          </div>
          {overview.reviews.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {overview.reviews.slice(0, 8).map((review) => (
                <li key={review.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{review.lesson?.title ?? "Lesson activity"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {review.student.name} · {review.lesson?.module.course.title ?? "Course"}
                    </p>
                  </div>
                  {review.reviewSessionId ? (
                    <Link href={`/session/${review.reviewSessionId}`} className="text-xs font-semibold text-primary hover:underline">
                      {review.status === "SUBMITTED" ? "Review" : "View feedback"}
                    </Link>
                  ) : (
                    <span className={review.status === "SUBMITTED" ? "chip chip-accent" : "chip chip-success"}>
                      {review.status.toLowerCase()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card-premium overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="font-semibold">Quiz results</h2>
            <p className="text-xs text-muted-foreground">Recent completed quiz attempts.</p>
          </div>
          {overview.quizAttempts.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No completed quiz attempts yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {overview.quizAttempts.slice(0, 8).map((attempt) => (
                <li key={attempt.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{attempt.quiz.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {attempt.user.name} · {attempt.quiz.lesson.module.course.title}
                    </p>
                  </div>
                  <span className={attempt.passed ? "chip chip-success" : "chip chip-accent"}>{attempt.score}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card-premium overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="font-semibold">Attendance and sessions</h2>
          <p className="text-xs text-muted-foreground">Live attendance plus manual completed/no-show status.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-4 py-3">Learner</th><th className="px-4 py-3">Session</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Attendance</th><th className="px-4 py-3 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {overview.attendance.slice(0, 12).map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.student.name}</td>
                  <td className="px-4 py-3">{row.lesson?.title ?? row.subject}</td>
                  <td className="px-4 py-3 text-muted-foreground">{dateFmt.format(new Date(row.startTime))}</td>
                  <td className="px-4 py-3">
                    <span className={row.joined || row.status === "COMPLETED" ? "chip chip-success" : row.status === "NO_SHOW" ? "chip chip-accent" : "chip chip-neutral"}>
                      {row.joined ? `present${row.durationSec ? ` · ${Math.round(row.durationSec / 60)}m` : ""}` : row.status.toLowerCase().replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right"><Link href={`/session/${row.id}`} className="text-xs font-semibold text-primary hover:underline">Open session</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
