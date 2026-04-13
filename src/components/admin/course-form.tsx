"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse, updateCourse } from "@/actions/admin.actions";
import { ImageUpload } from "@/components/ui/image-upload";

const AGE_GROUPS = [
  { value: "AGES_3_5", label: "Ages 3-5" },
  { value: "AGES_6_8", label: "Ages 6-8" },
  { value: "AGES_9_12", label: "Ages 9-12" },
  { value: "AGES_13_15", label: "Ages 13-15" },
  { value: "AGES_16_18", label: "Ages 16-18" },
];

const LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

const CATEGORIES = [
  "STEM",
  "Mathematics",
  "Science",
  "Technology",
  "Engineering",
  "Arts",
  "Language",
  "Other",
];

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "EGP", "SAR"];

export interface CourseFormData {
  id?: string;
  title: string;
  description: string;
  ageGroup: string;
  level: string;
  category: string;
  isFree: boolean;
  price: number;
  currency?: string;
  status?: string;
  thumbnail?: string | null;
}

interface CourseFormProps {
  mode: "create" | "edit";
  initialData?: CourseFormData;
}

export default function CourseForm({ mode, initialData }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFree, setIsFree] = useState(initialData?.isFree ?? false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(initialData?.thumbnail ?? null);

  const isEdit = mode === "edit";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const price = isFree ? 0 : Math.max(0, Number(fd.get("price")) || 0);

    const courseData = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      ageGroup: fd.get("ageGroup") as string,
      level: fd.get("level") as string,
      category: fd.get("category") as string,
      isFree,
      price,
      thumbnail: thumbnailUrl,
    };

    let result: { success: boolean; error?: string };

    if (isEdit && initialData?.id) {
      const status = fd.get("status") as string;
      result = await updateCourse(initialData.id, { ...courseData, status });
    } else {
      result = await createCourse(courseData);
    }

    setLoading(false);
    if (!result.success) {
      setError(result.error ?? `Failed to ${isEdit ? "update" : "create"} course`);
    } else {
      router.push("/admin/courses");
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Course Cover Image */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Course Cover Image
          </label>
          <ImageUpload
            endpoint="courseImage"
            value={thumbnailUrl}
            onUpload={setThumbnailUrl}
            onRemove={() => setThumbnailUrl(null)}
            label="Upload cover image"
            aspectRatio="video"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Recommended: 16:9 ratio, JPG or PNG, up to 4 MB
          </p>
        </div>

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            defaultValue={initialData?.title ?? ""}
            placeholder="Course title"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={4}
            defaultValue={initialData?.description ?? ""}
            placeholder="Describe what students will learn..."
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Age Group / Level / Category */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Age Group <span className="text-red-500">*</span>
            </label>
            <select
              name="ageGroup"
              required
              defaultValue={initialData?.ageGroup ?? ""}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select...</option>
              {AGE_GROUPS.map((ag) => (
                <option key={ag.value} value={ag.value}>{ag.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Level <span className="text-red-500">*</span>
            </label>
            <select
              name="level"
              required
              defaultValue={initialData?.level ?? ""}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select...</option>
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              required
              defaultValue={initialData?.category ?? ""}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status (edit mode only) */}
        {isEdit && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">Status</label>
            <select
              name="status"
              defaultValue={initialData?.status ?? "DRAFT"}
              className="flex h-10 w-full max-w-xs rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Free course toggle */}
        <div className="flex items-center gap-3">
          <input
            id="isFree"
            type="checkbox"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="isFree" className="text-sm font-medium">
            This course is free
          </label>
        </div>

        {/* Price and Currency */}
        {!isFree && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Price</label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={initialData?.price ?? ""}
                placeholder="29.99"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Currency</label>
              <select
                name="currency"
                defaultValue={initialData?.currency ?? "USD"}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {loading
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
                ? "Save Changes"
                : "Create Course"}
          </button>
          <a
            href="/admin/courses"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-input px-6 text-sm font-medium transition-colors hover:bg-muted"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
