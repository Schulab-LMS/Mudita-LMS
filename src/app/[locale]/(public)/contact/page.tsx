import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Mail, Phone, MapPin, Sparkles, Loader2 } from "lucide-react";
import { ContactForm } from "./contact-form";

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#4f3ff0] opacity-[0.05] blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#ff8a3d] opacity-[0.05] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-1.5 text-sm font-semibold shadow-sm">
            <Sparkles className="h-4 w-4 text-[var(--stem-rocket)]" />
            <span className="text-launch-gradient">Get in touch</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <ContactForm />
            </Suspense>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover-lift">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4f3ff0]/10">
                <Mail className="h-5 w-5 text-[#4f3ff0]" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{t("info.emailTitle")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("info.email")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover-lift">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8b5cf6]/10">
                <Phone className="h-5 w-5 text-[#8b5cf6]" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{t("info.phoneTitle")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("info.phone")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover-lift">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ff8a3d]/10">
                <MapPin className="h-5 w-5 text-[#ff8a3d]" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{t("info.addressTitle")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("info.address")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
