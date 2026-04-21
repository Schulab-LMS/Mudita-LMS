"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLesson, updateLesson, deleteLesson } from "@/actions/course-content.actions";
import { attachVideoAssetToLesson } from "@/actions/video.actions";
import { ImageUpload } from "@/components/ui/image-upload";
import { VideoUpload } from "@/components/admin/video-upload";

const LESSON_TYPES = [
  { value: "VIDEO", label: "Video" },
  { value: "TEXT", label: "Text / Article" },
  { value: "QUIZ", label: "Quiz" },
  { value: "INTERACTIVE", label: "Interactive" },
  { value: "ASSIGNMENT", label: "Assignment" },
];

interface LessonData {
  id: string;
  title: string;
  titleAr: string;
  titleDe: string;
  content: string;
  contentAr: string;
  contentDe: string;
  videoUrl: string;
  videoAssetId?: string | null;
  thumbnail?: string | null;
  duration: number;
  type: string;
  order: number;
  isFree: boolean;
}

interface Props {
  mode: "create" | "edit";
  courseId: string;
  moduleId: string;
  nextOrder?: number;
  initialData?: LessonData;
}

export function LessonForm({ mode, courseId, moduleId, nextOrder, initialData }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isFree, setIsFree] = useState(initialData?.isFree ?? false);
  const [lessonType, setLessonType] = useState(initialData?.type ?? "VIDEO");
  const [tab, setTab] = useState<"en" | "ar" | "de">("en");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(initialData?.thumbnail ?? null);
  const [videoAssetId, setVideoAssetId] = useState<string | null>(
    initialData?.videoAssetId ?? null
  );

  const isEdit = mode === "edit";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    const data = {
      title: fd.get("title") as string,
      titleAr: (fd.get("titleAr") as string) || undefined,
      titleDe: (fd.get("titleDe") as string) || undefined,
      content: (fd.get("content") as string) || undefined,
      contentAr: (fd.get("contentAr") as string) || undefined,
      contentDe: (fd.get("contentDe") as string) || undefined,
      videoUrl: (fd.get("videoUrl") as string) || undefined,
      thumbnail: thumbnailUrl,
      duration: Number(fd.get("duration")) || undefined,
      type: lessonType,
      isFree,
    };

    startTransition(async () => {
      let lessonIdForAsset: string | null = null;
      let result: { success: boolean; error?: string; lessonId?: string };
      if (isEdit && initialData) {
        result = await updateLesson({ lessonId: initialData.id, ...data, order: initialData.order });
        lessonIdForAsset = initialData.id;
      } else {
        result = await createLesson({ moduleId, ...data, order: nextOrder ?? 0 });
        lessonIdForAsset = result.lessonId ?? null;
      }
      if (!result.success) {
        setError(result.error ?? "Failed to save lesson");
        return;
      }

      // If the admin uploaded a managed video, attach it now. We do this in
      // a second call so the lesson exists first (createLesson returns its id).
      if (videoAssetId && lessonIdForAsset) {
        const attach = await attachVideoAssetToLesson({
          lessonId: lessonIdForAsset,
          assetId: videoAssetId,
        });
        if (!attach.success) {
          setError(attach.error);
          return;
        }
      }

      router.push(`/admin/courses/${courseId}`);
    });
  }

  function handleDelete() {
    if (!initialData || !confirm("Delete this lesson?")) return;
    startTransition(async () => {
      const result = await deleteLesson(initialData.id);
      if (result.success) {
        router.push(`/admin/courses/${courseId}`);
      } else {
        setError(result.error ?? "Failed to delete lesson");
      }
    });
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Lesson type + settings row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Type *</label>
            <select
              value={lessonType}
              onChange={(e) => setLessonType(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {LESSON_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Duration (seconds)</label>
            <input
              name="duration"
              type="number"
              min="0"
              defaultValue={initialData?.duration || ""}
              placeholder="1800"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm font-medium">Free preview</span>
            </label>
          </div>
        </div>

        {/* Lesson thumbnail */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Lesson Preview Image
          </label>
          <ImageUpload
            endpoint="lessonImage"
            value={thumbnailUrl}
            onUpload={setThumbnailUrl}
            onRemove={() => setThumbnailUrl(null)}
            label="Upload preview image"
            aspectRatio="video"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Optional: shown in lesson list and sidebar, up to 2 MB
          </p>
        </div>

        {/* Language tabs */}
        <div className="flex gap-1 border-b">
          {(["en", "ar", "de"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setTab(lang)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === lang
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang === "en" ? "English" : lang === "ar" ? "Arabic" : "German"}
            </button>
          ))}
        </div>

        {/* English */}
        <div className={tab === "en" ? "space-y-4" : "hidden"}>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title (English) *</label>
            <input
              name="title"
              required
              defaultValue={initialData?.title ?? ""}
              placeholder="Lesson title"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {(lessonType === "VIDEO" || lessonType === "INTERACTIVE") && (
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Video upload
                </label>
                <VideoUpload
                  initialAssetId={videoAssetId}
                  onAssetReady={setVideoAssetId}
                  onAssetCleared={() => setVideoAssetId(null)}
                  lessonId={initialData?.id}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Recommended for primary content — uploaded direct to the
                  video provider, played back signed.
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  External video URL
                </label>
                <input
                  name="videoUrl"
                  type="url"
                  defaultValue={initialData?.videoUrl ?? ""}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Optional fallback for embeds (YouTube, Vimeo). Ignored when
                  a managed upload is attached.
                </p>
              </div>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Content (English)</label>
            <textarea
              name="content"
              rows={8}
              defaultValue={initialData?.content ?? ""}
              placeholder="Lesson content... (supports HTML)"
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Arabic */}
        <div className={tab === "ar" ? "space-y-4" : "hidden"}>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title (Arabic)</label>
            <input
              name="titleAr"
              dir="rtl"
              defaultValue={initialData?.titleAr ?? ""}
              placeholder="عنوان الدرس"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Content (Arabic)</label>
            <textarea
              name="contentAr"
              rows={8}
              dir="rtl"
              defaultValue={initialData?.contentAr ?? ""}
              placeholder="محتوى الدرس..."
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* German */}
        <div className={tab === "de" ? "space-y-4" : "hidden"}>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title (German)</label>
            <input
              name="titleDe"
              defaultValue={initialData?.titleDe ?? ""}
              placeholder="Lektion Titel"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Content (German)</label>
            <textarea
              name="contentDe"
              rows={8}
              defaultValue={initialData?.contentDe ?? ""}
              placeholder="Lektion Inhalt..."
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Lesson"}
          </button>
          <a
            href={`/admin/courses/${courseId}`}
            className="inline-flex h-10 items-center rounded-lg border border-input px-6 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </a>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="ml-auto inline-flex h-10 items-center rounded-lg border border-red-200 px-4 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Delete Lesson
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
