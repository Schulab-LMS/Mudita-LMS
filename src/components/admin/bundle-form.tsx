"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBundle, updateBundle } from "@/actions/bundle.actions";
import { ImageUpload } from "@/components/ui/image-upload";
import { Link } from "@/i18n/navigation";
import { AGE_GROUPS } from "@/lib/constants";

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

const REQUIRED_PLANS = [
  { value: "", label: "None (free or one-time)" },
  { value: "LEARNER", label: "Learner & up" },
  { value: "PRO", label: "Pro & up" },
  { value: "LIFETIME", label: "Lifetime only" },
];

export interface BundleFormData {
  id?: string;
  title: string;
  description: string;
  themeCategory: string;
  ageGroup: string;
  level: string;
  requiredPlan?: string | null;
  finalProjectTitle?: string | null;
  finalProjectDescription?: string | null;
  recommendedDurationWeeks?: number | null;
  status?: string;
  thumbnail?: string | null;
}

interface BundleFormProps {
  mode: "create" | "edit";
  initialData?: BundleFormData;
}

const inputCls =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function BundleForm({ mode, initialData }: BundleFormProps) {
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
    const requiredPlanRaw = fd.get("requiredPlan") as string;
    const weeksRaw = fd.get("recommendedDurationWeeks") as string;

    const data = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      themeCategory: fd.get("themeCategory") as string,
      ageGroup: fd.get("ageGroup") as string,
      level: fd.get("level") as string,
      requiredPlan: requiredPlanRaw ? requiredPlanRaw : null,
      finalProjectTitle: (fd.get("finalProjectTitle") as string) || null,
      finalProjectDescription: (fd.get("finalProjectDescription") as string) || null,
      recommendedDurationWeeks: weeksRaw ? Number(weeksRaw) : null,
      thumbnail: thumbnailUrl,
    };

    let result: { success: boolean; error?: string };
    if (isEdit && initialData?.id) {
      const status = fd.get("status") as string;
      result = await updateBundle(initialData.id, { ...data, status });
    } else {
      result = await createBundle(data);
    }

    setLoading(false);
    if (!result.success) {
      setError(result.error ?? `Failed to ${isEdit ? "update" : "create"} bundle`);
    } else {
      router.push("/admin/bundles");
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
          <input name="title" required defaultValue={initialData?.title ?? ""} placeholder="Bundle title" className={inputCls} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea name="description" required rows={3} defaultValue={initialData?.description ?? ""} placeholder="What this bundle covers…" className={inputCls.replace("h-10 ", "")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Theme category <span className="text-red-500">*</span>
            </label>
            <input name="themeCategory" required defaultValue={initialData?.themeCategory ?? ""} placeholder="CODING, AI…" className={inputCls} />
          </div>
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
            <label className="mb-1.5 block text-sm font-medium">
              Level <span className="text-red-500">*</span>
            </label>
            <select name="level" required defaultValue={initialData?.level ?? ""} className={inputCls}>
              <option value="">Select...</option>
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Minimum plan tier</label>
            <select name="requiredPlan" defaultValue={initialData?.requiredPlan ?? ""} className={inputCls}>
              {REQUIRED_PLANS.map((p) => (
                <option key={p.value || "none"} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Recommended duration (weeks)</label>
            <input name="recommendedDurationWeeks" type="number" min="0" defaultValue={initialData?.recommendedDurationWeeks ?? ""} placeholder="8" className={inputCls} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Final project title</label>
          <input name="finalProjectTitle" defaultValue={initialData?.finalProjectTitle ?? ""} placeholder="Capstone shown at the end of the bundle" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Final project description</label>
          <textarea name="finalProjectDescription" rows={2} defaultValue={initialData?.finalProjectDescription ?? ""} className={inputCls.replace("h-10 ", "")} />
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
            {loading ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save changes" : "Create bundle"}
          </button>
          <Link href="/admin/bundles" className="inline-flex h-10 items-center justify-center rounded-lg border border-input px-6 text-sm font-medium transition-colors hover:bg-muted">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
