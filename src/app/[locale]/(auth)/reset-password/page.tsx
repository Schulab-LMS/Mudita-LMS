import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ResetPasswordClient from "./reset-password-client";

function ResetFallback() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <Loader2
        className="h-10 w-10 animate-spin text-primary"
        aria-hidden
      />
      <p className="text-sm text-muted-foreground">Loading reset form…</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetFallback />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
