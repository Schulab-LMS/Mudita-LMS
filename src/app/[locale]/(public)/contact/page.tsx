import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import {
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Loader2,
  Clock,
  Building2,
  LifeBuoy,
  Newspaper,
  ArrowRight,
} from "lucide-react";
import { ContactForm } from "./contact-form";

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-launch-gradient-soft py-14 sm:py-20">
        <div className="aurora-bg opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden />
            <span className="text-launch-gradient">Get in touch</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{t("subtitle")}</p>

          {/* SLA chip */}
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            Typically replies within 24 hours
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Intent tiles */}
        <div className="-mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <IntentTile
            icon={<Building2 className="h-5 w-5" />}
            title="Sales & schools"
            description="Bulk licenses, custom onboarding, enterprise integrations."
            email="sales@schulab.com"
            tone="primary"
          />
          <IntentTile
            icon={<LifeBuoy className="h-5 w-5" />}
            title="Support"
            description="Help with your account, courses, billing, or devices."
            email="support@schulab.com"
            tone="secondary"
          />
          <IntentTile
            icon={<Newspaper className="h-5 w-5" />}
            title="Press & partnerships"
            description="Media inquiries, events, brand assets, collaboration."
            email="press@schulab.com"
            tone="accent"
          />
        </div>

        {/* Main grid */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Contact form */}
          <div className="card-premium p-6 sm:p-8 lg:col-span-2">
            <h2 className="font-display text-xl font-bold text-foreground">
              Send us a message
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us what you&apos;re looking for. We read every message.
            </p>
            <div className="mt-6">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center p-8">
                    <Loader2
                      className="h-8 w-8 animate-spin text-muted-foreground"
                      aria-hidden
                    />
                  </div>
                }
              >
                <ContactForm />
              </Suspense>
            </div>
          </div>

          {/* Contact info sidebar */}
          <div className="space-y-3">
            <InfoCard
              icon={<Mail className="h-5 w-5" />}
              title={t("info.emailTitle")}
              value={t("info.email")}
              tone="primary"
            />
            <InfoCard
              icon={<Phone className="h-5 w-5" />}
              title={t("info.phoneTitle")}
              value={t("info.phone")}
              tone="secondary"
            />
            <InfoCard
              icon={<MapPin className="h-5 w-5" />}
              title={t("info.addressTitle")}
              value={t("info.address")}
              tone="accent"
            />

            {/* Office hours card */}
            <div className="card-premium p-5">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Clock className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Office hours
                  </h3>
                  <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between gap-3">
                      <dt>Monday–Friday</dt>
                      <dd className="font-semibold text-foreground">
                        9:00 – 18:00 CET
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt>Saturday</dt>
                      <dd className="font-semibold text-foreground">
                        10:00 – 14:00 CET
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt>Sunday</dt>
                      <dd className="text-muted-foreground">Closed</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntentTile({
  icon,
  title,
  description,
  email,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  email: string;
  tone: "primary" | "secondary" | "accent";
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <a
      href={`mailto:${email}`}
      className="card-premium group flex items-start gap-3 p-5 transition-all hover:-translate-y-0.5"
    >
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
          {email}
          <ArrowRight
            className="h-3 w-3 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
            aria-hidden
          />
        </p>
      </div>
    </a>
  );
}

function InfoCard({
  icon,
  title,
  value,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  tone: "primary" | "secondary" | "accent";
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <div className="card-premium flex items-start gap-3 p-5">
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-sm font-semibold text-foreground">
          {title}
        </h3>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}
