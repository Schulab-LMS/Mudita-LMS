// Client instrumentation (Next.js v15.3+): runs after the document loads, before
// React hydration — the right moment to start error tracking so early failures are
// caught. No-ops without NEXT_PUBLIC_SENTRY_DSN.

import { initClientSentry } from "@/lib/observability.client";

try {
  initClientSentry();
} catch {
  // Never let instrumentation setup break the app.
}
