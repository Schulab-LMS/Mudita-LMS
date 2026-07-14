import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStudentAssignments } from "@/services/tutor-assignment.service";
import { PageHeader } from "@/components/ui/page-header";
import { ClipboardList } from "lucide-react";
import { AssignmentSubmissionForm } from "./assignment-submission-form";

export const metadata = { title: "Assignments" };

export default async function StudentAssignmentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const assignments = await getStudentAssignments(session.user.id);
  const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-6">
      <PageHeader title="Assignments" description="Tasks, projects, feedback, and grades from your tutor." icon={<ClipboardList className="h-5 w-5" />} />
      {assignments.length === 0 ? (
        <div className="card-premium p-8 text-center text-sm text-muted-foreground">No tutor assignments yet.</div>
      ) : (
        <div className="space-y-5">
          {assignments.map((assignment) => {
            const submission = assignment.submissions[0] ?? null;
            const overdue = Boolean(assignment.dueAt && assignment.dueAt < new Date() && !submission);
            return (
              <article key={assignment.id} className="card-premium space-y-5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="chip chip-primary">{assignment.kind.toLowerCase()}</span>
                      {assignment.status === "CLOSED" && <span className="chip chip-accent">closed</span>}
                      {overdue && <span className="chip chip-accent">overdue</span>}
                      {submission && <span className={submission.status === "REVIEWED" ? "chip chip-success" : "chip chip-neutral"}>{submission.status.toLowerCase()}</span>}
                    </div>
                    <h2 className="text-lg font-semibold">{assignment.title}</h2>
                    <p className="text-xs text-muted-foreground">{assignment.course.title} · {assignment.tutor.user.name}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{assignment.maxPoints} points</p>
                    {assignment.dueAt && <p>Due {dateFmt.format(assignment.dueAt)}</p>}
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm">{assignment.instructions}</p>
                {submission?.feedback && (
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Tutor feedback{submission.points != null ? ` · ${submission.points}/${assignment.maxPoints}` : ""}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{submission.feedback}</p>
                  </div>
                )}
                {assignment.status === "CLOSED" && (
                  <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                    This assignment is closed. Your existing submission and feedback remain available, but new submissions are not accepted.
                  </p>
                )}
                {assignment.status === "PUBLISHED" && (
                  <AssignmentSubmissionForm assignmentId={assignment.id} existingContent={submission?.content ?? null} />
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
