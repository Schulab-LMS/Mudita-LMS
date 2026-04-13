"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPassword } from "@/actions/password-reset.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetInput = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
  });

  async function onSubmit(data: ResetInput) {
    if (!token) return;
    setLoading(true);
    setError(null);

    const result = await resetPassword(token, data.password);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Failed to reset password");
    }
    setLoading(false);
  }

  // No token in URL
  if (!token) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <XCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">Invalid reset link</h2>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or missing. Please request a new
            one.
          </p>
          <Link href="/forgot-password">
            <Button variant="outline">Request new link</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Success state
  if (success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <h2 className="text-xl font-semibold">Password reset!</h2>
          <p className="text-sm text-muted-foreground">
            Your password has been updated. You can now log in with your new
            password.
          </p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Set new password</CardTitle>
        <CardDescription>
          Enter your new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-1 inline h-3 w-3" />
            Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
