// Next.js server instrumentation (stable since v15). register() runs once per server
// boot; onRequestError fires whenever the server captures an unhandled error in a
// Server Component, Route Handler, Server Action, or the proxy. We forward those to
// Sentry via the lazy reporter — all of which no-ops without SENTRY_DSN.

import type { Instrumentation } from "next";

export async function register(): Promise<void> {
  // Sentry's Node SDK must only load on the Node.js runtime, never Edge.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initServerSentry } = await import("@/lib/observability");
    initServerSentry();
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { captureServerError } = await import("@/lib/observability");
  captureServerError(err, {
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  });
};
