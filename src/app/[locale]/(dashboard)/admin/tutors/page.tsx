import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";
import { VerifyTutorButton, RejectTutorButton, DeleteTutorButton } from "./tutor-actions";

export async function generateMetadata() {
  const t = await getTranslations("admin.tutors");
  return { title: `${t("pageTitle")} | Schulab` };
}

export default async function AdminTutorsPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  const [t, tCommon, locale] = await Promise.all([
    getTranslations("admin.tutors"),
    getTranslations("admin.common"),
    getLocale(),
  ]);

  let tutors: Awaited<ReturnType<typeof db.tutorProfile.findMany<{
    include: { user: { select: { name: true; email: true } } };
  }>>> = [];
  try {
    tutors = await db.tutorProfile.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { isVerified: "asc" },
    });
  } catch { /* db error */ }

  const pending = tutors.filter((x) => !x.isVerified);
  const verified = tutors.filter((x) => x.isVerified);

  const languageNames = new Intl.DisplayNames(locale, { type: "language" });
  function formatLangs(codes: string[]) {
    return codes
      .map((code) => {
        try {
          return languageNames.of(code) ?? code;
        } catch {
          return code;
        }
      })
      .join(", ");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("pageTitle")}</h1>
        <p className="text-muted-foreground">
          {t("subtitleCounts", {
            pending: pending.length,
            verified: verified.length,
            total: tutors.length,
          })}
        </p>
      </div>

      {/* Pending Applications */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-amber-700">{t("pendingHeading")}</h2>
          <div className="space-y-3">
            {pending.map((tutor) => (
              <div key={tutor.id} className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{tutor.user.name}</h3>
                      <Badge variant="secondary">{t("pendingBadge")}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tutor.user.email}</p>
                    {tutor.headline && (
                      <p className="text-sm font-medium">{tutor.headline}</p>
                    )}
                    {tutor.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{tutor.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {tutor.subjects.map((s) => (
                        <span key={s} className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 pt-1 text-sm text-muted-foreground">
                      <span>{t("hourlyRate", { rate: String(tutor.hourlyRate) })}</span>
                      <span>{formatLangs(tutor.languages)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <VerifyTutorButton tutorId={tutor.id} />
                    <RejectTutorButton tutorId={tutor.id} />
                    <DeleteTutorButton tutorId={tutor.id} name={tutor.user.name ?? t("fallbackName")} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Tutors */}
      {verified.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-700">{t("verifiedHeading")}</h2>
          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">{t("tutorCol")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("subjectsCol")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("rateCol")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("ratingCol")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("sessionsCol")}</th>
                  <th className="px-4 py-3 text-end font-medium">{tCommon("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {verified.map((tutor) => (
                  <tr key={tutor.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{tutor.user.name}</p>
                        <p className="text-xs text-muted-foreground">{tutor.user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects.map((s) => (
                          <span key={s} className="rounded bg-muted px-1.5 py-0.5 text-xs">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">{t("hourlyRate", { rate: String(tutor.hourlyRate) })}</td>
                    <td className="px-4 py-3">{t("ratingValue", { rating: String(tutor.rating) })}</td>
                    <td className="px-4 py-3">{tutor.totalSessions}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <RejectTutorButton tutorId={tutor.id} />
                        <DeleteTutorButton tutorId={tutor.id} name={tutor.user.name ?? t("fallbackName")} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tutors.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <GraduationCap className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{t("emptyMessage")}</p>
        </div>
      )}
    </div>
  );
}
