"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/validators/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Loader2, CheckCircle2, Mail, ArrowRight, Info, RotateCw } from "lucide-react";
import { requestPasswordReset } from "@/actions/password-reset.actions";

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  if (user.length <= 2) return `${user[0]}•@${domain}`;
  return `${user[0]}${"•".repeat(Math.max(2, user.length - 2))}${user[user.length - 1]}@${domain}`;
}

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [resendIn, setResendIn] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  useEffect(() => {
    if (resendIn <= 0) return;
    const h = setTimeout(() => setResendIn((r) => r - 1), 1000);
    return () => clearTimeout(h);
  }, [resendIn]);

  async function onSubmit(data: ForgotPasswordInput) {
    setLoading(true);
    await requestPasswordReset(data.email);
    setSubmittedEmail(data.email);
    setSent(true);
    setResendIn(60);
    setLoading(false);
  }

  async function onResend() {
    if (resendIn > 0 || !submittedEmail) return;
    setLoading(true);
    await requestPasswordReset(submittedEmail);
    setResendIn(60);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="w-full animate-scale-in">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-extrabold">{t("checkEmail")}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {t("resetLinkSent")}
          </p>
          <p className="mt-3 text-sm">
            <span className="text-muted-foreground">Sent to </span>
            <span className="font-semibold text-foreground">{maskEmail(submittedEmail)}</span>
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <div className="space-y-2">
              <p>
                The email should arrive within a minute. If you don&apos;t see it, check your spam or
                promotions folder.
              </p>
              <p>
                Still nothing?{" "}
                <Link href="/contact" className="font-semibold text-primary hover:underline">
                  Contact support
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onResend}
            disabled={resendIn > 0 || loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RotateCw className="h-4 w-4" aria-hidden />
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend email"}
              </>
            )}
          </Button>
          <Link href="/login" className="flex-1">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t("backToLogin")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {t("forgotPassword")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("forgotPasswordSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              className="ps-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="launch"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {tc("submit")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
          {t("backToLogin")}
        </Link>
      </div>
    </div>
  );
}
