"use client";

import { useState, useTransition } from "react";
import { submitTutorQuiz } from "@/actions/tutor-quiz.actions";

type QuizQuestion = {
  id: string;
  text: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  points: number;
  order: number;
  answers: Array<{ id: string; text: string; order: number }>;
};

type QuizData = {
  id: string;
  title: string;
  instructions: string;
  status: "PUBLISHED" | "CLOSED";
  passingScore: number;
  courseTitle: string;
  tutorName: string;
  questions: QuizQuestion[];
};

type QuizResult = {
  attemptId: string;
  score: number;
  passed: boolean;
  passingScore: number;
  earnedPoints: number;
  totalPoints: number;
  questionResults: Array<{
    questionId: string;
    selectedAnswerId: string | null;
    selectedAnswerText: string;
    correctAnswerId: string | null;
    correctAnswerText: string;
    correct: boolean;
    points: number;
    explanation: string | null;
  }>;
};

export function TutorQuizPlayer({ quiz }: { quiz: QuizData }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const answered = quiz.questions.filter((question) => answers[question.id]?.trim()).length;

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const response = await submitTutorQuiz({ assignmentId: quiz.id, answers });
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setMessage(response.error ?? "Could not submit quiz");
      }
    });
  }

  if (result) {
    return (
      <div className="space-y-5">
        <section className="card-premium p-8 text-center">
          <p className="text-sm text-muted-foreground">Automatically graded</p>
          <p className="mt-2 text-5xl font-bold">{result.score}%</p>
          <span className={`mt-3 inline-flex ${result.passed ? "chip chip-success" : "chip chip-accent"}`}>
            {result.passed ? "Passed" : "Not passed"}
          </span>
          <p className="mt-3 text-sm text-muted-foreground">
            {result.earnedPoints}/{result.totalPoints} points · passing score {result.passingScore}%
          </p>
        </section>
        {quiz.questions.map((question, index) => {
          const review = result.questionResults.find((item) => item.questionId === question.id);
          return (
            <article key={question.id} className="card-premium p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-semibold">{index + 1}. {question.text}</h2>
                <span className={review?.correct ? "chip chip-success" : "chip chip-accent"}>
                  {review?.correct ? `${question.points}/${question.points}` : `0/${question.points}`}
                </span>
              </div>
              <p className="mt-3 text-sm"><span className="font-medium">Your answer:</span> {review?.selectedAnswerText || "No answer"}</p>
              {!review?.correct && <p className="mt-1 text-sm"><span className="font-medium">Correct answer:</span> {review?.correctAnswerText}</p>}
              {review?.explanation && <p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">{review.explanation}</p>}
            </article>
          );
        })}
        {quiz.status === "PUBLISHED" && (
          <button type="button" onClick={() => { setAnswers({}); setResult(null); }} className="h-10 rounded-lg border border-input px-5 text-sm font-semibold">
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="card-premium p-6">
        <p className="whitespace-pre-wrap text-sm">{quiz.instructions}</p>
        <p className="mt-3 text-xs text-muted-foreground">{quiz.questions.length} questions · passing score {quiz.passingScore}% · {answered}/{quiz.questions.length} answered</p>
        {quiz.status === "CLOSED" && <p className="mt-4 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700">This quiz is closed. Attempt history remains available.</p>}
      </section>

      {quiz.questions.map((question, index) => (
        <fieldset key={question.id} disabled={pending || quiz.status === "CLOSED"} className="card-premium space-y-4 p-6">
          <legend className="font-semibold">{index + 1}. {question.text} <span className="text-xs font-normal text-muted-foreground">({question.points} {question.points === 1 ? "point" : "points"})</span></legend>
          {question.type === "SHORT_ANSWER" ? (
            <label className="block space-y-1.5 text-sm font-medium">
              Your answer
              <input value={answers[question.id] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} maxLength={2000} className="input-pretty w-full" />
            </label>
          ) : (
            <div className="space-y-2">
              {question.answers.map((answer) => (
                <label key={answer.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm hover:bg-muted/40">
                  <input type="radio" name={`question-${question.id}`} value={answer.id} checked={answers[question.id] === answer.id} onChange={() => setAnswers((current) => ({ ...current, [question.id]: answer.id }))} />
                  <span>{answer.text}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
      ))}

      {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
      <button type="button" onClick={submit} disabled={pending || quiz.status === "CLOSED" || answered !== quiz.questions.length} className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        {pending ? "Grading…" : "Submit quiz for grading"}
      </button>
    </div>
  );
}
