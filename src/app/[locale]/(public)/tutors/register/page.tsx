"use client";

import { useState } from "react";
import { submitTutorApplication } from "@/actions/tutor.actions";
import { Link } from "@/i18n/navigation";
import {
  Sparkles,
  DollarSign,
  Calendar,
  Users,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";

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

  // ── Success state ───────────────────────────────────────────────
  if (success) {
    return (
      <div className="relative overflow-hidden bg-launch-gradient-soft">
        <div className="aurora-bg opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-xl px-4 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden />
          </div>
          <h2 className="mt-5 font-display text-3xl font-extrabold text-foreground">
            Application submitted!
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Thank you for applying to be a tutor. Our team reviews applications
            within 48 hours and will email you once you&apos;re verified.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/tutor"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-launch-gradient px-5 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
            >
              Go to tutor dashboard
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
            <Link
              href="/tutors"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-input bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Browse public tutors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-launch-gradient-soft py-14 sm:py-16">
        <div className="aurora-bg opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden />
            <span className="text-launch-gradient">Teach with Schulab</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Become a tutor
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Share what you know, earn flexibly, and help students grow.
            Applications reviewed within 48 hours.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
          {/* Form */}
          <div className="card-premium p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-foreground">
              Your application
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill in the basics — you can update everything later from your
              profile.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Field
                label="Headline"
                name="headline"
                placeholder="e.g., Passionate STEM educator with 5+ years experience"
              />

              <FieldArea
                label="Bio"
                name="bio"
                required
                rows={4}
                placeholder="Tell us about your background, qualifications, and teaching philosophy…"
                hint="A strong bio helps you attract more students — 2-3 sentences is plenty."
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  label="Hourly rate (USD)"
                  name="hourlyRate"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  placeholder="50"
                  leading={<DollarSign className="h-4 w-4" />}
                />
                <Field
                  label="Languages"
                  name="languages"
                  required
                  placeholder="English, Arabic"
                  hint="Comma-separated"
                />
              </div>

              <Field
                label="Subjects"
                name="subjects"
                required
                placeholder="Mathematics, Physics, Chemistry"
                hint="Comma-separated — add up to 5 specialties"
              />

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden
                  />
                  <p>{error}</p>
                </div>
              )}

              <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-between">
                <Link
                  href="/tutors"
                  className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft
                    className="h-3.5 w-3.5 rtl:rotate-180"
                    aria-hidden
                  />
                  Back to tutors
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-launch-gradient px-6 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60 sm:w-auto"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <>
                      Submit application
                      <ArrowRight
                        className="h-4 w-4 rtl:rotate-180"
                        aria-hidden
                      />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Side panel: benefits */}
          <aside className="space-y-4">
            <div className="card-premium p-5">
              <h3 className="font-display text-sm font-bold text-foreground">
                Why teach with Schulab
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                <Benefit
                  icon={<DollarSign className="h-4 w-4" />}
                  title="Set your own rate"
                  description="You keep 80% of every booking. No caps."
                  tone="primary"
                />
                <Benefit
                  icon={<Calendar className="h-4 w-4" />}
                  title="Flexible hours"
                  description="Teach when you want. Students book your published slots."
                  tone="secondary"
                />
                <Benefit
                  icon={<Users className="h-4 w-4" />}
                  title="Students who care"
                  description="Families pay for quality. Expect engaged, prepared learners."
                  tone="accent"
                />
                <Benefit
                  icon={<Award className="h-4 w-4" />}
                  title="Verified profile"
                  description="Verified tutors get 3× more bookings."
                  tone="success"
                />
              </ul>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-launch-gradient-soft p-4">
              <div className="flex items-start gap-2.5 text-sm">
                <Sparkles
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden
                />
                <div>
                  <p className="font-semibold text-foreground">
                    Join 1,200+ tutors
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Already earning an average of $X/month teaching STEM on
                    Schulab.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
  hint,
  type = "text",
  min,
  step,
  leading,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  type?: string;
  min?: string;
  step?: string;
  leading?: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leading}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          min={min}
          step={step}
          placeholder={placeholder}
          required={required}
          className={`input-pretty flex h-10 w-full rounded-lg border border-input bg-background ${leading ? "ps-9" : "px-3"} pe-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none`}
        />
      </div>
      {hint && (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function FieldArea({
  label,
  name,
  placeholder,
  required,
  rows,
  hint,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows ?? 4}
        placeholder={placeholder}
        required={required}
        className="input-pretty flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
      />
      {hint && (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function Benefit({
  icon,
  title,
  description,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: "primary" | "secondary" | "accent" | "success";
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };
  return (
    <li className="flex items-start gap-2.5">
      <span
        className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </li>
  );
}
