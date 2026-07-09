"use client";

import { useState, useEffect, useCallback } from "react";
import { submitQuizAttempt } from "@/actions/quiz.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface Answer {
  id: string;
  text: string;
  order: number;
}

interface Question {
  id: string;
  text: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  points: number;
  order: number;
  explanation?: string | null;
  answers: Answer[];
}

interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  timeLimit?: number | null;
  questions: Question[];
}

interface QuestionResult {
  questionId: string;
  correct: boolean;
  correctAnswerId: string;
  selectedAnswerId: string;
}

interface QuizResult {
  score: number;
  passed: boolean;
  totalPoints: number;
  earnedPoints: number;
  passingScore: number;
  questionResults: QuestionResult[];
}

interface QuizPlayerProps {
  quiz: Quiz;
}

export function QuizPlayer({ quiz }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const response = await submitQuizAttempt(quiz.id, selectedAnswers);
      if (response.success && response.data) {
        setResults(response.data);
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz.id, selectedAnswers]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted, handleSubmit]);

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const selectAnswer = (questionId: string, answerId: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const getQuestionResult = (questionId: string) => {
    return results?.questionResults.find((r) => r.questionId === questionId);
  };

  if (submitted && results) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-5xl font-bold">{results.score}%</p>
              <Badge
                variant={results.passed ? "success" : "destructive"}
                className="mt-2"
              >
                {results.passed ? "Passed" : "Failed"}
              </Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Passing score: {results.passingScore}% | Points:{" "}
                {results.earnedPoints}/{results.totalPoints}
              </p>
            </div>
            <Progress value={results.score} className="h-3" />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Question Review</h3>
          {quiz.questions.map((question, idx) => {
            const qResult = getQuestionResult(question.id);
            return (
              <Card key={question.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {qResult?.correct ? (
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {idx + 1}. {question.text}
                      </p>
                      <div className="mt-2 space-y-1">
                        {question.answers.map((answer) => {
                          const isSelected =
                            qResult?.selectedAnswerId === answer.id;
                          const isCorrectAnswer =
                            qResult?.correctAnswerId === answer.id;
                          return (
                            <div
                              key={answer.id}
                              className={`rounded-lg px-3 py-2 text-sm ${
                                isCorrectAnswer
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : isSelected
                                    ? "bg-red-50 text-red-800 border border-red-200"
                                    : "bg-muted/50"
                              }`}
                            >
                              {answer.text}
                              {isCorrectAnswer && (
                                <span className="ml-2 text-xs font-medium">
                                  (Correct)
                                </span>
                              )}
                              {isSelected && !isCorrectAnswer && (
                                <span className="ml-2 text-xs font-medium">
                                  (Your answer)
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {question.explanation && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{quiz.title}</h2>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions} | {answeredCount}{" "}
            answered
          </p>
        </div>
        {timeLeft !== null && (
          <Badge
            variant={timeLeft < 60 ? "destructive" : "secondary"}
            className="flex items-center gap-1 text-base"
          >
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </Badge>
        )}
      </div>

      <Progress
        value={((currentIndex + 1) / totalQuestions) * 100}
        className="h-2"
      />

      <div className="flex gap-2 flex-wrap">
        {quiz.questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(idx)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
              idx === currentIndex
                ? "bg-primary text-primary-foreground"
                : selectedAnswers[q.id]
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">{currentQuestion.type === "TRUE_FALSE" ? "True/False" : "Multiple Choice"}</Badge>
            <span className="text-sm text-muted-foreground">
              {currentQuestion.points} point{currentQuestion.points !== 1 ? "s" : ""}
            </span>
          </div>
          <CardTitle className="text-lg">{currentQuestion.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentQuestion.type === "TRUE_FALSE" ? (
              <div className="flex gap-3">
                {currentQuestion.answers.map((answer) => (
                  <button
                    key={answer.id}
                    onClick={() =>
                      selectAnswer(currentQuestion.id, answer.id)
                    }
                    className={`flex-1 rounded-lg border-2 px-4 py-3 text-center font-medium transition-colors ${
                      selectedAnswers[currentQuestion.id] === answer.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    {answer.text}
                  </button>
                ))}
              </div>
            ) : (
              currentQuestion.answers.map((answer) => (
                <label
                  key={answer.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 transition-colors ${
                    selectedAnswers[currentQuestion.id] === answer.id
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={answer.id}
                    checked={
                      selectedAnswers[currentQuestion.id] === answer.id
                    }
                    onChange={() =>
                      selectAnswer(currentQuestion.id, answer.id)
                    }
                    className="h-4 w-4 text-primary"
                  />
                  <span className="text-sm">{answer.text}</span>
                </label>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        {currentIndex < totalQuestions - 1 ? (
          <Button
            onClick={() => setCurrentIndex((prev) => prev + 1)}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCount < totalQuestions}
          >
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        )}
      </div>
    </div>
  );
}
