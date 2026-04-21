"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { adminEnrollUser, adminUnenrollUser } from "@/actions/enrollment.actions";
import { useRouter } from "@/i18n/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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

const KNOWN_STATUSES = new Set(["ACTIVE", "COMPLETED", "CANCELLED", "EXPIRED"]);

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

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    EXPIRED: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {t("heading", { count: enrollments.length })}
        </h2>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
        >
          {showAddForm ? tCommon("cancel") : `+ ${t("enrollStudent")}`}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleEnroll} className="flex gap-2 items-start">
          <div className="flex-1">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("userIdPlaceholder")}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              required
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {isPending ? t("enrollingButton") : t("enrollButton")}
          </button>
        </form>
      )}

      {enrollments.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          {t("emptyMessage")}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2.5 text-start font-medium">{t("studentCol")}</th>
                <th className="px-4 py-2.5 text-start font-medium">{tCommon("status")}</th>
                <th className="px-4 py-2.5 text-start font-medium">{t("progressCol")}</th>
                <th className="px-4 py-2.5 text-start font-medium">{t("enrolledCol")}</th>
                <th className="px-4 py-2.5 text-end font-medium">{tCommon("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{enrollment.user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {enrollment.user.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusColors[enrollment.status] ?? "bg-gray-100"
                      }`}
                    >
                      {KNOWN_STATUSES.has(enrollment.status)
                        ? tStatus(enrollment.status)
                        : enrollment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {enrollment.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {dateFormatter.format(new Date(enrollment.enrolledAt))}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      onClick={() => setConfirmUserId(enrollment.userId)}
                      disabled={isPending}
                      className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                    >
                      {tActions("remove")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
