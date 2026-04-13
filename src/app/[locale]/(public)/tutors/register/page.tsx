"use client";

import { useState } from "react";
import { submitTutorApplication } from "@/actions/tutor.actions";
import { Link } from "@/i18n/navigation";

export default function TutorRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const bio = fd.get("bio") as string;
    const hourlyRate = parseFloat(fd.get("hourlyRate") as string);
    const subjects = (fd.get("subjects") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const languages = (fd.get("languages") as string)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const headline = fd.get("headline") as string;

    const result = await submitTutorApplication({
      bio,
      hourlyRate,
      subjects,
      languages,
      headline,
    });

    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Failed to submit application");
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-5xl">🎉</p>
        <h2 className="mt-4 text-2xl font-bold">Application Submitted!</h2>
        <p className="mt-2 text-muted-foreground">
          Thank you for applying to be a tutor. Our team will review your application and
          notify you once you&apos;re verified.
        </p>
        <Link
          href="/tutor"
          className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Go to Tutor Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Become a Tutor</h1>
        <p className="mt-1 text-muted-foreground">
          Share your knowledge and help students grow. Fill in your details below.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Headline</label>
            <input
              name="headline"
              placeholder="e.g., Passionate STEM Educator with 5+ years experience"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Bio <span className="text-red-500">*</span>
            </label>
            <textarea
              name="bio"
              required
              rows={4}
              placeholder="Tell us about your background, qualifications, and teaching philosophy…"
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Hourly Rate (USD) <span className="text-red-500">*</span>
            </label>
            <input
              name="hourlyRate"
              type="number"
              min="1"
              step="0.01"
              required
              placeholder="50"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Subjects <span className="text-red-500">*</span>{" "}
              <span className="font-normal text-muted-foreground">(comma-separated)</span>
            </label>
            <input
              name="subjects"
              required
              placeholder="Mathematics, Physics, Chemistry"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Languages <span className="text-red-500">*</span>{" "}
              <span className="font-normal text-muted-foreground">(comma-separated)</span>
            </label>
            <input
              name="languages"
              required
              placeholder="English, Arabic"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
