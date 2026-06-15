"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import {
  answerLessonQuestion,
  askLessonQuestion,
  deleteLessonAnswer,
  deleteLessonQuestion,
} from "@/actions/lesson-engagement.actions";
import type { LessonQuestionView } from "@/services/lesson-engagement.service";

const STAFF_ROLES = new Set(["TUTOR", "ADMIN", "SUPER_ADMIN", "ORG_ADMIN"]);

function isStaffRole(role: string): boolean {
  return STAFF_ROLES.has(role);
}

type Translator = ReturnType<typeof useTranslations<"lesson.qa">>;

function timeAgo(date: Date, t: Translator, locale: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return t("justNow");
  if (mins < 60) return t("minutesAgo", { count: mins });
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return t("hoursAgo", { count: hrs });
  const days = Math.round(hrs / 24);
  if (days < 30) return t("daysAgo", { count: days });
  return new Date(date).toLocaleDateString(locale);
}

export function LessonQa({
  lessonId,
  questions,
  currentUserId,
  canAnswer,
  isAdmin,
  readOnly = false,
}: {
  lessonId: string;
  questions: LessonQuestionView[];
  currentUserId: string | null;
  canAnswer: boolean;
  isAdmin: boolean;
  readOnly?: boolean;
}) {
  const t = useTranslations("lesson.qa");
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onAsk() {
    setError(null);
    startTransition(async () => {
      const res = await askLessonQuestion({ lessonId, body });
      if (res.success) {
        setBody("");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Ask form */}
      {readOnly ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          {t("previewDisabled")}
        </p>
      ) : (
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" aria-hidden />
            {t("askLabel")}
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            disabled={pending}
            placeholder={t("askPlaceholder")}
            className="input-pretty w-full rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onAsk}
              disabled={pending || !body.trim()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" aria-hidden />
              {t("postQuestion")}
            </button>
            {error && (
              <span className="text-xs text-red-600 dark:text-red-400" role="status">
                {error}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Thread */}
      {questions.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-10 w-10" aria-hidden />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          size="sm"
        />
      ) : (
        <ul className="space-y-4">
          {questions.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              currentUserId={currentUserId}
              canAnswer={canAnswer}
              isAdmin={isAdmin}
              readOnly={readOnly}
              onChanged={() => router.refresh()}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function QuestionItem({
  question,
  currentUserId,
  canAnswer,
  isAdmin,
  readOnly,
  onChanged,
}: {
  question: LessonQuestionView;
  currentUserId: string | null;
  canAnswer: boolean;
  isAdmin: boolean;
  readOnly: boolean;
  onChanged: () => void;
}) {
  const t = useTranslations("lesson.qa");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const canDeleteQuestion =
    !readOnly && (isAdmin || question.author.id === currentUserId);

  function onAnswer() {
    setError(null);
    startTransition(async () => {
      const res = await answerLessonQuestion({ questionId: question.id, body: answer });
      if (res.success) {
        setAnswer("");
        onChanged();
      } else {
        setError(res.error);
      }
    });
  }

  function onDeleteQuestion() {
    startTransition(async () => {
      const res = await deleteLessonQuestion(question.id);
      if (res.success) onChanged();
      else setError(res.error);
    });
  }

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <Author
          name={question.author.name}
          avatar={question.author.avatar}
          role={question.author.role}
          when={question.createdAt}
        />
        {canDeleteQuestion && (
          <button
            type="button"
            onClick={onDeleteQuestion}
            disabled={pending}
            aria-label={t("deleteQuestion")}
            className="text-muted-foreground transition-colors hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{question.body}</p>

      {/* Answers */}
      {question.answers.length > 0 && (
        <ul className="mt-3 space-y-3 border-s-2 border-primary/20 ps-4">
          {question.answers.map((a) => (
            <li key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <Author
                  name={a.author.name}
                  avatar={a.author.avatar}
                  role={a.author.role}
                  when={a.createdAt}
                  staff
                />
                {!readOnly && (isAdmin || a.author.id === currentUserId) && (
                  <DeleteAnswerButton answerId={a.id} onChanged={onChanged} />
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{a.body}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Answer form (staff only) */}
      {canAnswer && !readOnly && (
        <div className="mt-3 space-y-2 border-s-2 border-primary/20 ps-4">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={2}
            disabled={pending}
            placeholder={t("answerPlaceholder")}
            className="input-pretty w-full rounded-lg border border-input bg-background p-2.5 text-sm focus-visible:outline-none"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onAnswer}
              disabled={pending || !answer.trim()}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-3 w-3" aria-hidden />
              {t("answer")}
            </button>
            {error && (
              <span className="text-xs text-red-600 dark:text-red-400" role="status">
                {error}
              </span>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function DeleteAnswerButton({
  answerId,
  onChanged,
}: {
  answerId: string;
  onChanged: () => void;
}) {
  const t = useTranslations("lesson.qa");
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          const res = await deleteLessonAnswer(answerId);
          if (res.success) onChanged();
        })
      }
      disabled={pending}
      aria-label={t("deleteAnswer")}
      className="text-muted-foreground transition-colors hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}

function Author({
  name,
  avatar,
  role,
  when,
  staff,
}: {
  name: string;
  avatar: string | null;
  role: string;
  when: Date;
  staff?: boolean;
}) {
  const t = useTranslations("lesson.qa");
  const locale = useLocale();
  const showStaff = staff || isStaffRole(role);
  return (
    <div className="flex items-center gap-2">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
      ) : (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="leading-tight">
        <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
          {name}
          {showStaff && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-primary">
              <ShieldCheck className="h-2.5 w-2.5" aria-hidden />
              {role === "TUTOR" ? t("tutorBadge") : t("staffBadge")}
            </span>
          )}
        </span>
        <span className="text-[11px] text-muted-foreground">{timeAgo(when, t, locale)}</span>
      </div>
    </div>
  );
}
