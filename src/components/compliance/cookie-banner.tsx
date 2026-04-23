"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  COOKIE_CONSENT_COOKIE,
  saveCookieConsent,
  type StoredCookieConsent,
} from "@/actions/consent.actions";

function readConsentCookie(): StoredCookieConsent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_CONSENT_COOKIE}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=")[1])) as StoredCookieConsent;
  } catch {
    return null;
  }
}

export function CookieBanner() {
  const t = useTranslations("cookieBanner");
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Mount: only show the banner if there's no saved choice. We intentionally
  // avoid server-rendering the banner to sidestep a hydration-flash: the
  // server has no way to know the user's cookie before the first paint of a
  // static page, and flashing a banner they already dismissed is worse UX
  // than a small post-hydration fade-in.
  useEffect(() => {
    const stored = readConsentCookie();
    if (!stored) {
      setVisible(true);
      return;
    }
    setAnalytics(stored.analytics);
    setMarketing(stored.marketing);
  }, []);

  const persist = useCallback(
    (next: { analytics: boolean; marketing: boolean }) => {
      startTransition(async () => {
        const res = await saveCookieConsent(next);
        if (res.success) setVisible(false);
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
              checked={analytics}
              onChange={setAnalytics}
            />
            <CategoryRow
              label={t("cookiesMarketingLabel")}
              description={t("cookiesMarketingDesc")}
              checked={marketing}
              onChange={setMarketing}
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
              onClick={() => persist({ analytics, marketing })}
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
