"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw, Home, HelpCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { captureClientError } from "@/lib/observability.client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    captureClientError(error, { digest: error.digest, boundary: "locale-root" });
  }, [error]);

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="aurora-bg opacity-20" aria-hidden />
      <div className="relative mx-auto w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20">
          <AlertTriangle className="h-8 w-8 text-amber-600" aria-hidden />
        </div>

        <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Something went wrong
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          We hit an unexpected error. This is usually temporary — try again,
          or head back home.
        </p>

        {error.digest && (
          <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-launch-gradient px-5 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
          >
            <RotateCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-input bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Home className="h-4 w-4" aria-hidden />
            Back home
          </Link>
          <Link
            href="/help"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-input bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <HelpCircle className="h-4 w-4" aria-hidden />
            Get help
          </Link>
        </div>
      </div>
    </div>
  );
}
