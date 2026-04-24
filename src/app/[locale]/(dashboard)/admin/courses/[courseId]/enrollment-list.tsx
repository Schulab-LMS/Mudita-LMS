"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  adminEnrollUser,
  adminUnenrollUser,
} from "@/actions/enrollment.actions";
import { useRouter } from "@/i18n/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Plus,
  X,
  UserPlus,
  Trash2,
  Mail,
  Users,
  AlertCircle,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

interface Enrollment {
  id: string;
  userId: string;
  status: string;
  progress: number;
  enrolledAt: string | Date;
  user: {
    name: string;
    email: string;
  };
}

interface EnrollmentListProps {
  courseId: string;
  enrollments: Enrollment[];
}

const KNOWN_STATUSES = new Set([
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
]);

const STATUS_CHIP: Record<string, string> = {
  ACTIVE: "chip chip-primary",
  COMPLETED: "chip chip-success",
  CANCELLED: "chip chip-neutral",
  EXPIRED: "chip chip-neutral",
};

export function EnrollmentList({ courseId, enrollments }: EnrollmentListProps) {
  const t = useTranslations("admin.enrollments");
  const tStatus = useTranslations("admin.enrollmentStatus");
  const tCommon = useTranslations("admin.common");
  const tActions = useTranslations("admin.actions");
  const tConfirm = useTranslations("admin.confirm.removeEnrollment");
  const locale = useLocale();
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const router = useRouter();

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await adminEnrollUser(email.trim(), courseId);
      if (!res.success) {
        setError(res.error ?? t("enrollFailed"));
      } else {
        setEmail("");
        setShowAddForm(false);
        router.refresh();
      }
    });
  }

  function handleUnenroll() {
    if (!confirmUserId) return;
    const userId = confirmUserId;
    startTransition(async () => {
      await adminUnenrollUser(userId, courseId);
      setConfirmUserId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {t("heading", { count: enrollments.length })}
          </h2>
          {enrollments.length > 0 && (
            <span className="chip chip-neutral">{enrollments.length}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-launch-gradient px-3 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          {showAddForm ? (
            <>
              <X className="h-3.5 w-3.5" aria-hidden />
              {tCommon("cancel")}
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" aria-hidden />
              {t("enrollStudent")}
            </>
          )}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleEnroll}
          className="card-premium flex flex-col gap-2 p-4 sm:flex-row sm:items-start"
        >
          <div className="flex-1">
            <div className="relative">
              <Mail
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("userIdPlaceholder")}
                className="input-pretty h-10 w-full rounded-lg border border-input bg-background ps-9 pe-3 text-sm focus-visible:outline-none"
                required
              />
            </div>
            {error && (
              <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" aria-hidden />
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {isPending ? t("enrollingButton") : t("enrollButton")}
          </button>
        </form>
      )}

      {enrollments.length === 0 ? (
        <div className="card-premium flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" aria-hidden />
          </div>
          <p className="font-semibold text-foreground">
            No students enrolled yet
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {t("emptyMessage")}
          </p>
          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-launch-gradient px-4 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <UserPlus className="h-3.5 w-3.5" aria-hidden />
              {t("enrollStudent")}
            </button>
          )}
        </div>
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("studentCol")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {tCommon("status")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("progressCol")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("enrolledCol")}
                  </th>
                  <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {tCommon("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enrollments.map((enrollment) => (
                  <tr
                    key={enrollment.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-xs font-semibold text-foreground">
                          {getInitials(enrollment.user.name ?? "?")}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {enrollment.user.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {enrollment.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          STATUS_CHIP[enrollment.status] ?? "chip chip-neutral"
                        }
                      >
                        {KNOWN_STATUSES.has(enrollment.status)
                          ? tStatus(enrollment.status)
                          : enrollment.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-launch-gradient-horizontal transition-all"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold tabular-nums text-foreground">
                          {enrollment.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {dateFormatter.format(new Date(enrollment.enrolledAt))}
                    </td>
                    <td className="px-5 py-3 text-end">
                      <button
                        type="button"
                        onClick={() => setConfirmUserId(enrollment.userId)}
                        disabled={isPending}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        title={tActions("remove")}
                        aria-label={tActions("remove")}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmUserId !== null}
        title={tConfirm("title")}
        description={tConfirm("body")}
        confirmLabel={tConfirm("confirm")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleUnenroll}
        onCancel={() => setConfirmUserId(null)}
        variant="destructive"
        loading={isPending}
      />
    </div>
  );
}
