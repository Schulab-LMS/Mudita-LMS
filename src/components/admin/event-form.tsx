"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/actions/event.actions";
import { Link } from "@/i18n/navigation";
import { AGE_GROUPS } from "@/lib/constants";

const LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const REGIONS = [
  { value: "GLOBAL", label: "Global" },
  { value: "EUROPE", label: "Europe" },
  { value: "GERMANY", label: "Germany" },
  { value: "US", label: "US" },
  { value: "UK", label: "UK" },
];

const LISTING_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "OPTIONAL", label: "Optional" },
  { value: "ARCHIVED", label: "Archived" },
];

const inputCls =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const selectCls =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export interface EventFormData {
  id?: string;
  name: string;
  description: string;
  officialProvider: string;
  officialUrl: string;
  eventType: string;
  category: string;
  region: string;
  tracks: string[];
  ageGroup: string;
  ageMin: number;
  ageMax: number;
  levelMin: string;
  levelMax: string;
  seasonMonths: number[];
  listingStatus: string;
  preparationPathId?: string | null;
}

interface EventFormProps {
  mode: "create" | "edit";
  initialData?: EventFormData;
  pathways: { id: string; title: string }[];
}

function parseList(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseMonths(raw: string): number[] {
  return parseList(raw)
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 12);
}

export default function EventForm({ mode, initialData, pathways }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = mode === "edit";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const pathId = (fd.get("preparationPathId") as string) || null;
    const data = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      officialProvider: fd.get("officialProvider") as string,
      officialUrl: fd.get("officialUrl") as string,
      eventType: fd.get("eventType") as string,
      category: fd.get("category") as string,
      region: fd.get("region") as string,
      tracks: parseList(fd.get("tracks") as string),
      ageGroup: fd.get("ageGroup") as string,
      ageMin: Number(fd.get("ageMin")) || 0,
      ageMax: Number(fd.get("ageMax")) || 0,
      levelMin: fd.get("levelMin") as string,
      levelMax: fd.get("levelMax") as string,
      seasonMonths: parseMonths(fd.get("seasonMonths") as string),
      listingStatus: fd.get("listingStatus") as string,
      preparationPathId: pathId,
    };

    const result =
      isEdit && initialData?.id ? await updateEvent(initialData.id, data) : await createEvent(data);

    setLoading(false);
    if (!result.success) {
      setError(result.error ?? `Failed to ${isEdit ? "update" : "create"} event`);
    } else {
      router.push("/admin/events");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Name" required>
        <input name="name" required defaultValue={initialData?.name ?? ""} className={inputCls} placeholder="FIRST LEGO League" />
      </Field>

      <Field label="Description" required>
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={initialData?.description ?? ""}
          className={inputCls + " h-auto"}
          placeholder="What the event is and why it matters…"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Official provider" required>
          <input name="officialProvider" required defaultValue={initialData?.officialProvider ?? ""} className={inputCls} placeholder="FIRST" />
        </Field>
        <Field label="Official URL" required>
          <input name="officialUrl" type="url" required defaultValue={initialData?.officialUrl ?? ""} className={inputCls} placeholder="https://…" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Event type" required>
          <input name="eventType" required defaultValue={initialData?.eventType ?? ""} className={inputCls} placeholder="Robotics / STEM Challenge" />
        </Field>
        <Field label="Category" required>
          <input name="category" required defaultValue={initialData?.category ?? ""} className={inputCls} placeholder="ROBOTICS" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Region" required>
          <select name="region" defaultValue={initialData?.region ?? "GLOBAL"} className={selectCls}>
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Listing status" required>
          <select name="listingStatus" defaultValue={initialData?.listingStatus ?? "ACTIVE"} className={selectCls}>
            {LISTING_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Representative age band" required>
        <select name="ageGroup" required defaultValue={initialData?.ageGroup ?? ""} className={selectCls}>
          <option value="">Select…</option>
          {AGE_GROUPS.map((ag) => (
            <option key={ag.value} value={ag.value}>{ag.label}</option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Minimum age" required>
          <input name="ageMin" type="number" min={0} max={99} required defaultValue={initialData?.ageMin ?? ""} className={inputCls} placeholder="8" />
        </Field>
        <Field label="Maximum age" required>
          <input name="ageMax" type="number" min={0} max={99} required defaultValue={initialData?.ageMax ?? ""} className={inputCls} placeholder="16" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Minimum level" required>
          <select name="levelMin" defaultValue={initialData?.levelMin ?? "BEGINNER"} className={selectCls}>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Maximum level" required>
          <select name="levelMax" defaultValue={initialData?.levelMax ?? "ADVANCED"} className={selectCls}>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Tracks (comma-separated)">
        <input name="tracks" defaultValue={initialData?.tracks?.join(", ") ?? ""} className={inputCls} placeholder="Robotics, Coding, Teamwork" />
      </Field>

      <Field label="Season months (comma-separated, 1–12)">
        <input name="seasonMonths" defaultValue={initialData?.seasonMonths?.join(", ") ?? ""} className={inputCls} placeholder="8, 9, 10, 11, 12" />
      </Field>

      <Field label="Preparation pathway">
        <select name="preparationPathId" defaultValue={initialData?.preparationPathId ?? ""} className={selectCls}>
          <option value="">None</option>
          {pathways.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save changes" : "Create event"}
        </button>
        <Link
          href="/admin/events"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-input px-6 text-sm font-medium transition-colors hover:bg-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
