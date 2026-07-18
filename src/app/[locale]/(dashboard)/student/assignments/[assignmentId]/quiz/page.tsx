import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStudentTutorQuiz } from "@/services/tutor-assignment.service";
import { PageHeader } from "@/components/ui/page-header";
import { ListChecks } from "lucide-react";
import { TutorQuizPlayer } from "./tutor-quiz-player";

export default async function StudentTutorQuizPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { assignmentId } = await params;
  const quiz = await getStudentTutorQuiz(session.user.id, assignmentId);
  if (!quiz) notFound();
  if (quiz.status === "DRAFT") notFound();

  const safeQuiz = {
    id: quiz.id,
    title: quiz.title,
    instructions: quiz.instructions,
    status: quiz.status,
    passingScore: quiz.passingScore ?? 70,
    courseTitle: quiz.course.title,
    tutorName: quiz.tutor.user.name,
    questions: quiz.quizQuestions.map((question) => ({
      ...question,
      answers: question.type === "SHORT_ANSWER" ? [] : question.answers,
    })),
  };
  const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-6">
      <PageHeader
        title={quiz.title}
        description={`${quiz.course.title} · ${quiz.tutor.user.name}`}
        breadcrumbs={[{ label: "Assignments", href: "/student/assignments" }, { label: "Quiz" }]}
        icon={<ListChecks className="h-5 w-5" />}
      />
      <TutorQuizPlayer quiz={safeQuiz} />
      {quiz.quizAttempts.length > 0 && (
        <section className="card-premium p-6">
          <h2 className="font-semibold">Attempt history</h2>
          <ul className="mt-3 divide-y divide-border">
            {quiz.quizAttempts.map((attempt) => (
              <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span>{dateFmt.format(attempt.submittedAt)}</span>
                <span className={attempt.passed ? "chip chip-success" : "chip chip-accent"}>
                  {attempt.score}% · {attempt.earnedPoints}/{attempt.totalPoints} points · {attempt.passed ? "passed" : "not passed"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
