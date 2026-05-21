"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Check,
  Sparkles,
  Target,
  BookOpen,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Rocket,
  CalendarClock,
} from "lucide-react";
import {
  finishOnboarding,
  saveOnboardingStep,
  saveOnboardingAvailability,
} from "@/actions/onboarding.actions";
import { CategoryIcon } from "@/components/illustrations/category-icons";

const GOAL_KEYS = [
  "getAhead",
  "exploreCoding",
  "buildProjects",
  "prepareExams",
  "haveFun",
] as const;

const SUBJECT_KEYS = [
  "math",
  "coding",
  "robotics",
  "science",
  "engineering",
  "ai",
  "artDesign",
] as const;

// Map subject keys to CategoryIcon variants so every tile has a visual
// instead of being text-only.
const SUBJECT_ICONS: Record<string, string> = {
  math: "math",
  coding: "code",
  robotics: "robot",
  science: "science",
  engineering: "engineering",
  ai: "code",
  artDesign: "art",
};

const EXPERIENCE_KEYS = ["beginner", "some", "advanced"] as const;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all " +
        (active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-background hover:border-foreground/20 hover:bg-muted")
      }
    >
      {active && <Check className="h-3.5 w-3.5" aria-hidden />}
      {children}
    </button>
  );
}

function SubjectTile({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "group relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all " +
        (active
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-background hover:border-foreground/20 hover:bg-muted")
      }
    >
      <div
        className={
          "inline-flex h-12 w-12 items-center justify-center rounded-lg transition-all " +
          (active ? "bg-primary/10" : "bg-muted")
        }
      >
        <CategoryIcon category={icon} size={32} />
      </div>
      <span
        className={
          "text-xs font-medium " +
          (active ? "text-primary" : "text-foreground")
        }
      >
        {label}
      </span>
      {active && (
        <span className="absolute top-2 end-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" aria-hidden />
        </span>
      )}
    </button>
  );
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export default function OnboardingWizardPage() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [goals, setGoals] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>("");
  const [availableHours, setAvailableHours] = useState<string>("");
  const [availDays, setAvailDays] = useState<number[]>([]);
  const [availStart, setAvailStart] = useState<string>("16:00");
  const [availEnd, setAvailEnd] = useState<string>("18:00");
  const [timezone] = useState<string>(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );

  const steps = [
    {
      title: t("steps.goalsTitle"),
      description: t("steps.goalsDescription"),
      icon: Target,
      accent: "text-primary",
      accentBg: "bg-primary/10",
    },
    {
      title: t("steps.subjectsTitle"),
      description: t("steps.subjectsDescription"),
      icon: BookOpen,
      accent: "text-secondary",
      accentBg: "bg-secondary/10",
    },
    {
      title: t("steps.experienceTitle"),
      description: t("steps.experienceDescription"),
      icon: GraduationCap,
      accent: "text-accent",
      accentBg: "bg-accent/10",
    },
    {
      title: t("steps.availabilityTitle"),
      description: t("steps.availabilityDescription"),
      icon: CalendarClock,
      accent: "text-primary",
      accentBg: "bg-primary/10",
    },
  ];

  const StepIcon = steps[step].icon;

  // Derive whether current step has enough input to advance.
  const canAdvance = (() => {
    if (loading) return false;
    if (step === 0) return goals.length > 0;
    if (step === 1) return subjects.length > 0;
    return true; // experience + availability steps are optional
  })();

  async function advance() {
    setError(null);
    setLoading(true);
    try {
      if (step === 0) {
        const res = await saveOnboardingStep({ goals });
        if (!res.success) throw new Error(res.error);
      } else if (step === 1) {
        const res = await saveOnboardingStep({
          preferredSubjects: subjects,
        });
        if (!res.success) throw new Error(res.error);
      } else if (step === 2) {
        const hours = availableHours ? Number(availableHours) : undefined;
        const res = await saveOnboardingStep({
          experience: experience || undefined,
          availableHours: Number.isFinite(hours) ? hours : undefined,
        });
        if (!res.success) throw new Error(res.error);
      } else {
        // Final step: persist availability slots, then complete onboarding.
        const slots =
          availEnd > availStart
            ? availDays.map((dayOfWeek) => ({
                dayOfWeek,
                startTime: availStart,
                endTime: availEnd,
                timezone,
              }))
            : [];
        const saved = await saveOnboardingAvailability({ slots });
        if (!saved.success) throw new Error(saved.error);
        const done = await finishOnboarding();
        if (!done.success) throw new Error(done.error);
        router.push("/student");
        return;
      }
      setStep((s) => s + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-8">
      {/* Decorative background */}
      <div className="aurora-bg opacity-30" aria-hidden />

      <div className="relative w-full animate-slide-up">
        {/* Eyebrow */}
        <div className="mb-6 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <Rocket className="h-3 w-3" aria-hidden />
            Personalize your learning path
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            Step {step + 1} of {steps.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-8 flex gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex-1">
              <div
                className={
                  "h-1.5 rounded-full transition-all " +
                  (i <= step
                    ? "bg-launch-gradient-horizontal"
                    : "bg-muted")
                }
              />
              <p
                className={
                  "mt-1.5 truncate text-[10px] font-semibold uppercase tracking-wide " +
                  (i === step
                    ? "text-foreground"
                    : i < step
                      ? "text-primary"
                      : "text-muted-foreground/60")
                }
              >
                {s.title}
              </p>
            </div>
          ))}
        </div>

        {/* Step card */}
        <div className="card-premium p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span
              className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${steps[step].accentBg} ${steps[step].accent}`}
            >
              <StepIcon className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {steps[step].title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {steps[step].description}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {step === 0 && (
              <div className="flex flex-wrap gap-2">
                {GOAL_KEYS.map((key) => (
                  <Pill
                    key={key}
                    active={goals.includes(key)}
                    onClick={() => setGoals((prev) => toggle(prev, key))}
                  >
                    {t(`goals.${key}`)}
                  </Pill>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {SUBJECT_KEYS.map((key) => (
                  <SubjectTile
                    key={key}
                    active={subjects.includes(key)}
                    onClick={() =>
                      setSubjects((prev) => toggle(prev, key))
                    }
                    icon={SUBJECT_ICONS[key] ?? "rocket"}
                    label={t(`subjects.${key}`)}
                  />
                ))}
              </div>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    {t("experienceLabel")}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_KEYS.map((key) => (
                      <Pill
                        key={key}
                        active={experience === key}
                        onClick={() =>
                          setExperience(experience === key ? "" : key)
                        }
                      >
                        {t(`experience.${key}`)}
                      </Pill>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="hours"
                    className="text-sm font-semibold"
                  >
                    {t("hoursLabel")}
                  </Label>
                  <Input
                    id="hours"
                    type="number"
                    min={0}
                    max={40}
                    value={availableHours}
                    onChange={(e) => setAvailableHours(e.target.value)}
                    placeholder={t("hoursPlaceholder")}
                  />
                </div>

                {/* Summary of selections so far */}
                <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-accent" aria-hidden />
                    Your picks so far
                  </p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex items-baseline gap-2">
                      <dt className="shrink-0 text-muted-foreground">
                        Goals:
                      </dt>
                      <dd className="font-medium text-foreground">
                        {goals.length
                          ? goals
                              .map((g) => t(`goals.${g as typeof GOAL_KEYS[number]}`))
                              .join(" · ")
                          : "—"}
                      </dd>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <dt className="shrink-0 text-muted-foreground">
                        Subjects:
                      </dt>
                      <dd className="font-medium text-foreground">
                        {subjects.length
                          ? subjects
                              .map((s) => t(`subjects.${s as typeof SUBJECT_KEYS[number]}`))
                              .join(" · ")
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Days you&apos;re free</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAY_LABELS.map((label, idx) => (
                      <Pill
                        key={idx}
                        active={availDays.includes(idx)}
                        onClick={() => setAvailDays((prev) => toggle(prev, idx))}
                      >
                        {label}
                      </Pill>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availStart" className="text-sm font-semibold">
                      From
                    </Label>
                    <Input
                      id="availStart"
                      type="time"
                      value={availStart}
                      onChange={(e) => setAvailStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availEnd" className="text-sm font-semibold">
                      Until
                    </Label>
                    <Input
                      id="availEnd"
                      type="time"
                      value={availEnd}
                      onChange={(e) => setAvailEnd(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Times are in your timezone ({timezone}). You can skip this and set
                  it later — but adding it lets us match you with tutors right away.
                </p>
              </div>
            )}

            {error && (
              <p
                className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 0 || loading}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
              {t("back")}
            </Button>
            <Button
              variant="launch"
              onClick={advance}
              disabled={!canAdvance}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <>
                  {step === steps.length - 1 ? t("finish") : t("continue")}
                  <ArrowRight
                    className="h-4 w-4 rtl:rotate-180"
                    aria-hidden
                  />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Helpful aside */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Don&apos;t overthink it — you can change everything later in Account
          settings.
        </p>
      </div>
    </div>
  );
}
