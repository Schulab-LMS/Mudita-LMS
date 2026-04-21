import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getCertificates } from "@/services/certificate.service";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata() {
  const t = await getTranslations("certificates");
  return { title: `${t("studentTitle")} | Schulab` };
}

function formatIssuedDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default async function StudentCertificatesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [t, locale, certificates] = await Promise.all([
    getTranslations("certificates"),
    getLocale(),
    getCertificates(session.user.id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("studentTitle")}</h1>
        <p className="text-muted-foreground">
          {t("studentCount", { count: certificates.length })}
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-5xl">🎓</p>
          <p className="mt-3 text-lg font-medium">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("emptyBody")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
                <span className="text-5xl">🎓</span>
              </div>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-base leading-tight">
                  {cert.course.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("issuedOn", { date: formatIssuedDate(cert.issuedAt, locale) })}
                </p>
                <div className="rounded-md bg-muted px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-1">{t("verificationCode")}</p>
                  <code className="text-xs font-mono font-semibold tracking-wide">
                    {cert.code}
                  </code>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/api/certificates/${cert.code}/download`}
                    target="_blank"
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                  >
                    {t("viewAndPrint")}
                  </a>
                  <a
                    href={`/verify/${cert.code}`}
                    target="_blank"
                    className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    {t("verify")}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
