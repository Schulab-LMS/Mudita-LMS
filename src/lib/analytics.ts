import { db } from "@/lib/db";

// Thin, server-side event dispatcher. Events are always persisted to the
// local AnalyticsEvent table so we can build funnels ourselves, and are
// additionally forwarded to an external provider (PostHog / GA4) when
// one is configured. The provider integration is intentionally stubbed —
// installing the SDK is a separate concern; swapping this file is enough.

type AnalyticsProvider = "POSTHOG" | "GA4" | "NONE";

const PROVIDER: AnalyticsProvider = (() => {
  const raw = (process.env.ANALYTICS_PROVIDER ?? "NONE").toUpperCase();
  if (raw === "POSTHOG" || raw === "GA4") return raw;
  return "NONE";
})();

// Canonical event names. Keep this list small and product-meaningful so a
// funnel is readable at a glance.
export const EVENTS = {
  USER_SIGNED_UP: "user_signed_up",
  USER_LOGGED_IN: "user_logged_in",
  COURSE_VIEWED: "course_viewed",
  COURSE_PURCHASE_STARTED: "course_purchase_started",
  COURSE_PURCHASE_COMPLETED: "course_purchase_completed",
  SUBSCRIPTION_STARTED: "subscription_started",
  SUBSCRIPTION_RENEWED: "subscription_renewed",
  SUBSCRIPTION_CANCELED: "subscription_canceled",
  LESSON_STARTED: "lesson_started",
  LESSON_COMPLETED: "lesson_completed",
  QUIZ_SUBMITTED: "quiz_submitted",
  COURSE_COMPLETED: "course_completed",
  CERTIFICATE_ISSUED: "certificate_issued",
  CONSENT_GRANTED: "consent_granted",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

export type TrackInput = {
  name: EventName | string;
  userId?: string | null;
  anonymousId?: string | null;
  properties?: Record<string, unknown>;
  context?: Record<string, unknown>;
};

// Fire-and-forget. Never throws — analytics must never take down a user
// action. Errors are logged and swallowed.
export async function track(input: TrackInput): Promise<void> {
  const payload = {
    name: input.name,
    userId: input.userId ?? null,
    anonymousId: input.anonymousId ?? null,
    properties: input.properties ?? null,
    context: input.context ?? null,
  };

  try {
    await db.analyticsEvent.create({
      data: {
        name: payload.name,
        userId: payload.userId ?? undefined,
        anonymousId: payload.anonymousId ?? undefined,
        properties: (payload.properties ?? undefined) as never,
        context: (payload.context ?? undefined) as never,
      },
    });
  } catch (err) {
    console.error("[analytics] failed to persist event:", err);
  }

  try {
    if (PROVIDER === "POSTHOG") await forwardToPostHog(input);
    else if (PROVIDER === "GA4") await forwardToGA4(input);
  } catch (err) {
    console.error(`[analytics] ${PROVIDER} forward failed:`, err);
  }
}

// ─── Provider adapters (stubs) ───────────────────────────────────────────
// Replace these with real SDK calls once the credentials are in place.

async function forwardToPostHog(input: TrackInput): Promise<void> {
  // Intentionally empty. Install posthog-node and call client.capture here
  // once NEXT_PUBLIC_POSTHOG_KEY and a server-side key are configured.
  void input;
}

async function forwardToGA4(input: TrackInput): Promise<void> {
  // Intentionally empty. Fire a GA4 Measurement Protocol POST here once
  // NEXT_PUBLIC_GA4_MEASUREMENT_ID and an API secret are configured.
  void input;
}
