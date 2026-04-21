import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { RevokeCertificateButton, IssueCertificateForm } from "./certificate-actions";
import { GraduationCap, ExternalLink } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("admin.certificatesList");
  return { title: `${t("pageTitle")} | Schulab` };
}

export default async function AdminCertificatesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const [t, tCommon, locale] = await Promise.all([
    getTranslations("admin.certificatesList"),
    getTranslations("admin.common"),
    getLocale(),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const certificates = await db.certificate.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { issuedAt: "desc" },
  }).catch(() => []);

  const courseIds = [...new Set(certificates.map((c) => c.courseId))];
  const courses = await db.course.findMany({
    where: { id: { in: courseIds } },
    select: { id: true, title: true, slug: true },
  }).catch(() => []);
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("pageTitle")}</h1>
        <p className="text-muted-foreground">
          {t("issuedCount", { count: certificates.length })}
        </p>
      </div>

      {/* Manual Issue */}
      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("issueManuallyHeading")}
        </h2>
        <IssueCertificateForm />
      </div>

      {/* Certificates table */}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("studentCol")}</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("courseCol")}</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("codeCol")}</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("issuedCol")}</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("linksCol")}</th>
              <th className="px-4 py-3 text-end font-medium text-muted-foreground">{tCommon("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {certificates.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  <GraduationCap className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  {t("emptyMessage")}
                </td>
              </tr>
            ) : (
              certificates.map((cert) => {
                const course = courseMap.get(cert.courseId);
                return (
                  <tr key={cert.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{cert.user.name}</div>
                      <div className="text-xs text-muted-foreground">{cert.user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{course?.title || t("unknownCourse")}</div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                        {cert.code}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {dateFormatter.format(new Date(cert.issuedAt))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`/api/certificates/${cert.code}/download`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          {t("downloadLink")} <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="text-muted-foreground">|</span>
                        <a
                          href={`/verify/${cert.code}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          {t("verifyLink")} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <RevokeCertificateButton certificateId={cert.id} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
