"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { createTutorQuiz } from "@/actions/tutor-quiz.actions";

type Learner = {
  id: string;
  name: string;
  email: string;
  courses: Array<{
    id: string;
    title: string;
    modules: Array<{ title: string; lessons: Array<{ id: string; title: string }> }>;
  }>;
};

type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
type AnswerDraft = { id: string; text: string; isCorrect: boolean };
type QuestionDraft = {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  explanation: string;
  answers: AnswerDraft[];
};

let draftCounter = 0;
const draftId = () => `draft-${++draftCounter}`;
const multipleChoiceAnswers = (): AnswerDraft[] => [
  { id: draftId(), text: "", isCorrect: true },
  { id: draftId(), text: "", isCorrect: false },
];
const newQuestion = (): QuestionDraft => ({
  id: draftId(),
  text: "",
  type: "MULTIPLE_CHOICE",
  points: 1,
  explanation: "",
  answers: multipleChoiceAnswers(),
});

export function TutorQuizForm({ learners }: { learners: Learner[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [studentId, setStudentId] = useState(learners[0]?.id ?? "");
  const learner = learners.find((item) => item.id === studentId);
  const [courseId, setCourseId] = useState(learner?.courses[0]?.id ?? "");
  const course = learner?.courses.find((item) => item.id === courseId);
  const lessons = course?.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ ...lesson, module: module.title }))) ?? [];
  const [questions, setQuestions] = useState<QuestionDraft[]>([newQuestion()]);
  const [message, setMessage] = useState<string | null>(null);

  function selectLearner(id: string) {
    setStudentId(id);
    const next = learners.find((item) => item.id === id);
    setCourseId(next?.courses[0]?.id ?? "");
  }

  function updateQuestion(id: string, patch: Partial<QuestionDraft>) {
    setQuestions((current) => current.map((question) => question.id === id ? { ...question, ...patch } : question));
  }

  function changeType(id: string, type: QuestionType) {
    const answers = type === "TRUE_FALSE"
      ? [
          { id: draftId(), text: "True", isCorrect: true },
          { id: draftId(), text: "False", isCorrect: false },
        ]
      : type === "SHORT_ANSWER"
        ? [{ id: draftId(), text: "", isCorrect: true }]
        : multipleChoiceAnswers();
    updateQuestion(id, { type, answers });
  }

  function updateAnswer(questionId: string, answerId: string, text: string) {
    setQuestions((current) => current.map((question) => question.id === questionId
      ? { ...question, answers: question.answers.map((answer) => answer.id === answerId ? { ...answer, text } : answer) }
      : question));
  }

  function chooseCorrect(questionId: string, answerId: string) {
    setQuestions((current) => current.map((question) => question.id === questionId
      ? { ...question, answers: question.answers.map((answer) => ({ ...answer, isCorrect: answer.id === answerId })) }
      : question));
  }

  function addAnswer(questionId: string) {
    setQuestions((current) => current.map((question) => question.id === questionId
      ? { ...question, answers: [...question.answers, { id: draftId(), text: "", isCorrect: false }] }
      : question));
  }

  function removeAnswer(questionId: string, answerId: string) {
    setQuestions((current) => current.map((question) => {
      if (question.id !== questionId || question.answers.length <= 2) return question;
      const answers = question.answers.filter((answer) => answer.id !== answerId);
      if (!answers.some((answer) => answer.isCorrect)) answers[0] = { ...answers[0], isCorrect: true };
      return { ...question, answers };
    }));
  }

  function submit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await createTutorQuiz({
        studentId,
        courseId,
        lessonId: String(formData.get("lessonId") ?? "") || null,
        title: String(formData.get("title") ?? ""),
        instructions: String(formData.get("instructions") ?? ""),
        dueAt: String(formData.get("dueAt") ?? "") || null,
        passingScore: Number(formData.get("passingScore") ?? 70),
        questions: questions.map((question) => ({
          text: question.text,
          type: question.type,
          points: question.points,
          explanation: question.explanation || null,
          answers: question.answers.map(({ text, isCorrect }) => ({ text, isCorrect })),
        })),
      });
      if (result.success && result.assignmentId) {
        router.push(`/tutor/teaching/assignments/${result.assignmentId}`);
        router.refresh();
      } else {
        setMessage(result.error ?? "Could not publish quiz");
      }
    });
  }

  return (
    <form action={submit} className="space-y-6">
      <section className="card-premium space-y-5 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">
            Learner
            <select value={studentId} onChange={(event) => selectLearner(event.target.value)} className="input-pretty w-full">
              {learners.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.email})</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Course
            <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="input-pretty w-full" required>
              {(learner?.courses ?? []).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </label>
        </div>
        <label className="block space-y-1.5 text-sm font-medium">
          Lesson (optional)
          <select key={courseId} name="lessonId" className="input-pretty w-full">
            <option value="">Course-level quiz</option>
            {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.module} — {lesson.title}</option>)}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm font-medium">
          Quiz title
          <input name="title" required maxLength={160} className="input-pretty w-full" placeholder="Science check-in" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium">
          Instructions
          <textarea name="instructions" required rows={4} maxLength={10000} className="input-pretty w-full p-3" placeholder="Explain the quiz goal and any preparation…" />
        </label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">
            Due date (optional)
            <input name="dueAt" type="datetime-local" className="input-pretty w-full" />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Passing score (%)
            <input name="passingScore" type="number" min={0} max={100} defaultValue={70} required className="input-pretty w-full" />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Questions ({questions.length})</h2>
            <p className="text-xs text-muted-foreground">Correct answers stay server-side until the learner submits.</p>
          </div>
          <button type="button" disabled={questions.length >= 20} onClick={() => setQuestions((current) => [...current, newQuestion()])} className="h-9 rounded-lg border border-input px-4 text-xs font-semibold disabled:opacity-50">
            Add question
          </button>
        </div>

        {questions.map((question, questionIndex) => (
          <article key={question.id} className="card-premium space-y-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold">Question {questionIndex + 1}</h3>
              <button type="button" disabled={questions.length === 1} onClick={() => setQuestions((current) => current.filter((item) => item.id !== question.id))} className="text-xs font-semibold text-red-600 disabled:opacity-40">
                Remove question
              </button>
            </div>
            <label className="block space-y-1.5 text-sm font-medium">
              Question text
              <textarea value={question.text} onChange={(event) => updateQuestion(question.id, { text: event.target.value })} required rows={3} maxLength={2000} className="input-pretty w-full p-3" />
            </label>
            <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
              <label className="space-y-1.5 text-sm font-medium">
                Question type
                <select value={question.type} onChange={(event) => changeType(question.id, event.target.value as QuestionType)} className="input-pretty w-full">
                  <option value="MULTIPLE_CHOICE">Multiple choice</option>
                  <option value="TRUE_FALSE">True / false</option>
                  <option value="SHORT_ANSWER">Short answer</option>
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Points
                <input type="number" min={1} max={100} value={question.points} onChange={(event) => updateQuestion(question.id, { points: Number(event.target.value) })} required className="input-pretty w-full" />
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">{question.type === "SHORT_ANSWER" ? "Accepted answer" : "Answers (select the correct one)"}</p>
              {question.answers.map((answer, answerIndex) => (
                <div key={answer.id} className="flex items-center gap-3">
                  {question.type !== "SHORT_ANSWER" && (
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      aria-label={`Question ${questionIndex + 1} answer ${answerIndex + 1} is correct`}
                      checked={answer.isCorrect}
                      onChange={() => chooseCorrect(question.id, answer.id)}
                    />
                  )}
                  <input
                    value={answer.text}
                    onChange={(event) => updateAnswer(question.id, answer.id, event.target.value)}
                    required
                    maxLength={500}
                    readOnly={question.type === "TRUE_FALSE"}
                    aria-label={`Question ${questionIndex + 1} answer ${answerIndex + 1}`}
                    className="input-pretty min-w-0 flex-1"
                    placeholder={question.type === "SHORT_ANSWER" ? "Exact accepted answer" : `Answer ${answerIndex + 1}`}
                  />
                  {question.type === "MULTIPLE_CHOICE" && (
                    <button type="button" disabled={question.answers.length <= 2} onClick={() => removeAnswer(question.id, answer.id)} className="text-xs font-semibold text-red-600 disabled:opacity-40">Remove</button>
                  )}
                </div>
              ))}
              {question.type === "MULTIPLE_CHOICE" && question.answers.length < 8 && (
                <button type="button" onClick={() => addAnswer(question.id)} className="text-xs font-semibold text-primary hover:underline">Add answer</button>
              )}
            </div>
            <label className="block space-y-1.5 text-sm font-medium">
              Explanation shown after submission (optional)
              <textarea value={question.explanation} onChange={(event) => updateQuestion(question.id, { explanation: event.target.value })} rows={2} maxLength={2000} className="input-pretty w-full p-3" />
            </label>
          </article>
        ))}
      </section>

      {(!courseId || learner?.courses.length === 0) && <p className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700">The learner has no authorized enrolled course.</p>}
      {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
      <button type="submit" disabled={pending || !courseId} className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        {pending ? "Publishing quiz…" : "Publish structured quiz"}
      </button>
    </form>
  );
}
