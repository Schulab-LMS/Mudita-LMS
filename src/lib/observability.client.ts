// Client-side error reporting via Sentry. Initialized from instrumentation-client.ts
// before hydration. Lazy + optional like the server side: no NEXT_PUBLIC_SENTRY_DSN
// → no-op. The DSN must be NEXT_PUBLIC_* because it's inlined into the browser bundle
// (build-time), so changing it requires a rebuild.
"use client";

import * as Sentry from "@sentry/browser";

let initialized = false;

export function isClientSentryConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
}

export function initClientSentry(): void {
  if (initialized || !isClientSentryConfigured()) return;
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
    sendDefaultPii: false,
  });
  initialized = true;
}

// Report a client-side exception (e.g. from an error boundary). No-op when unconfigured.
export function captureClientError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!isClientSentryConfigured()) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
