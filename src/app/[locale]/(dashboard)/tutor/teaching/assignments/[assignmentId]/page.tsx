import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorAssignmentForReview } from "@/services/tutor-assignment.service";
import { PageHeader } from "@/components/ui/page-header";
import { ClipboardCheck } from "lucide-react";
import { GradeForm } from "./grade-form";

export default async function TutorAssignmentReviewPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { assignmentId } = await params;
  const assignment = await getTutorAssignmentForReview(session.user.id, assignmentId);
  if (!assignment) notFound();
  const submission = assignment.submissions[0] ?? null;
  const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-6">
      <PageHeader
        title={assignment.title}
        description={`${assignment.student.name} · ${assignment.course.title}`}
        breadcrumbs={[{ label: "Teaching", href: "/tutor/teaching" }, { label: "Assignment" }]}
        icon={<ClipboardCheck className="h-5 w-5" />}
      />
      <section className="card-premium space-y-4 p-6">
        <div className="flex flex-wrap gap-2">
          <span className="chip chip-primary">{assignment.kind.toLowerCase()}</span>
          <span className="chip chip-neutral">{assignment.maxPoints} points</span>
          {assignment.dueAt && <span className="chip chip-neutral">Due {dateFmt.format(assignment.dueAt)}</span>}
        </div>
        <div>
          <h2 className="text-sm font-semibold">Instructions</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{assignment.instructions}</p>
        </div>
        {assignment.lesson && <p className="text-xs text-muted-foreground">Lesson: {assignment.lesson.title}</p>}
      </section>
      <section className="card-premium space-y-4 p-6">
        <div>
          <h2 className="font-semibold">Learner submission</h2>
          <p className="text-xs text-muted-foreground">Grade the submitted work or return it with clear revision feedback.</p>
        </div>
        {!submission ? (
          <p className="rounded-xl bg-muted/40 p-5 text-sm text-muted-foreground">Nothing submitted yet.</p>
        ) : (
          <>
            <div className="rounded-xl border border-border p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="chip chip-accent">{submission.status.toLowerCase()}</span>
                <span className="text-xs text-muted-foreground">Submitted {dateFmt.format(submission.submittedAt)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{submission.content}</p>
            </div>
            <GradeForm
              submissionId={submission.id}
              maxPoints={assignment.maxPoints}
              existingPoints={submission.points}
              existingFeedback={submission.feedback}
            />
          </>
        )}
      </section>
    </div>
  );
}
