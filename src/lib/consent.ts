// Shared constants + types for the cookie-consent flow. Kept out of
// `src/actions/consent.actions.ts` because that file carries `"use server"`,
// which only allows exporting async functions. Splitting them here lets the
// client-side banner import the cookie name and payload shape without
// pulling in the server action machinery.

export const COOKIE_CONSENT_COOKIE = "schulab_cookie_consent";
export const COOKIE_CONSENT_VERSION =
  process.env.NEXT_PUBLIC_COOKIE_CONSENT_VERSION ?? "1";

export type CookieConsentPayload = {
  analytics: boolean;
  marketing: boolean;
};

export type StoredCookieConsent = {
  v: string;
  functional: true;
  analytics: boolean;
  marketing: boolean;
  ts: string;
};
