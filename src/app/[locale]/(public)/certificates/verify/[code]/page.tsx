import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Award, CheckCircle2, XCircle } from "lucide-react";
import { verifyCertificate } from "@/services/certificate.service";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("certificates");
  return {
    title: t("verifyPageTitle"),
    description: t("verifyPageDescription"),
  };
}

interface VerifyPageProps {
  params: Promise<{ code: string }>;
}

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { code } = await params;
  const [t, locale, cert] = await Promise.all([
    getTranslations("certificates"),
    getLocale(),
    verifyCertificate(code),
  ]);

  if (!cert) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold">
            {t("notFoundTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("notFoundBody")}
          </p>
          <p className="mt-6 font-mono text-xs text-muted-foreground">
            {t("codeLabel", { code })}
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center rounded-lg border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            {t("backToHome")}
          </Link>
        </div>
      </div>
    );
  }

  const issuedDate = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(cert.issuedAt));

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#34d399]/15">
            <CheckCircle2 className="h-6 w-6 text-[#34d399]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#047857]">
              {t("verified")}
            </p>
            <h1 className="font-display text-xl font-bold">
              {t("authentic")}
            </h1>
          </div>
        </div>

        <dl className="mt-8 space-y-5 border-t pt-6 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("awardedTo")}
            </dt>
            <dd className="mt-1 font-display text-lg font-semibold">
              {cert.user.name ?? t("learner")}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("courseLabel")}
            </dt>
            <dd className="mt-1 font-display text-lg font-semibold">
              {cert.course?.title ?? "—"}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-[#4f3ff0]" />
            <span className="text-muted-foreground">
              {t("issuedOn", { date: issuedDate })}
            </span>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("certificateId")}
            </dt>
            <dd className="mt-1 font-mono text-sm">{cert.code}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3 border-t pt-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            {t("learnMore")}
          </Link>
        </div>
      </div>
    </div>
  );
}
