"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  COOKIE_CONSENT_COOKIE,
  type StoredCookieConsent,
} from "@/lib/consent";

// Consent-gated client analytics. Loads PostHog OR GA4 — but ONLY after the user
// has granted the "analytics" cookie category. On a platform serving children this
// gate is mandatory: nothing loads, no cookies are set, and no network call fires
// until consent === true. The provider is chosen at build time via
// NEXT_PUBLIC_ANALYTICS_PROVIDER; keys via NEXT_PUBLIC_* (inlined at build).
//
// We deliberately avoid an npm SDK: the official loader snippets keep the bundle
// lean and make "don't load until consent" trivial (we just don't inject the script).

declare global {
  interface Window {
    posthog?: { capture: (e: string, p?: Record<string, unknown>) => void };
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    __schulabAnalyticsLoaded?: boolean;
  }
}

const PROVIDER = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER ?? "NONE").toUpperCase();
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "";

function hasAnalyticsConsent(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_CONSENT_COOKIE}=`));
  if (!match) return false;
  try {
    const parsed = JSON.parse(
      decodeURIComponent(match.split("=")[1]),
    ) as StoredCookieConsent;
    return parsed.analytics === true;
  } catch {
    return false;
  }
}

// Capture campaign attribution from the landing URL once, so a signup can be
// traced back to a Postiz/email post. Stored as super-properties / GA params.
function captureUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = params.get(k);
    if (v) utm[k] = v;
  }
  return utm;
}

function loadPostHog(): void {
  if (!POSTHOG_KEY || window.__schulabAnalyticsLoaded) return;
  window.__schulabAnalyticsLoaded = true;
  // Official PostHog snippet (trimmed), pointed at the configured (EU) host.
  /* eslint-disable */
  // @ts-expect-error - third-party loader snippet assigns to window.posthog
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording capturePageview capturePageleave debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  // @ts-expect-error - posthog stub from snippet above
  window.posthog.init(POSTHOG_KEY, { api_host: POSTHOG_HOST, person_profiles: "identified_only", capture_pageview: false });
  /* eslint-enable */
  const utm = captureUtm();
  if (Object.keys(utm).length) {
    // @ts-expect-error - register exists on the initialized client
    window.posthog.register?.(utm);
  }
}

function loadGA4(): void {
  if (!GA4_ID || window.__schulabAnalyticsLoaded) return;
  window.__schulabAnalyticsLoaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  // SPA: we send page_view manually on route change, so disable automatic ones.
  window.gtag("config", GA4_ID, { send_page_view: false, anonymize_ip: true });
}

function trackPageview(path: string): void {
  if (PROVIDER === "POSTHOG" && window.posthog) {
    window.posthog.capture("$pageview", { $current_url: window.location.href, path });
  } else if (PROVIDER === "GA4" && window.gtag) {
    window.gtag("event", "page_view", { page_path: path, page_location: window.location.href });
  }
}

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (PROVIDER === "NONE") return;
    if (!hasAnalyticsConsent()) return; // hard gate — nothing loads without consent
    if (PROVIDER === "POSTHOG") loadPostHog();
    else if (PROVIDER === "GA4") loadGA4();
    trackPageview(pathname);
    // Re-runs on pathname change → SPA pageviews. Re-checks consent each time, so
    // a user who accepts mid-session starts being measured from that point on.
  }, [pathname]);

  return null;
}
