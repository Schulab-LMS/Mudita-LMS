"use client";

import {
  useCallback,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  COOKIE_CONSENT_COOKIE,
  type StoredCookieConsent,
} from "@/lib/consent";
import { saveCookieConsent } from "@/actions/consent.actions";

function readConsentCookie(): StoredCookieConsent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_CONSENT_COOKIE}=`));
  if (!match) return null;
  try {
    return JSON.parse(
      decodeURIComponent(match.split("=")[1])
    ) as StoredCookieConsent;
  } catch {
    return null;
  }
}

// Serialize the consent cookie into a stable key so useSyncExternalStore's
// identity check stays consistent between getSnapshot calls.
function snapshotKey(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_CONSENT_COOKIE}=`));
  return match ?? "";
}

function subscribeToConsent(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  // Fire whenever another tab updates the cookie (via the storage event on
  // the paired localStorage key we don't have). For our purposes we mainly
  // need a no-op subscribe that exists so useSyncExternalStore is happy.
  const handler = () => onChange();
  window.addEventListener("focus", handler);
  window.addEventListener("pageshow", handler);
  return () => {
    window.removeEventListener("focus", handler);
    window.removeEventListener("pageshow", handler);
  };
}

export function CookieBanner() {
  const t = useTranslations("cookieBanner");

  // useSyncExternalStore reads the current cookie on every render without
  // writing to state — replacing the setState-in-effect pattern that React
  // Compiler now disallows. Returns "" on the server (no hydration flash).
  const cookieKey = useSyncExternalStore(
    subscribeToConsent,
    snapshotKey,
    () => ""
  );

  // Parse the stored consent once per cookie-value change. Pure derivation.
  const stored: StoredCookieConsent | null = cookieKey
    ? readConsentCookie()
    : null;

  const [dismissed, setDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsDraft, setAnalyticsDraft] = useState(
    stored?.analytics ?? false
  );
  const [marketingDraft, setMarketingDraft] = useState(
    stored?.marketing ?? false
  );
  const [isPending, startTransition] = useTransition();

  // Banner is visible when:
  //  - hydration has happened (we can distinguish via cookieKey — empty means
  //    either SSR or no cookie; post-hydration on client, empty means no
  //    cookie, which is exactly when we want to show it)
  //  - the user hasn't yet dismissed this render cycle
  //  - there is no stored consent choice
  // We additionally hide during SSR by checking for a window-side signal. The
  // safest approach is to gate on `typeof document !== 'undefined'` via a
  // snapshot-derived flag; hydration matches because `getServerSnapshot`
  // returns "" and client's first render after hydration will re-run and may
  // find a cookie or not.
  const hasMounted = typeof window !== "undefined";
  const visible = hasMounted && !stored && !dismissed;

  const persist = useCallback(
    (next: { analytics: boolean; marketing: boolean }) => {
      startTransition(async () => {
        const res = await saveCookieConsent(next);
        if (res.success) setDismissed(true);
      });
    },
    []
  );

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div>
          <h2
            id="cookie-banner-title"
            className="text-base font-semibold text-foreground"
          >
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("description")}{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-2 hover:text-foreground"
            >
              {t("learnMore")}
            </Link>
            .
          </p>
        </div>

        {showDetails && (
          <div className="grid gap-2 rounded-md border bg-muted/30 p-3 text-sm">
            <CategoryRow
              label={t("cookiesFunctionalLabel")}
              description={t("cookiesFunctionalDesc")}
              checked
              disabled
            />
            <CategoryRow
              label={t("cookiesAnalyticsLabel")}
              description={t("cookiesAnalyticsDesc")}
              checked={analyticsDraft}
              onChange={setAnalyticsDraft}
            />
            <CategoryRow
              label={t("cookiesMarketingLabel")}
              description={t("cookiesMarketingDesc")}
              checked={marketingDraft}
              onChange={setMarketingDraft}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2">
          {!showDetails && (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
              disabled={isPending}
            >
              {t("customize")}
            </button>
          )}
          <button
            type="button"
            onClick={() => persist({ analytics: false, marketing: false })}
            className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
            disabled={isPending}
          >
            {t("rejectAll")}
          </button>
          {showDetails ? (
            <button
              type="button"
              onClick={() =>
                persist({
                  analytics: analyticsDraft,
                  marketing: marketingDraft,
                })
              }
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              disabled={isPending}
            >
              {t("acceptSelection")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => persist({ analytics: true, marketing: true })}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              disabled={isPending}
            >
              {t("acceptAll")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 rounded border-muted-foreground/50 text-primary focus:ring-primary disabled:opacity-50"
      />
      <span>
        <span className="block font-medium text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}
