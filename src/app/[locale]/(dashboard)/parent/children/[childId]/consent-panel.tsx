"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  grantChildConsent,
  withdrawChildConsent,
} from "@/actions/parent.actions";

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
  const [withdrawnNow, setWithdrawnNow] = useState(false);
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);

  const showActive = !withdrawnNow && (hasActiveConsent || grantedNow);

  function handleGrant() {
    setError(null);
    startTransition(async () => {
      const result = await grantChildConsent({ childId, type: defaultType });
      if (!result.success) {
        setError(result.error ?? "Failed to record consent");
        return;
      }
      setGrantedNow(true);
      setWithdrawnNow(false);
    });
  }

  function handleWithdraw() {
    setError(null);
    startTransition(async () => {
      const result = await withdrawChildConsent({ childId, type: defaultType });
      if (!result.success) {
        setError(result.error ?? "Failed to record withdrawal");
        return;
      }
      setWithdrawnNow(true);
      setGrantedNow(false);
      setConfirmingWithdraw(false);
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
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                <span>
                  Consent on file
                  {consentGrantedAt && !grantedNow
                    ? ` since ${consentGrantedAt.toLocaleDateString()}`
                    : ""}
                  .
                </span>
              </div>
              {confirmingWithdraw ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className="h-4 w-4 shrink-0 text-amber-700"
                      aria-hidden
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900">
                        Withdraw consent for {childName}?
                      </p>
                      <p className="mt-1 text-xs text-amber-800">
                        They will lose access to courses, live sessions, and
                        new purchases immediately. The withdrawal is recorded
                        to the consent ledger.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={handleWithdraw}
                          disabled={pending}
                          className="inline-flex h-8 items-center justify-center rounded-md bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          {pending ? "Recording…" : "Confirm withdraw"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingWithdraw(false)}
                          disabled={pending}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingWithdraw(true)}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Withdraw consent
                </button>
              )}
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {withdrawnNow && (
                <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Consent withdrawn. {childName} is now blocked from new
                  enrolments and purchases, and can no longer access lessons.
                </div>
              )}
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
