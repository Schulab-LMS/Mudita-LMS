"use client";

import { useState, useTransition } from "react";
import { ShieldCheck } from "lucide-react";
import { bulkGrantChildConsent } from "@/actions/parent.actions";

interface BulkConsentBannerProps {
  unconsentedCount: number;
  defaultType: "PARENTAL_COPPA" | "PARENTAL_GDPR_K";
}

export function BulkConsentBanner({
  unconsentedCount,
  defaultType,
}: BulkConsentBannerProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleGrantAll() {
    setError(null);
    startTransition(async () => {
      const result = await bulkGrantChildConsent({ type: defaultType });
      if (!result.success) {
        setError(result.error ?? "Failed to grant consent");
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Consent recorded for all {unconsentedCount} children. The page will
        refresh.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-900">
            {unconsentedCount} children need parental consent
          </p>
          <p className="mt-0.5 text-xs text-amber-800">
            Grant consent for all of them at once. Each will be recorded
            separately on the consent ledger with your name, timestamp, IP,
            and the active privacy-policy version.
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleGrantAll}
            disabled={pending}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-amber-700 px-4 text-xs font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
          >
            {pending
              ? "Recording…"
              : `Grant consent for all ${unconsentedCount} children`}
          </button>
        </div>
      </div>
    </div>
  );
}
