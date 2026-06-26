import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getCertificates } from "@/services/certificate.service";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import { Award, Download, ExternalLink, Calendar, Share2 } from "lucide-react";

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
    <div className="space-y-6">
      <PageHeader
        title={t("studentTitle")}
        description={t("studentCount", { count: certificates.length })}
        breadcrumbs={[{ label: "Certificates" }]}
        icon={<Award className="h-5 w-5" />}
      />

      {certificates.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title={t("emptyTitle")}
          description={t("emptyBody")}
          action={{ label: "Browse courses", href: "/courses" }}
          tone="first-use"
          size="lg"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="card-premium group relative overflow-hidden"
            >
              {/* Gradient top band */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 bg-launch-gradient-horizontal"
              />

              {/* Visual header */}
              <div className="relative flex h-36 items-center justify-center overflow-hidden bg-launch-gradient-soft">
                <div className="rounded-2xl bg-white/80 p-4 shadow-soft ring-1 ring-border backdrop-blur">
                  <Award className="h-10 w-10 text-primary" aria-hidden />
                </div>
              </div>

              <div className="space-y-3 p-5">
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {cert.kind === "bundle" ? "Bundle" : "Course"}
                </span>
                <h3 className="line-clamp-2 font-display font-semibold leading-tight text-foreground">
                  {cert.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  {t("issuedOn", {
                    date: formatIssuedDate(cert.issuedAt, locale),
                  })}
                </div>

                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("verificationCode")}
                  </p>
                  <code className="mt-0.5 block truncate font-mono text-xs font-semibold tracking-wide text-foreground">
                    {cert.code}
                  </code>
                </div>

                <div className="flex gap-2 pt-1">
                  <a
                    href={`/api/certificates/${cert.code}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-launch-gradient px-3 py-2 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden />
                    {t("viewAndPrint")}
                  </a>
                  <a
                    href={`/verify/${cert.code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-2.5 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title={t("verify")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-2.5 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Share"
                  >
                    <Share2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
