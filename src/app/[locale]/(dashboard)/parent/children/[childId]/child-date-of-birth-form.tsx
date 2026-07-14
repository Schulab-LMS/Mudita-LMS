"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { updateChildDateOfBirth } from "@/actions/parent.actions";

interface ChildDateOfBirthFormProps {
  childId: string;
  childName: string;
  initialDateOfBirth: string;
}

export function ChildDateOfBirthForm({
  childId,
  childName,
  initialDateOfBirth,
}: ChildDateOfBirthFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const maxDate = new Date().toISOString().slice(0, 10);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const dateOfBirth = form.get("dateOfBirth");
    if (typeof dateOfBirth !== "string") return;

    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateChildDateOfBirth({ childId, dateOfBirth });
      if (!result.success) {
        setError(result.error ?? "Failed to update date of birth");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="card-premium p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CalendarDays className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-semibold text-foreground">
            Child details
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Date of birth determines age-appropriate access and whether{" "}
            {childName} needs parental consent.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="w-full sm:max-w-xs">
              <label
                htmlFor="child-date-of-birth"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Date of birth
              </label>
              <input
                id="child-date-of-birth"
                name="dateOfBirth"
                type="date"
                defaultValue={initialDateOfBirth}
                min="1900-01-01"
                max={maxDate}
                required
                className="input-pretty h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save date of birth"}
            </button>
          </form>
          {error && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {saved && (
            <p
              className="mt-2 flex items-center gap-1.5 text-sm text-emerald-700"
              role="status"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Date of birth saved.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
