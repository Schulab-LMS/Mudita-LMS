"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  verifyEmail,
  sendVerificationEmail,
} from "@/actions/email-verification.actions";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  MailCheck,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Info,
} from "lucide-react";

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  if (user.length <= 2) return `${user[0]}•@${domain}`;
  return `${user[0]}${"•".repeat(Math.max(2, user.length - 2))}${
    user[user.length - 1]
  }@${domain}`;
}

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const t = useTranslations("auth");

  // Start in `confirm` when a token is present — we used to call
  // verifyEmail() in a useEffect on mount, which let Gmail/Outlook link
  // scanners (that pre-fetch URLs in emails) consume the token before the
  // real user ever clicked. Now the user explicitly clicks "Verify my
  // email" and the token is only spent on that action.
  const [status, setStatus] = useState<
    "confirm" | "loading" | "success" | "error" | "no-token"
  >(token ? "confirm" : "no-token");
  const [errorMsg, setErrorMsg] = useState("");
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [resendError, setResendError] = useState("");
  const [resendOk, setResendOk] = useState(false);

  async function handleConfirm() {
    if (!token) return;
    setStatus("loading");
    const result = await verifyEmail(token);
    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(result.error || t("verifyFailed"));
    }
  }

  useEffect(() => {
    if (resendIn <= 0) return;
    const h = setTimeout(() => setResendIn((r) => r - 1), 1000);
    return () => clearTimeout(h);
  }, [resendIn]);

  async function handleResend() {
    if (!email || resendIn > 0) return;
    setResending(true);
    setResendError("");
    setResendOk(false);
    const result = await sendVerificationEmail(email);
    setResending(false);
    if (result?.success) {
      setResendOk(true);
      setResendIn(60);
    } else {
      setResendError(result?.error || t("verifyFailed"));
    }
  }

  // ── Confirm state (token present, waiting for user click) ────────
  if (status === "confirm") {
    return (
      <div className="w-full animate-scale-in">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <MailCheck className="h-8 w-8 text-primary" aria-hidden />
          </div>
          <h2 className="mt-5 font-display text-2xl font-extrabold">
            Verify your email
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Click the button below to confirm your email address and finish
            setting up your account.
          </p>
        </div>

        <Button
          variant="launch"
          size="lg"
          className="mt-6 w-full"
          onClick={handleConfirm}
        >
          Verify my email
          <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
        </Button>
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="w-full animate-scale-in text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        </div>
        <h2 className="mt-5 font-display text-2xl font-extrabold">
          {t("verifying")}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Hang tight — this usually takes a second.
        </p>
      </div>
    );
  }

  // ── Success state ────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="w-full animate-scale-in">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden />
          </div>
          <h2 className="mt-5 font-display text-2xl font-extrabold">
            {t("emailVerified")}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {t("emailVerifiedBody")}
          </p>
        </div>

        <Link href="/login" className="mt-6 block">
          <Button variant="launch" size="lg" className="w-full">
            {t("goToLogin")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Button>
        </Link>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="w-full animate-scale-in">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
            <XCircle className="h-8 w-8 text-red-600" aria-hidden />
          </div>
          <h2 className="mt-5 font-display text-2xl font-extrabold">
            {t("verifyFailed")}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {errorMsg}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {email && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resending || resendIn > 0}
            >
              {resending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : resendIn > 0 ? (
                `Resend in ${resendIn}s`
              ) : (
                <>
                  <RotateCw className="h-4 w-4" aria-hidden />
                  {t("resendVerification")}
                </>
              )}
            </Button>
          )}
          <Link href="/login" className="w-full">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
              {t("backToLogin")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── No-token "check your email" state ────────────────────────────
  return (
    <div className="w-full animate-scale-in">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-launch-gradient-soft ring-1 ring-primary/20">
          <Mail className="h-8 w-8 text-primary" aria-hidden />
        </div>
        <h2 className="mt-5 font-display text-2xl font-extrabold">
          {t("checkEmail")}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {email
            ? t.rich("verifyLinkSent", {
                email: maskEmail(email),
                strong: (chunks) => (
                  <strong className="text-foreground">{chunks}</strong>
                ),
              })
            : t("verifyLinkSentGeneric")}
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
        <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p>
            The email should arrive within a minute. If you don&apos;t see it,
            check your spam or promotions folder.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {email && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleResend}
            disabled={resending || resendIn > 0}
          >
            {resending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <>
                <RotateCw className="h-4 w-4" aria-hidden />
                {resendIn > 0 ? `Resend in ${resendIn}s` : t("resendVerification")}
              </>
            )}
          </Button>
        )}
        <Link href="/login" className="flex-1">
          <Button variant="ghost" className="w-full">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            {t("backToLogin")}
          </Button>
        </Link>
      </div>

      {resendOk && resendIn > 0 && (
        <p className="mt-3 text-center text-xs text-emerald-600 dark:text-emerald-400">
          {t("verificationResent")}
        </p>
      )}
      {resendError && (
        <p className="mt-3 text-center text-xs text-destructive">
          {resendError}
        </p>
      )}
    </div>
  );
}
