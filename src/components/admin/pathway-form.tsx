"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPathway, updatePathway } from "@/actions/pathway.actions";
import { ImageUpload } from "@/components/ui/image-upload";
import { Link } from "@/i18n/navigation";
import { AGE_GROUPS } from "@/lib/constants";

const STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

export interface PathwayFormData {
  id?: string;
  title: string;
  description: string;
  ageGroup: string;
  order?: number;
  status?: string;
  thumbnail?: string | null;
}

interface PathwayFormProps {
  mode: "create" | "edit";
  initialData?: PathwayFormData;
}

const inputCls =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function PathwayForm({ mode, initialData }: PathwayFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(initialData?.thumbnail ?? null);

  const isEdit = mode === "edit";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const orderRaw = fd.get("order") as string;
    const data = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      ageGroup: fd.get("ageGroup") as string,
      order: orderRaw ? Number(orderRaw) : 0,
      thumbnail: thumbnailUrl,
    };

    let result: { success: boolean; error?: string };
    if (isEdit && initialData?.id) {
      const status = fd.get("status") as string;
      result = await updatePathway(initialData.id, { ...data, status });
    } else {
      result = await createPathway(data);
    }

    setLoading(false);
    if (!result.success) {
      setError(result.error ?? `Failed to ${isEdit ? "update" : "create"} pathway`);
    } else {
      router.push("/admin/pathways");
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Cover image</label>
          <ImageUpload
            endpoint="courseImage"
            value={thumbnailUrl}
            onUpload={setThumbnailUrl}
            onRemove={() => setThumbnailUrl(null)}
            label="Upload cover image"
            aspectRatio="video"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <input name="title" required defaultValue={initialData?.title ?? ""} placeholder="Pathway title" className={inputCls} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea name="description" required rows={3} defaultValue={initialData?.description ?? ""} placeholder="What this journey covers…" className={inputCls.replace("h-10 ", "")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Age group <span className="text-red-500">*</span>
            </label>
            <select name="ageGroup" required defaultValue={initialData?.ageGroup ?? ""} className={inputCls}>
              <option value="">Select...</option>
              {AGE_GROUPS.map((ag) => (
                <option key={ag.value} value={ag.value}>{ag.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Display order</label>
            <input name="order" type="number" min="0" defaultValue={initialData?.order ?? 0} className={inputCls} />
          </div>
        </div>

        {isEdit && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">Status</label>
            <select name="status" defaultValue={initialData?.status ?? "DRAFT"} className={`${inputCls} max-w-xs`}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60">
            {loading ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save changes" : "Create pathway"}
          </button>
          <Link href="/admin/pathways" className="inline-flex h-10 items-center justify-center rounded-lg border border-input px-6 text-sm font-medium transition-colors hover:bg-muted">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
