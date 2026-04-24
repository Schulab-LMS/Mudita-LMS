"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createModule, deleteModule } from "@/actions/course-content.actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Video,
  FileText,
  ClipboardList,
  Cpu,
  ClipboardCheck,
  Pencil,
  Trash2,
  Plus,
  Layers,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  type: string;
  order: number;
  isFree: boolean;
  duration: number | null;
  videoUrl: string | null;
  quiz: { id: string } | null;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Props {
  courseId: string;
  modules: Module[];
}

const TYPE_ICON: Record<string, LucideIcon> = {
  VIDEO: Video,
  TEXT: FileText,
  QUIZ: ClipboardList,
  INTERACTIVE: Cpu,
  ASSIGNMENT: ClipboardCheck,
};

const TYPE_TONE: Record<string, string> = {
  VIDEO: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  TEXT: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  QUIZ: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  INTERACTIVE: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  ASSIGNMENT: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

const KNOWN_LESSON_TYPES = new Set(Object.keys(TYPE_ICON));

export function ModuleList({ courseId, modules }: Props) {
  const t = useTranslations("admin.modules");
  const tTypes = useTranslations("admin.modules.lessonTypes");
  const tCommon = useTranslations("admin.common");
  const tConfirm = useTranslations("admin.confirm.deleteModule");
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmModuleId, setConfirmModuleId] = useState<string | null>(null);

  function handleAddModule() {
    if (!newModuleTitle.trim()) return;
    startTransition(async () => {
      const result = await createModule({
        courseId,
        title: newModuleTitle.trim(),
        order: modules.length,
      });
      if (result.success) {
        setNewModuleTitle("");
        setShowAddModule(false);
      } else {
        alert(result.error ?? tCommon("genericError"));
      }
    });
  }

  function handleDeleteModule() {
    if (!confirmModuleId) return;
    const moduleId = confirmModuleId;
    setDeletingId(moduleId);
    startTransition(async () => {
      const result = await deleteModule(moduleId);
      if (!result.success) alert(result.error ?? tCommon("genericError"));
      setDeletingId(null);
      setConfirmModuleId(null);
    });
  }

  function formatDuration(seconds: number | null) {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    return t("durationMinutes", { m: mins });
  }

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {t("heading")}
          </h2>
          <span className="chip chip-neutral">
            {modules.length} {modules.length === 1 ? "module" : "modules"} ·{" "}
            {totalLessons} lesson{totalLessons === 1 ? "" : "s"}
          </span>
        </div>
        <button
          onClick={() => setShowAddModule(true)}
          className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-launch-gradient px-3 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          {t("addModule")}
        </button>
      </div>

      {/* Add-module form (inline) */}
      {showAddModule && (
        <div className="card-premium flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder={t("moduleTitlePlaceholder")}
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
            autoFocus
            className="input-pretty h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddModule}
              disabled={pending || !newModuleTitle.trim()}
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {pending ? t("addingButton") : t("addButton")}
            </button>
            <button
              onClick={() => {
                setShowAddModule(false);
                setNewModuleTitle("");
              }}
              className="inline-flex h-10 items-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {t("cancelButton")}
            </button>
          </div>
        </div>
      )}

      {/* Module list */}
      {modules.length === 0 && !showAddModule ? (
        <div className="card-premium flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Layers className="h-6 w-6" aria-hidden />
          </div>
          <p className="font-semibold text-foreground">No modules yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {t("emptyMessage")}
          </p>
          <button
            type="button"
            onClick={() => setShowAddModule(true)}
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-launch-gradient px-4 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            {t("addModule")}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((mod) => (
            <div key={mod.id} className="card-premium overflow-hidden">
              {/* Module header */}
              <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 px-5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {mod.order + 1}
                  </span>
                  <h3 className="truncate font-display font-semibold text-foreground">
                    {mod.title}
                  </h3>
                  <span className="chip chip-neutral">
                    {t("lessonCount", { count: mod.lessons.length })}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/admin/courses/${courseId}/modules/${mod.id}/lessons/new`}
                    className="inline-flex h-8 items-center gap-1 rounded-md bg-primary/10 px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
                  >
                    <Plus className="h-3 w-3" aria-hidden />
                    {t("addLesson")}
                  </Link>
                  <Link
                    href={`/admin/courses/${courseId}/modules/${mod.id}/edit`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title={tCommon("edit")}
                    aria-label={tCommon("edit")}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                  <button
                    onClick={() => setConfirmModuleId(mod.id)}
                    disabled={pending && deletingId === mod.id}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    title={tCommon("delete")}
                    aria-label={tCommon("delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>

              {/* Lesson list */}
              {mod.lessons.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                  {t("noLessonsPrefix")}{" "}
                  <Link
                    href={`/admin/courses/${courseId}/modules/${mod.id}/lessons/new`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {t("addLessonLink")}
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {mod.lessons.map((lesson) => {
                    const Icon = TYPE_ICON[lesson.type] ?? FileText;
                    const tone =
                      TYPE_TONE[lesson.type] ?? "bg-muted text-muted-foreground";
                    return (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}
                            title={
                              KNOWN_LESSON_TYPES.has(lesson.type)
                                ? tTypes(lesson.type)
                                : lesson.type
                            }
                          >
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {lesson.title}
                            </p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                              <span>
                                {KNOWN_LESSON_TYPES.has(lesson.type)
                                  ? tTypes(lesson.type)
                                  : lesson.type}
                              </span>
                              {lesson.duration && (
                                <>
                                  <span>·</span>
                                  <span>{formatDuration(lesson.duration)}</span>
                                </>
                              )}
                              {lesson.isFree && (
                                <span className="chip chip-success">
                                  {tCommon("free")}
                                </span>
                              )}
                              {lesson.videoUrl && (
                                <span className="inline-flex items-center gap-0.5">
                                  <CheckCircle2
                                    className="h-3 w-3 text-emerald-500"
                                    aria-hidden
                                  />
                                  {t("hasVideo")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Link
                            href={`/admin/courses/${courseId}/modules/${mod.id}/lessons/${lesson.id}/quiz`}
                            className={`inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-semibold transition-colors ${
                              lesson.quiz
                                ? "bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:text-amber-400"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            {lesson.quiz ? (
                              <>
                                <CheckCircle2
                                  className="h-3 w-3"
                                  aria-hidden
                                />
                                {t("quizAttached")}
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3" aria-hidden />
                                {t("addQuiz")}
                              </>
                            )}
                          </Link>
                          <Link
                            href={`/admin/courses/${courseId}/modules/${mod.id}/lessons/${lesson.id}/edit`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            title={tCommon("edit")}
                            aria-label={tCommon("edit")}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmModuleId !== null}
        title={tConfirm("title")}
        description={tConfirm("body")}
        confirmLabel={tConfirm("confirm")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleDeleteModule}
        onCancel={() => setConfirmModuleId(null)}
        variant="destructive"
        loading={pending}
      />
    </div>
  );
}
