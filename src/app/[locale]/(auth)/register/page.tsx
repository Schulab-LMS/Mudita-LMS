"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/validators/auth.schema";
import { registerUser } from "@/actions/auth.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { Loader2, GraduationCap, Users, BookOpen } from "lucide-react";

const roles = [
  { value: "STUDENT" as const, icon: GraduationCap, key: "roleStudent" },
  { value: "PARENT" as const, icon: Users, key: "roleParent" },
  { value: "TUTOR" as const, icon: BookOpen, key: "roleTutor" },
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

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
  const age = useMemo(() => (dob ? ageFromDob(dob) : null), [dob]);
  const requiresParent = selectedRole === "STUDENT" && age !== null && age < CHILD_AGE_THRESHOLD;

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    setError("");

    const result = await registerUser(data);

    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Auto sign in after registration
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{t("registerTitle")}</CardTitle>
        <CardDescription>{t("registerSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>{t("role")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setValue("role", role.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-sm transition-colors ${
                    selectedRole === role.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <role.icon className="h-5 w-5" />
                  {t(role.key)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" placeholder="John Doe" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              {...register("dateOfBirth")}
            />
            {errors.dateOfBirth && (
              <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {requiresParent && (
            <div className="space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700/60 dark:bg-amber-900/20">
              <p className="font-medium text-amber-900 dark:text-amber-200">
                Because the learner is under {CHILD_AGE_THRESHOLD}, a parent or
                guardian must confirm consent.
              </p>
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Parent or guardian email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  placeholder="parent@example.com"
                  {...register("parentEmail")}
                />
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  {...register("parentalConsent")}
                />
                <span>
                  I am the parent or legal guardian and I consent to Mudita
                  creating this account and processing my child&apos;s data as
                  described in the Privacy Policy.
                </span>
              </label>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                {...register("acceptedTerms")}
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="underline">
                  Terms of Service
                </Link>
              </span>
            </label>
            {errors.acceptedTerms && (
              <p className="text-xs text-destructive">{errors.acceptedTerms.message}</p>
            )}
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                {...register("acceptedPrivacy")}
              />
              <span>
                I have read the{" "}
                <Link href="/privacy" className="underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.acceptedPrivacy && (
              <p className="text-xs text-destructive">{errors.acceptedPrivacy.message}</p>
            )}
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="mt-1"
                {...register("marketingOptIn")}
              />
              <span>Send me occasional updates and learning tips.</span>
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("registerTitle")}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              {t("orContinueWith")}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          {t("google")}
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          {t("hasAccount")}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("loginTitle")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
