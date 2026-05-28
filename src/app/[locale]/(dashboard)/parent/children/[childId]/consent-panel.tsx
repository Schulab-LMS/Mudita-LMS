"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { grantChildConsent } from "@/actions/parent.actions";

type ConsentType = "PARENTAL_COPPA" | "PARENTAL_GDPR_K";

interface ConsentPanelProps {
  childId: string;
  childName: string;
  hasActiveConsent: boolean;
  consentGrantedAt: Date | null;
  defaultType: ConsentType;
}

export function ConsentPanel({
  childId,
  childName,
  hasActiveConsent,
  consentGrantedAt,
  defaultType,
}: ConsentPanelProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [grantedNow, setGrantedNow] = useState(false);

  const showActive = hasActiveConsent || grantedNow;

  function handleGrant() {
    setError(null);
    startTransition(async () => {
      const result = await grantChildConsent({ childId, type: defaultType });
      if (!result.success) {
        setError(result.error ?? "Failed to record consent");
        return;
      }
      setGrantedNow(true);
    });
  }

  return (
    <div className="card-premium p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-base font-semibold text-foreground">
            Parental consent
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {childName} is under the digital age of consent. We need your
            confirmation before they can enrol in courses, take part in live
            sessions, or be charged for anything.
          </p>

          {showActive ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              <span>
                Consent on file
                {consentGrantedAt && !grantedNow
                  ? ` since ${consentGrantedAt.toLocaleDateString()}`
                  : ""}
                .
              </span>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={handleGrant}
                disabled={pending}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {pending ? "Recording…" : `Grant consent for ${childName}`}
              </button>
              <p className="text-xs text-muted-foreground">
                Recorded immutably to our consent ledger with your name,
                timestamp, IP, and the active privacy-policy version.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
