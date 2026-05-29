"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { GraduationCap, Sparkles } from "lucide-react";
import { enrollChildInCourse } from "@/actions/parent.actions";

interface EnrollableCourse {
  id: string;
  title: string;
  requiredPlan: string | null;
  isFree: boolean;
  price: number;
  currency: string;
  // "subscription" = covered by parent's active plan; "paid" = legacy paid
  // course now subscription-only; "free" = enrol directly.
  kind: "free" | "subscription" | "paid";
}

interface EnrollChildPanelProps {
  childId: string;
  childName: string;
  courses: EnrollableCourse[];
  disabled?: boolean;
  disabledReason?: string;
}

export function EnrollChildPanel({
  childId,
  childName,
  courses,
  disabled = false,
  disabledReason,
}: EnrollChildPanelProps) {
  const [selected, setSelected] = useState<string>(courses[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedCourse = courses.find((c) => c.id === selected);
  // Paid courses default to the lowest paid tier server-side, so the parent
  // needs an active subscription before we let them enrol.
  const requiresSubscription =
    selectedCourse?.kind === "paid" || selectedCourse?.kind === "subscription";

  function handleSubmit() {
    if (!selected || !selectedCourse) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await enrollChildInCourse({
        childId,
        courseId: selected,
      });
      if (!result.success) {
        setError(result.error ?? "Failed to enrol");
        return;
      }
      setSuccess(`${childName} is now enrolled in ${selectedCourse.title}.`);
    });
  }

  function badgeFor(course: EnrollableCourse): string {
    if (course.kind === "free") return " · Free";
    return " · Included with subscription";
  }

  return (
    <div className="card-premium p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <GraduationCap className="h-5 w-5" aria-hidden />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-base font-semibold text-foreground">
            Enrol {childName} in a course
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Pick a course — free courses enrol in one click; every other
            course is included with your Solo, Family, or Custom subscription.
          </p>

          {disabled ? (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {disabledReason ?? "Resolve the items above to start enrolling."}
            </p>
          ) : courses.length === 0 ? (
            <p className="mt-4 rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              No courses available right now. Browse the catalog to find
              something to enrol {childName} in.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Available courses
                </span>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                      {badgeFor(c)}
                    </option>
                  ))}
                </select>
              </label>
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  {success}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={pending || !selected}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {pending ? "Enrolling…" : "Enrol"}
                </button>
                {requiresSubscription && (
                  <Link
                    href="/pricing"
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Subscribe
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
