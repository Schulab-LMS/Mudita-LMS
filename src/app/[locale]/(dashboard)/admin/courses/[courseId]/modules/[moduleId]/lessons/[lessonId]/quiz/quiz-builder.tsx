"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/actions/quiz-admin.actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Answer {
  id?: string;
  text: string;
  textAr: string;
  textDe: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  textAr: string;
  textDe: string;
  type: string;
  points: number;
  order: number;
  explanation: string;
  answers: Answer[];
}

interface QuizData {
  id: string;
  title: string;
  passingScore: number;
  timeLimit: number | null;
  questions: Question[];
}

interface Props {
  lessonId: string;
  courseId: string;
  quiz: QuizData | null;
}

const QUESTION_TYPES = [
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "SHORT_ANSWER", label: "Short Answer" },
];

export function QuizBuilder({ lessonId, courseId, quiz: initialQuiz }: Props) {
  const tConfirmQuiz = useTranslations("admin.confirm.deleteQuiz");
  const tConfirmQuestion = useTranslations("admin.confirm.deleteQuestion");
  const tCommon = useTranslations("admin.common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [confirmDeleteQuizOpen, setConfirmDeleteQuizOpen] = useState(false);
  const [confirmDeleteQuestionId, setConfirmDeleteQuestionId] = useState<string | null>(null);

  // ── Create / Update / Delete Quiz ─────────────────────────────────────

  function handleCreateQuiz(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createQuiz({
        lessonId,
        title: fd.get("title") as string,
        passingScore: Number(fd.get("passingScore")) || 70,
        timeLimit: Number(fd.get("timeLimit")) || undefined,
      });
      if (result.success) {
        setMessage({ type: "success", text: "Quiz created" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error ?? "Failed" });
      }
    });
  }

  function handleUpdateQuiz(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!initialQuiz) return;
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateQuiz({
        quizId: initialQuiz.id,
        title: fd.get("title") as string,
        passingScore: Number(fd.get("passingScore")) || 70,
        timeLimit: Number(fd.get("timeLimit")) || undefined,
      });
      setMessage(result.success
        ? { type: "success", text: "Quiz settings saved" }
        : { type: "error", text: result.error ?? "Failed" }
      );
    });
  }

  function handleDeleteQuizConfirmed() {
    if (!initialQuiz) return;
    startTransition(async () => {
      const result = await deleteQuiz(initialQuiz.id);
      if (result.success) {
        setConfirmDeleteQuizOpen(false);
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error ?? tCommon("genericError") });
        setConfirmDeleteQuizOpen(false);
      }
    });
  }

  // ── Create / Update / Delete Question ─────────────────────────────────

  function handleSaveQuestion(e: React.FormEvent<HTMLFormElement>, existingId?: string) {
    e.preventDefault();
    if (!initialQuiz) return;
    const fd = new FormData(e.currentTarget);

    const answerCount = Number(fd.get("answerCount")) || 0;
    const answers: Answer[] = [];
    for (let i = 0; i < answerCount; i++) {
      answers.push({
        text: fd.get(`answer_${i}_text`) as string,
        textAr: (fd.get(`answer_${i}_textAr`) as string) || "",
        textDe: (fd.get(`answer_${i}_textDe`) as string) || "",
        isCorrect: fd.get(`answer_${i}_correct`) === "true",
      });
    }

    const questionData = {
      text: fd.get("text") as string,
      textAr: (fd.get("textAr") as string) || undefined,
      textDe: (fd.get("textDe") as string) || undefined,
      type: fd.get("type") as string,
      points: Number(fd.get("points")) || 1,
      explanation: (fd.get("explanation") as string) || undefined,
      answers: answers.filter((a) => a.text.trim()),
    };

    startTransition(async () => {
      let result;
      if (existingId) {
        result = await updateQuestion({ questionId: existingId, ...questionData });
      } else {
        result = await createQuestion({
          quizId: initialQuiz.id,
          order: initialQuiz.questions.length,
          ...questionData,
        });
      }
      if (result.success) {
        setEditingQuestion(null);
        setShowNewQuestion(false);
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error ?? "Failed" });
      }
    });
  }

  function handleDeleteQuestionConfirmed() {
    if (!confirmDeleteQuestionId) return;
    const questionId = confirmDeleteQuestionId;
    startTransition(async () => {
      const result = await deleteQuestion(questionId);
      setConfirmDeleteQuestionId(null);
      if (result.success) router.refresh();
      else setMessage({ type: "error", text: result.error ?? tCommon("genericError") });
    });
  }

  // ── No quiz yet → create form ─────────────────────────────────────────

  if (!initialQuiz) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Create Quiz</h2>
        <form onSubmit={handleCreateQuiz} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Quiz Title *</label>
            <input name="title" required placeholder="e.g. Module 1 Assessment"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Passing Score (%)</label>
              <input name="passingScore" type="number" min="0" max="100" defaultValue="70"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Time Limit (minutes, 0 = no limit)</label>
              <input name="timeLimit" type="number" min="0" defaultValue="0"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>
          {message && <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>{message.text}</p>}
          <button type="submit" disabled={pending}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {pending ? "Creating..." : "Create Quiz"}
          </button>
        </form>
      </div>
    );
  }

  // ── Quiz exists → settings + questions ────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Quiz settings */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Quiz Settings</h2>
        <form onSubmit={handleUpdateQuiz} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title</label>
            <input name="title" required defaultValue={initialQuiz.title}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Passing Score (%)</label>
              <input name="passingScore" type="number" min="0" max="100" defaultValue={initialQuiz.passingScore}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Time Limit (minutes)</label>
              <input name="timeLimit" type="number" min="0" defaultValue={initialQuiz.timeLimit ?? 0}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>
          {message && <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>{message.text}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={pending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
              {pending ? "Saving..." : "Save Settings"}
            </button>
            <button type="button" onClick={() => setConfirmDeleteQuizOpen(true)} disabled={pending}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
              {tConfirmQuiz("confirm")}
            </button>
          </div>
        </form>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Questions ({initialQuiz.questions.length})
          </h2>
          <button
            onClick={() => { setShowNewQuestion(true); setEditingQuestion(null); }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            + Add Question
          </button>
        </div>

        {/* Existing questions */}
        {initialQuiz.questions.map((q, qi) => (
          <div key={q.id} className="rounded-xl border bg-white">
            {editingQuestion === q.id ? (
              <div className="p-4">
                <QuestionForm
                  question={q}
                  onSubmit={(e) => handleSaveQuestion(e, q.id)}
                  onCancel={() => setEditingQuestion(null)}
                  pending={pending}
                />
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {qi + 1}
                      </span>
                      <span className="text-sm font-medium">{q.text}</span>
                    </div>
                    <div className="ml-8 mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{q.type.replace("_", " ")}</span>
                      <span>&middot; {q.points} pt{q.points !== 1 ? "s" : ""}</span>
                      <span>&middot; {q.answers.length} answers</span>
                    </div>
                    {/* Show answers */}
                    <div className="ml-8 mt-2 space-y-1">
                      {q.answers.map((a) => (
                        <div key={a.id} className={`flex items-center gap-2 text-sm ${a.isCorrect ? "text-green-700 font-medium" : "text-muted-foreground"}`}>
                          <span>{a.isCorrect ? "✓" : "○"}</span>
                          <span>{a.text}</span>
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="ml-8 mt-2 text-xs text-blue-600">Explanation: {q.explanation}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingQuestion(q.id); setShowNewQuestion(false); }}
                      className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10">
                      Edit
                    </button>
                    <button onClick={() => setConfirmDeleteQuestionId(q.id)} disabled={pending}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                      {tCommon("delete")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* New question form */}
        {showNewQuestion && (
          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-3 font-semibold">New Question</h3>
            <QuestionForm
              onSubmit={(e) => handleSaveQuestion(e)}
              onCancel={() => setShowNewQuestion(false)}
              pending={pending}
            />
          </div>
        )}

        {initialQuiz.questions.length === 0 && !showNewQuestion && (
          <div className="rounded-lg border bg-white p-8 text-center text-muted-foreground">
            No questions yet. Add your first question.
          </div>
        )}
      </div>

      {/* Back link */}
      <a href={`/admin/courses/${courseId}`}
        className="inline-flex items-center text-sm text-primary hover:underline">
        ← Back to course
      </a>

      <ConfirmDialog
        open={confirmDeleteQuizOpen}
        title={tConfirmQuiz("title")}
        description={tConfirmQuiz("body")}
        confirmLabel={tConfirmQuiz("confirm")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleDeleteQuizConfirmed}
        onCancel={() => setConfirmDeleteQuizOpen(false)}
        variant="destructive"
        loading={pending}
      />
      <ConfirmDialog
        open={confirmDeleteQuestionId !== null}
        title={tConfirmQuestion("title")}
        description={tConfirmQuestion("body")}
        confirmLabel={tConfirmQuestion("confirm")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleDeleteQuestionConfirmed}
        onCancel={() => setConfirmDeleteQuestionId(null)}
        variant="destructive"
        loading={pending}
      />
    </div>
  );
}

// ── Reusable Question Form ──────────────────────────────────────────────

function QuestionForm({
  question,
  onSubmit,
  onCancel,
  pending,
}: {
  question?: Question;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const [type, setType] = useState(question?.type ?? "MULTIPLE_CHOICE");
  const [answers, setAnswers] = useState<Answer[]>(
    question?.answers ?? [
      { text: "", textAr: "", textDe: "", isCorrect: true },
      { text: "", textAr: "", textDe: "", isCorrect: false },
    ]
  );

  function addAnswer() {
    setAnswers([...answers, { text: "", textAr: "", textDe: "", isCorrect: false }]);
  }

  function removeAnswer(index: number) {
    if (answers.length <= 1) return;
    setAnswers(answers.filter((_, i) => i !== index));
  }

  function toggleCorrect(index: number) {
    if (type === "TRUE_FALSE" || type === "MULTIPLE_CHOICE") {
      // Single correct for these types
      setAnswers(answers.map((a, i) => ({ ...a, isCorrect: i === index })));
    } else {
      setAnswers(answers.map((a, i) => i === index ? { ...a, isCorrect: !a.isCorrect } : a));
    }
  }

  function updateAnswerText(index: number, text: string) {
    setAnswers(answers.map((a, i) => i === index ? { ...a, text } : a));
  }

  // Auto-set True/False answers
  function handleTypeChange(newType: string) {
    setType(newType);
    if (newType === "TRUE_FALSE") {
      setAnswers([
        { text: "True", textAr: "صحيح", textDe: "Richtig", isCorrect: true },
        { text: "False", textAr: "خطأ", textDe: "Falsch", isCorrect: false },
      ]);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="answerCount" value={answers.length} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium">Question Text *</label>
          <input name="text" required defaultValue={question?.text ?? ""}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Type</label>
          <select name="type" value={type} onChange={(e) => handleTypeChange(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Points</label>
          <input name="points" type="number" min="1" defaultValue={question?.points ?? 1}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Explanation (shown after answering)</label>
          <input name="explanation" defaultValue={question?.explanation ?? ""}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
      </div>

      {/* Hidden multilingual fields */}
      <input type="hidden" name="textAr" defaultValue={question?.textAr ?? ""} />
      <input type="hidden" name="textDe" defaultValue={question?.textDe ?? ""} />

      {/* Answers */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">Answers</label>
          {type !== "TRUE_FALSE" && (
            <button type="button" onClick={addAnswer}
              className="text-xs font-medium text-primary hover:underline">
              + Add Answer
            </button>
          )}
        </div>
        <div className="space-y-2">
          {answers.map((answer, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="hidden" name={`answer_${i}_textAr`} value={answer.textAr} />
              <input type="hidden" name={`answer_${i}_textDe`} value={answer.textDe} />
              <input type="hidden" name={`answer_${i}_correct`} value={String(answer.isCorrect)} />

              <button type="button" onClick={() => toggleCorrect(i)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                  answer.isCorrect
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-300 text-transparent hover:border-green-300"
                }`}>
                ✓
              </button>
              <input
                type="text"
                value={answer.text}
                onChange={(e) => updateAnswerText(i, e.target.value)}
                name={`answer_${i}_text`}
                placeholder={`Answer ${i + 1}`}
                disabled={type === "TRUE_FALSE"}
                className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-60"
              />
              {type !== "TRUE_FALSE" && answers.length > 1 && (
                <button type="button" onClick={() => removeAnswer(i)}
                  className="text-xs text-red-500 hover:text-red-700">
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Click the circle to mark the correct answer.
        </p>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
          {pending ? "Saving..." : question ? "Update Question" : "Add Question"}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
          Cancel
        </button>
      </div>
    </form>
  );
}
