// Server-side error reporting via Sentry, wired through Next's native
// instrumentation hooks (src/instrumentation.ts) rather than the @sentry/nextjs
// build plugin — so it never touches next.config / proxy.ts and adds no build steps.
//
// Lazy + optional, mirroring the Stripe/LiveKit pattern: with no SENTRY_DSN set the
// whole thing no-ops, so the app boots and runs identically when unconfigured. Set
// SENTRY_DSN (+ optionally SENTRY_ENVIRONMENT / SENTRY_TRACES_SAMPLE_RATE) to turn it on.

import * as Sentry from "@sentry/node";

let initialized = false;

export function isSentryConfigured(): boolean {
  return Boolean(process.env.SENTRY_DSN);
}

// Called once from instrumentation.ts register() on the Node server runtime.
export function initServerSentry(): void {
  if (initialized || !isSentryConfigured()) return;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    // Tracing is off by default (sample rate 0) to keep launch overhead minimal;
    // raise SENTRY_TRACES_SAMPLE_RATE (e.g. 0.1) once we want performance data.
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
    // Don't send PII by default (GDPR — we serve minors). Opt in explicitly later.
    sendDefaultPii: false,
  });
  initialized = true;
}

// Report a server-side exception. Safe no-op when Sentry isn't configured.
export function captureServerError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!isSentryConfigured()) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
