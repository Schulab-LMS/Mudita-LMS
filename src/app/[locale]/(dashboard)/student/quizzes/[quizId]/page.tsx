import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getQuizById } from "@/services/quiz.service";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Link } from "@/i18n/navigation";
import {
  ClipboardList,
  Clock,
  HelpCircle,
  Target,
  ChevronLeft,
} from "lucide-react";

interface QuizPageProps {
  params: Promise<{ quizId: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { quizId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const quiz = await getQuizById(quizId);
  if (!quiz) notFound();

  const questionCount = quiz.questions.length;
  const passingScore = quiz.passingScore;
  const timeLimit = quiz.timeLimit ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Top breadcrumbs + back link */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: "Learn", href: "/student" },
            { label: "Quizzes" },
            { label: quiz.title },
          ]}
        />
        <Link
          href="/student"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
          Back to dashboard
        </Link>
      </div>

      {/* Quiz hero card */}
      <div className="card-premium relative overflow-hidden p-6 sm:p-8">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-launch-gradient-horizontal"
        />
        <div className="flex items-start gap-3">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Quiz
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              {quiz.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Answer {questionCount} question{questionCount === 1 ? "" : "s"}{" "}
              to test what you&apos;ve learned. Take your time — you can
              retake this quiz anytime.
            </p>
          </div>
        </div>

        {/* Meta chips */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="chip chip-primary">
            <HelpCircle className="h-3 w-3" aria-hidden />
            {questionCount} question{questionCount === 1 ? "" : "s"}
          </span>
          {timeLimit && (
            <span className="chip chip-accent">
              <Clock className="h-3 w-3" aria-hidden />
              {timeLimit} min limit
            </span>
          )}
          <span className="chip chip-success">
            <Target className="h-3 w-3" aria-hidden />
            Pass at {passingScore}%
          </span>
        </div>
      </div>

      {/* Quiz player */}
      <div className="card-premium p-5 sm:p-6">
        <QuizPlayer quiz={quiz} />
      </div>

      {/* Helpful aside */}
      <p className="text-center text-xs text-muted-foreground">
        You can retake this quiz — your best score counts toward course
        completion.
      </p>
    </div>
  );
}
