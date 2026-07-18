import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorAssignmentForReview } from "@/services/tutor-assignment.service";
import { PageHeader } from "@/components/ui/page-header";
import { ClipboardCheck } from "lucide-react";
import { GradeForm } from "./grade-form";
import { AssignmentLifecyclePanel } from "./assignment-lifecycle-panel";

export default async function TutorAssignmentReviewPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { assignmentId } = await params;
  const assignment = await getTutorAssignmentForReview(session.user.id, assignmentId);
  if (!assignment) notFound();
  const submission = assignment.submissions[0] ?? null;
  const quizAttempt = assignment.quizAttempts[0] ?? null;
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
          <span className={assignment.status === "CLOSED" ? "chip chip-accent" : "chip chip-success"}>{assignment.status.toLowerCase()}</span>
          <span className="chip chip-neutral">{assignment.maxPoints} points</span>
          {assignment.kind === "QUIZ" && <span className="chip chip-neutral">Pass at {assignment.passingScore ?? 70}%</span>}
          {assignment.dueAt && <span className="chip chip-neutral">Due {dateFmt.format(assignment.dueAt)}</span>}
        </div>
        <div>
          <h2 className="text-sm font-semibold">Instructions</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{assignment.instructions}</p>
        </div>
        {assignment.lesson && <p className="text-xs text-muted-foreground">Lesson: {assignment.lesson.title}</p>}
      </section>
      <AssignmentLifecyclePanel
        assignment={{
          id: assignment.id,
          title: assignment.title,
          instructions: assignment.instructions,
          kind: assignment.kind,
          status: assignment.status,
          dueAt: assignment.dueAt?.toISOString().slice(0, 16) ?? "",
          maxPoints: assignment.maxPoints,
        }}
        hasSubmission={Boolean(submission || quizAttempt)}
      />
      {assignment.kind === "QUIZ" ? (
        <>
          <section className="card-premium space-y-4 p-6">
            <div>
              <h2 className="font-semibold">Structured questions</h2>
              <p className="text-xs text-muted-foreground">Answer keys are visible only to the Tutor and after the learner submits.</p>
            </div>
            <ol className="space-y-4">
              {assignment.quizQuestions.map((question, index) => (
                <li key={question.id} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="font-medium">{index + 1}. {question.text}</p>
                    <span className="chip chip-neutral">{question.points} {question.points === 1 ? "point" : "points"}</span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm">
                    {question.answers.map((answer) => (
                      <li key={answer.id} className={answer.isCorrect ? "font-medium text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}>
                        {answer.isCorrect ? "✓" : "○"} {answer.text}
                      </li>
                    ))}
                  </ul>
                  {question.explanation && <p className="mt-3 text-xs text-muted-foreground">Explanation: {question.explanation}</p>}
                </li>
              ))}
            </ol>
          </section>
          <section className="card-premium space-y-4 p-6">
            <div>
              <h2 className="font-semibold">Automatic results</h2>
              <p className="text-xs text-muted-foreground">Every attempt is graded immediately from the server-side answer key.</p>
            </div>
            {assignment.quizAttempts.length === 0 ? (
              <p className="rounded-xl bg-muted/40 p-5 text-sm text-muted-foreground">No attempts yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {assignment.quizAttempts.map((attempt) => (
                  <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <span>{dateFmt.format(attempt.submittedAt)}</span>
                    <span className={attempt.passed ? "chip chip-success" : "chip chip-accent"}>
                      {attempt.score}% · {attempt.earnedPoints}/{attempt.totalPoints} points · {attempt.passed ? "passed" : "not passed"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
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
      )}
    </div>
  );
}
