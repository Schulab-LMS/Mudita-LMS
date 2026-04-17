"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";
import {
  finishOnboarding,
  saveOnboardingStep,
} from "@/actions/onboarding.actions";

const GOAL_OPTIONS = [
  "Get ahead at school",
  "Explore coding",
  "Build STEM projects",
  "Prepare for exams",
  "Have fun learning",
];

const SUBJECT_OPTIONS = [
  "Math",
  "Coding",
  "Robotics",
  "Science",
  "Engineering",
  "AI",
  "Art + Design",
];

const EXPERIENCE_OPTIONS = ["Beginner", "Some experience", "Advanced"];

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
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-muted")
      }
    >
      {active && <Check className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function OnboardingWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [goals, setGoals] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>("");
  const [availableHours, setAvailableHours] = useState<string>("");

  const steps = [
    { title: "What brings you here?", description: "Pick all that apply." },
    { title: "What subjects are you curious about?", description: "We'll recommend courses from these." },
    { title: "Where are you starting from?", description: "No wrong answers." },
  ];

  async function advance() {
    setError(null);
    setLoading(true);
    try {
      if (step === 0) {
        const res = await saveOnboardingStep({ goals });
        if (!res.success) throw new Error(res.error);
      } else if (step === 1) {
        const res = await saveOnboardingStep({ preferredSubjects: subjects });
        if (!res.success) throw new Error(res.error);
      } else {
        const hours = availableHours ? Number(availableHours) : undefined;
        const res = await saveOnboardingStep({
          experience: experience || undefined,
          availableHours: Number.isFinite(hours) ? hours : undefined,
        });
        if (!res.success) throw new Error(res.error);
        const done = await finishOnboarding();
        if (!done.success) throw new Error(done.error);
        router.push("/student");
        return;
      }
      setStep((s) => s + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <div className="mb-3 flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={
                  "h-1.5 flex-1 rounded-full " +
                  (i <= step ? "bg-primary" : "bg-muted")
                }
              />
            ))}
          </div>
          <CardTitle>{steps[step]!.title}</CardTitle>
          <CardDescription>{steps[step]!.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((g) => (
                <Pill
                  key={g}
                  active={goals.includes(g)}
                  onClick={() => setGoals((prev) => toggle(prev, g))}
                >
                  {g}
                </Pill>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-wrap gap-2">
              {SUBJECT_OPTIONS.map((s) => (
                <Pill
                  key={s}
                  active={subjects.includes(s)}
                  onClick={() => setSubjects((prev) => toggle(prev, s))}
                >
                  {s}
                </Pill>
              ))}
            </div>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Your experience</Label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_OPTIONS.map((e) => (
                    <Pill
                      key={e}
                      active={experience === e}
                      onClick={() => setExperience(experience === e ? "" : e)}
                    >
                      {e}
                    </Pill>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Hours you can study per week</Label>
                <Input
                  id="hours"
                  type="number"
                  min={0}
                  max={40}
                  value={availableHours}
                  onChange={(e) => setAvailableHours(e.target.value)}
                  placeholder="e.g. 3"
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0 || loading}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </Button>
          <Button onClick={advance} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step === steps.length - 1 ? "Finish" : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
