"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User as UserIcon,
  KeyRound,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/utils";
import {
  updateAccountProfile,
  changeAccountPassword,
  exportAccountData,
  deleteMyAccount,
} from "@/actions/account.actions";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100),
  locale: z.enum(["en", "de", "ar"]),
  avatar: z.string().url("Must be a valid URL").max(500).or(z.literal("")),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

interface AccountUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  locale: string;
  role: string;
  hasPassword: boolean;
  createdAt: string;
}

export function AccountForms({ user }: { user: AccountUser }) {
  return (
    <div className="space-y-6">
      <ProfileSection user={user} />
      {user.hasPassword ? <PasswordSection /> : <OAuthPasswordNotice />}
      <DataExportSection />
      <DeleteAccountSection hasPassword={user.hasPassword} />
    </div>
  );
}

// ── Profile ──────────────────────────────────────────────────────────────

function ProfileSection({ user }: { user: AccountUser }) {
  const [status, setStatus] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      locale: (user.locale as "en" | "de" | "ar") ?? "en",
      avatar: user.avatar ?? "",
    },
  });

  const watchedAvatar = watch("avatar");
  const watchedName = watch("name");

  async function onSubmit(data: ProfileForm) {
    setStatus(null);
    const result = await updateAccountProfile(data);
    if (result.success) {
      setStatus({ type: "success", message: "Profile updated" });
    } else {
      setStatus({ type: "error", message: result.error });
    }
  }

  return (
    <SectionCard
      icon={<UserIcon className="h-5 w-5" />}
      title="Profile"
      description="Your name, language, and avatar."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar
            src={watchedAvatar || undefined}
            fallback={getInitials(watchedName || user.name || "U")}
            size="lg"
          />
          <div className="text-sm">
            <p className="font-medium">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              {user.role} · Joined{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="locale">Language</Label>
            <select
              id="locale"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("locale")}
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar">Avatar URL</Label>
          <Input
            id="avatar"
            placeholder="https://…"
            {...register("avatar")}
          />
          {errors.avatar && (
            <p className="text-sm text-destructive">{errors.avatar.message}</p>
          )}
        </div>

        {status && (
          <StatusBanner type={status.type} message={status.message} />
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}

// ── Password ─────────────────────────────────────────────────────────────

function PasswordSection() {
  const [status, setStatus] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  async function onSubmit(data: PasswordForm) {
    setStatus(null);
    const result = await changeAccountPassword(data);
    if (result.success) {
      setStatus({ type: "success", message: "Password changed" });
      reset();
    } else {
      setStatus({ type: "error", message: result.error });
    }
  }

  return (
    <SectionCard
      icon={<KeyRound className="h-5 w-5" />}
      title="Password"
      description="Change the password you use to sign in."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current password</Label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            {...register("currentPassword")}
          />
          {errors.currentPassword && (
            <p className="text-sm text-destructive">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {status && (
          <StatusBanner type={status.type} message={status.message} />
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating…" : "Change password"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}

function OAuthPasswordNotice() {
  return (
    <SectionCard
      icon={<KeyRound className="h-5 w-5" />}
      title="Password"
      description="You signed up with a social login, so there's no password on this account."
    >
      <p className="text-sm text-muted-foreground">
        To add a password, sign out and use &quot;Forgot password&quot; on the
        sign-in page — we&apos;ll email you a link to set one.
      </p>
    </SectionCard>
  );
}

// ── Data export ──────────────────────────────────────────────────────────

function DataExportSection() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  async function onExport() {
    setLoading(true);
    setStatus(null);
    try {
      const result = await exportAccountData();
      if (!result.success) {
        setStatus({ type: "error", message: result.error });
        return;
      }
      const blob = new Blob([result.data!.json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.data!.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus({ type: "success", message: "Download started" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard
      icon={<Download className="h-5 w-5" />}
      title="Export my data"
      description="Download a copy of everything we hold about you as JSON."
    >
      <p className="text-sm text-muted-foreground">
        The file includes your profile, enrollments, progress, certificates,
        orders, and consent history.
      </p>

      {status && (
        <div className="mt-4">
          <StatusBanner type={status.type} message={status.message} />
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={onExport} disabled={loading}>
          {loading ? "Preparing…" : "Download JSON"}
        </Button>
      </div>
    </SectionCard>
  );
}

// ── Delete ───────────────────────────────────────────────────────────────

function DeleteAccountSection({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteMyAccount({
        password: hasPassword ? password : undefined,
        confirmation,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      // Sign out and redirect to home; the JWT in-flight still points to the
      // now-anonymized user, so we must drop the session cookie too.
      await signOut({ redirect: false });
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <Trash2 className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-lg font-semibold text-destructive">
            Delete my account
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This cannot be undone. Your personal information (name, email,
            profile) is removed. For legal and tax reasons we keep a record of
            any paid orders and issued certificates, but they are unlinked
            from your identity.
          </p>

          {!confirming ? (
            <div className="mt-4">
              <Button
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => setConfirming(true)}
              >
                I want to delete my account
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-4 rounded-lg border bg-background p-4">
              <div className="flex items-start gap-2 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-amber-900">
                  You&apos;ll be signed out immediately and won&apos;t be able
                  to sign back in.
                </p>
              </div>

              {hasPassword && (
                <div className="space-y-2">
                  <Label htmlFor="delete-password">Your password</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="delete-confirm">
                  Type <span className="font-mono font-bold">DELETE</span> to
                  confirm
                </Label>
                <Input
                  id="delete-confirm"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="DELETE"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="destructive"
                  onClick={onDelete}
                  disabled={
                    isPending ||
                    confirmation !== "DELETE" ||
                    (hasPassword && password.length === 0)
                  }
                >
                  {isPending ? "Deleting…" : "Permanently delete"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setConfirming(false);
                    setPassword("");
                    setConfirmation("");
                    setError(null);
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shared ───────────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function StatusBanner({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  if (type === "success") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        <CheckCircle2 className="h-4 w-4" />
        {message}
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </div>
  );
}
