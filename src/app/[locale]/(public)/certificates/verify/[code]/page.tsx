import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Award,
  CheckCircle2,
  XCircle,
  Shield,
  Download,
  Share2,
  Calendar,
} from "lucide-react";
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

export default async function VerifyCertificatePage({
  params,
}: VerifyPageProps) {
  const { code } = await params;
  const [t, locale, cert] = await Promise.all([
    getTranslations("certificates"),
    getLocale(),
    verifyCertificate(code),
  ]);

  // ── Not-found state ─────────────────────────────────────────────
  if (!cert) {
    return (
      <div className="relative overflow-hidden bg-muted/20">
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="card-premium p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
              <XCircle className="h-8 w-8 text-red-600" aria-hidden />
            </div>
            <h1 className="mt-5 font-display text-2xl font-extrabold text-foreground">
              {t("notFoundTitle")}
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {t("notFoundBody")}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 font-mono text-xs text-destructive">
              {t("codeLabel", { code })}
            </div>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                {t("backToHome")}
              </Link>
            </div>
          </div>
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
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-launch-gradient-soft py-12 sm:py-16">
        <div className="aurora-bg opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/30 shadow-lg">
            <CheckCircle2
              className="h-8 w-8 text-emerald-600"
              aria-hidden
            />
          </div>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t("authentic")}
          </h1>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <Shield className="h-3.5 w-3.5" aria-hidden />
            {t("verified")}
          </p>
        </div>
      </section>

      {/* Certificate metadata card */}
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="card-premium relative overflow-hidden p-8">
          {/* Accent band */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1 bg-launch-gradient-horizontal"
          />

          {/* Certificate visual header */}
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-launch-gradient-soft">
              <Award className="h-6 w-6 text-primary" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Certificate of completion
              </p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">
                Schulab Academy
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="divider-soft my-6" aria-hidden />

          {/* Metadata */}
          <dl className="space-y-5 text-sm">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("awardedTo")}
              </dt>
              <dd className="mt-1 font-display text-2xl font-bold text-foreground">
                {cert.user.name ?? t("learner")}
              </dd>
            </div>

            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("courseLabel")}
              </dt>
              <dd className="mt-1 font-display text-lg font-semibold text-foreground">
                {cert.title ?? "—"}
              </dd>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-xl bg-muted/40 p-4 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <Calendar
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden
                />
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("issuedOn", { date: "" }).replace(/:?\s*$/, "")}
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-foreground">
                    {issuedDate}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                  aria-hidden
                />
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("certificateId")}
                  </dt>
                  <dd className="mt-0.5 font-mono text-xs font-semibold text-foreground">
                    {cert.code}
                  </dd>
                </div>
              </div>
            </div>
          </dl>

          {/* Action row */}
          <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
            <a
              href={`/api/certificates/${cert.code}/download`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-launch-gradient px-4 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4" aria-hidden />
              Download PDF
            </a>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-input bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Share2 className="h-4 w-4" aria-hidden />
              Share
            </button>
            <Link
              href="/"
              className="ms-auto inline-flex h-10 items-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {t("learnMore")}
            </Link>
          </div>
        </div>

        {/* Trust footer */}
        <div className="mt-6 text-center">
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" aria-hidden />
            This certificate is tamper-proof and verifiable at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
