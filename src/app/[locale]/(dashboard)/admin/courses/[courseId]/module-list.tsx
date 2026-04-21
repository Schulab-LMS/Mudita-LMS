"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createModule, deleteModule } from "@/actions/course-content.actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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

const TYPE_ICONS: Record<string, string> = {
  VIDEO: "🎥",
  TEXT: "📄",
  QUIZ: "📝",
  INTERACTIVE: "🧪",
  ASSIGNMENT: "📋",
};

const KNOWN_LESSON_TYPES = new Set(Object.keys(TYPE_ICONS));

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("heading")}</h2>
        <button
          onClick={() => setShowAddModule(true)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          + {t("addModule")}
        </button>
      </div>

      {/* Add module form */}
      {showAddModule && (
        <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
          <input
            type="text"
            placeholder={t("moduleTitlePlaceholder")}
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
            autoFocus
            className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleAddModule}
            disabled={pending || !newModuleTitle.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {pending ? t("addingButton") : t("addButton")}
          </button>
          <button
            onClick={() => { setShowAddModule(false); setNewModuleTitle(""); }}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            {t("cancelButton")}
          </button>
        </div>
      )}

      {/* Module list */}
      {modules.length === 0 && !showAddModule ? (
        <div className="rounded-lg border bg-white p-8 text-center text-muted-foreground">
          {t("emptyMessage")}
        </div>
      ) : (
        modules.map((mod) => (
          <div key={mod.id} className="rounded-lg border bg-white">
            {/* Module header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {mod.order + 1}
                </span>
                <h3 className="font-semibold">{mod.title}</h3>
                <span className="text-xs text-muted-foreground">
                  {t("lessonCount", { count: mod.lessons.length })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href={`/admin/courses/${courseId}/modules/${mod.id}/edit`}
                  className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                >
                  {tCommon("edit")}
                </Link>
                <Link
                  href={`/admin/courses/${courseId}/modules/${mod.id}/lessons/new`}
                  className="rounded px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                >
                  + {t("addLesson")}
                </Link>
                <button
                  onClick={() => setConfirmModuleId(mod.id)}
                  disabled={pending && deletingId === mod.id}
                  className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === mod.id ? "..." : tCommon("delete")}
                </button>
              </div>
            </div>

            {/* Lesson list */}
            {mod.lessons.length === 0 ? (
              <div className="px-4 py-4 text-center text-sm text-muted-foreground">
                {t("noLessonsPrefix")}{" "}
                <Link
                  href={`/admin/courses/${courseId}/modules/${mod.id}/lessons/new`}
                  className="text-primary hover:underline"
                >
                  {t("addLessonLink")}
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {mod.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="text-base"
                        title={KNOWN_LESSON_TYPES.has(lesson.type) ? tTypes(lesson.type) : lesson.type}
                      >
                        {TYPE_ICONS[lesson.type] ?? "📄"}
                      </span>
                      <div>
                        <span className="text-sm font-medium">{lesson.title}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {KNOWN_LESSON_TYPES.has(lesson.type) ? tTypes(lesson.type) : lesson.type}
                          </span>
                          {lesson.duration && <span>&middot; {formatDuration(lesson.duration)}</span>}
                          {lesson.isFree && (
                            <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-800">
                              {tCommon("free")}
                            </span>
                          )}
                          {lesson.videoUrl && <span>&middot; {t("hasVideo")}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/courses/${courseId}/modules/${mod.id}/lessons/${lesson.id}/quiz`}
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          lesson.quiz
                            ? "text-orange-700 hover:bg-orange-50"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {lesson.quiz ? t("quizAttached") : `+ ${t("addQuiz")}`}
                      </Link>
                      <Link
                        href={`/admin/courses/${courseId}/modules/${mod.id}/lessons/${lesson.id}/edit`}
                        className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                      >
                        {tCommon("edit")}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
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
