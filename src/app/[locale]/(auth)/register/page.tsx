"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/validators/auth.schema";
import { registerUser } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import {
  Loader2,
  GraduationCap,
  Users,
  BookOpen,
  Mail,
  Lock,
  User,
  Calendar,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

// Marketing plan slug → pricing i18n key. Keep in sync with the hrefs in
// pricing-tiers.tsx; "basic" and "solo" both map to the Solo plan because the
// internal i18n key is still `pricing.basic`.
const PLAN_PARAM_TO_KEY: Record<string, "basic" | "family" | "school"> = {
  solo: "basic",
  basic: "basic",
  family: "family",
  custom: "school",
  school: "school",
};

const roles = [
  {
    value: "STUDENT" as const,
    icon: GraduationCap,
    key: "roleStudent",
    blurbKey: "roleBlurbs.student",
  },
  {
    value: "PARENT" as const,
    icon: Users,
    key: "roleParent",
    blurbKey: "roleBlurbs.parent",
  },
  {
    value: "TUTOR" as const,
    icon: BookOpen,
    key: "roleTutor",
    blurbKey: "roleBlurbs.tutor",
  },
];

// Keep this in sync with CHILD_AGE_THRESHOLD in src/lib/compliance.ts —
// client-side we only need it to decide whether to reveal the parent fields.
const CHILD_AGE_THRESHOLD = 16;

function ageFromDob(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const dob = new Date(iso);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

const STRENGTH_TONES = [
  "bg-destructive",
  "bg-destructive",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-[var(--stem-science)]",
];
const STRENGTH_KEYS = ["tooShort", "weak", "okay", "strong", "excellent"] as const;

function passwordStrength(pw: string | undefined): { score: number; toneKey: (typeof STRENGTH_KEYS)[number]; tone: string } {
  if (!pw) return { score: 0, toneKey: "tooShort", tone: "bg-muted" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return { score, toneKey: STRENGTH_KEYS[score], tone: STRENGTH_TONES[score] };
}

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tPricing = useTranslations("pricing");
  const searchParams = useSearchParams();
  const planParam = (searchParams.get("plan") ?? "").toLowerCase();
  const planKey = PLAN_PARAM_TO_KEY[planParam] ?? null;
  const planName = planKey ? tPricing(`${planKey}.name`) : null;
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "STUDENT",
      acceptedTerms: false as unknown as true,
      acceptedPrivacy: false as unknown as true,
      parentalConsent: false,
      marketingOptIn: false,
    },
  });

  const selectedRole = watch("role");
  const dob = watch("dateOfBirth");
  const password = watch("password");
  const age = useMemo(() => (dob ? ageFromDob(dob) : null), [dob]);
  const requiresParent =
    selectedRole === "STUDENT" && age !== null && age < CHILD_AGE_THRESHOLD;
  const strength = passwordStrength(password);

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    setError("");

    const result = await registerUser(data);

    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Don't auto-sign-in: credentials login is blocked until the user
    // verifies their email, so a silent signIn here would just confuse
    // them with a failed session. Send them straight to the verify page.
    router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {t("registerTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("registerSubtitle")}
        </p>
      </div>

      {planKey && planName && (
        <div className="mb-5 rounded-2xl border border-primary/20 bg-launch-gradient-soft p-4 text-sm shadow-sm animate-slide-down">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#4f3ff0]">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="flex-1 space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#4f3ff0]">
                {t("planBanner.label")}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-base font-bold text-foreground">
                  {t("planBanner.title", { plan: planName })}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#34d399]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#047857]">
                  <Sparkles className="h-3 w-3" />
                  {t("planBanner.freeBadge")}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t("planBanner.body", { plan: planName })}
              </p>
              <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4f3ff0]" />
                <span>{t("planBanner.autoRenew", { plan: planName })}</span>
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#4f3ff0] hover:underline"
              >
                {t("planBanner.changePlan")}
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive animate-slide-down"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Role picker */}
        <div className="space-y-2">
          <Label>{t("role")}</Label>
          <div role="radiogroup" className="grid grid-cols-3 gap-2">
            {roles.map((role) => {
              const active = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setValue("role", role.value)}
                  className={`group relative flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-xs transition-all ${
                    active
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <role.icon
                    className={`h-5 w-5 transition-transform group-hover:scale-110 ${active ? "" : ""}`}
                  />
                  <span className="font-semibold">{t(role.key)}</span>
                  <span className="text-[10px] text-muted-foreground/80 leading-tight">
                    {t(role.blurbKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("name")}</Label>
          <div className="relative">
            <User className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              placeholder="John Doe"
              autoComplete="name"
              className="ps-10"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
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

        {/* DOB */}
        <div className="space-y-1.5">
          <Label htmlFor="dateOfBirth">{t("dateOfBirth")}</Label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="dateOfBirth"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              className="ps-10"
              {...register("dateOfBirth")}
            />
          </div>
          {errors.dateOfBirth && (
            <p className="text-xs text-destructive">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        {/* Password with strength meter */}
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("password")}</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="ps-10 pe-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {/* Strength meter */}
          <div className="flex items-center gap-1 pt-1" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < strength.score ? strength.tone : "bg-muted"
                }`}
              />
            ))}
            {password && (
              <span className="ms-2 text-[11px] font-medium text-muted-foreground">
                {t(`passwordStrength.${strength.toneKey}`)}
              </span>
            )}
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="ps-10"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {requiresParent && (
          <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm animate-slide-down">
            <p className="font-medium text-amber-900">
              {t("parent.notice", { age: CHILD_AGE_THRESHOLD })}
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="parentEmail" className="text-amber-900">
                {t("parent.email")}
              </Label>
              <Input
                id="parentEmail"
                type="email"
                placeholder={t("parent.emailPlaceholder")}
                className="bg-white"
                {...register("parentEmail")}
              />
            </div>
            <label className="flex items-start gap-2 text-sm text-amber-900">
              <input
                type="checkbox"
                className="mt-1 accent-amber-600"
                {...register("parentalConsent")}
              />
              <span>{t("parent.consent")}</span>
            </label>
          </div>
        )}

        <div className="space-y-2 pt-1">
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="mt-1 accent-primary"
              {...register("acceptedTerms")}
            />
            <span>
              {t.rich("legal.agreeTerms", {
                t: (chunks) => (
                  <Link href="/terms" className="text-primary hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </span>
          </label>
          {errors.acceptedTerms && (
            <p className="text-xs text-destructive">
              {errors.acceptedTerms.message}
            </p>
          )}
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="mt-1 accent-primary"
              {...register("acceptedPrivacy")}
            />
            <span>
              {t.rich("legal.agreePrivacy", {
                p: (chunks) => (
                  <Link href="/privacy" className="text-primary hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </span>
          </label>
          {errors.acceptedPrivacy && (
            <p className="text-xs text-destructive">
              {errors.acceptedPrivacy.message}
            </p>
          )}
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="mt-1 accent-primary"
              {...register("marketingOptIn")}
            />
            <span>{t("legal.marketingOptIn")}</span>
          </label>
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
              {t("registerTitle")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </>
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div aria-hidden className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-background px-3 text-muted-foreground">
            {t("orContinueWith")}
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {t("google")}
      </Button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          {t("loginTitle")}
        </Link>
      </p>
    </div>
  );
}
