"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPassword } from "@/actions/password-reset.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Link } from "@/i18n/navigation";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetSchema = useMemo(
    () =>
      z
        .object({
          password: z.string().min(8, t("passwordMin")),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t("passwordsDontMatch"),
          path: ["confirmPassword"],
        }),
    [t]
  );

  type ResetInput = z.infer<typeof resetSchema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const pw = watch("password");

  async function onSubmit(data: ResetInput) {
    if (!token) return;
    setLoading(true);
    setError(null);

    const result = await resetPassword(token, data.password);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || t("resetFailed"));
    }
    setLoading(false);
  }

  // Invalid-link state
  if (!token) {
    return (
      <div className="w-full animate-scale-in">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-extrabold">
            {t("invalidResetLink")}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {t("invalidResetLinkBody")}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link href="/forgot-password" className="flex-1">
            <Button variant="launch" className="w-full">
              {t("requestNewLink")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Button>
          </Link>
          <Link href="/login" className="flex-1">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
              {t("backToLogin")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="w-full animate-scale-in">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-extrabold">
            {t("passwordReset")}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {t("passwordResetBody")}
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

  // Form
  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {t("setNewPassword")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("setNewPasswordBody")}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive animate-slide-down"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("newPassword")}</Label>
          <PasswordInput
            id="password"
            placeholder={t("passwordPlaceholder")}
            autoComplete="new-password"
            showStrength
            showRequirements
            {...register("password")}
            value={pw}
          />
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t("confirmPasswordPlaceholder")}
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="launch"
          size="lg"
          className="w-full mt-2"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <>
              {t("resetPasswordCta")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
          {t("backToLogin")}
        </Link>
      </div>
    </div>
  );
}
