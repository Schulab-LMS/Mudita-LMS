import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, ChevronDown, Shield, Sparkles, Zap } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { FloatingStar } from "@/components/illustrations/stem-icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { GradientText } from "@/components/ui/gradient-text";
import { AuroraBlobs } from "@/components/ui/aurora-blobs";

export const metadata: Metadata = {
  title: "Pricing | Schulab",
  description:
    "Simple, transparent pricing for Schulab. Free, Pro, and School plans for STEM education.",
};

export default function PricingPage() {
  const t = useTranslations("pricing");

  const plans = [
    {
      key: "free",
      featured: false,
      href: "/register",
      accent: "text-[#4f3ff0]",
      accentBg: "bg-[#4f3ff0]/10",
    },
    {
      key: "pro",
      featured: true,
      href: "/register",
      accent: "text-[#ff8a3d]",
      accentBg: "bg-[#ff8a3d]/10",
    },
    {
      key: "school",
      featured: false,
      href: "/contact?subject=School%20Plan%20Inquiry",
      accent: "text-[#8b5cf6]",
      accentBg: "bg-[#8b5cf6]/10",
    },
  ] as const;

  const faqs = t.raw("faq") as { q: string; a: string }[];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 py-20">
        <AuroraBlobs variant="hero" />
        <div className="pointer-events-none absolute inset-0 bg-stem-grid-fade opacity-40" />
        <div className="pointer-events-none absolute inset-0">
          <FloatingStar size={24} className="absolute top-10 left-[10%] animate-float opacity-40" />
          <FloatingStar size={16} className="absolute top-24 right-[12%] animate-float-delayed opacity-30" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal mode="scale">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-[var(--stem-rocket)]" />
              <GradientText animated>Simple, honest pricing</GradientText>
            </div>
          </ScrollReveal>
          <ScrollReveal mode="up" delay={80}>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
          </ScrollReveal>
          <ScrollReveal mode="fade" delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              {t("subtitle")}
            </p>
          </ScrollReveal>
          <ScrollReveal mode="fade" delay={240}>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#34d399]/15 px-4 py-2 text-sm font-medium text-[#047857] ring-1 ring-[#34d399]/30">
              <Shield className="h-4 w-4" />
              {t("guarantee")}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Plans */}
      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        {plans.map((plan, i) => {
          const features = t.raw(`${plan.key}.features`) as string[];

          return (
            <ScrollReveal key={plan.key} mode="up" delay={i * 120}>
              <Card
                className={`relative flex h-full flex-col transition-all hover-lift shine ${
                  plan.featured
                    ? "ring-launch-gradient shadow-hero md:-translate-y-4 bg-gradient-to-b from-white to-indigo-50/30"
                    : "border hover:shadow-elev"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-launch-gradient px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${plan.accentBg}`}>
                    <Zap className={`h-6 w-6 ${plan.accent}`} />
                  </div>
                  <CardTitle className="mt-4 font-display text-xl">{t(`${plan.key}.name`)}</CardTitle>
                  <div className="mt-4">
                    <span className={`font-display text-5xl font-extrabold ${plan.featured ? "text-launch-gradient" : ""}`}>
                      {t(`${plan.key}.price`)}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}/ {t(`${plan.key}.period`)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${plan.featured ? "bg-[#ff8a3d]/15" : "bg-[#34d399]/15"}`}>
                          <Check className={`h-3 w-3 ${plan.featured ? "text-[#ff8a3d]" : "text-[#34d399]"}`} />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Link
                    href={plan.href}
                    className={`group/cta flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                      plan.featured
                        ? "bg-launch-gradient text-white shadow-lg hover:shadow-xl hover-blastoff"
                        : "border border-input bg-background hover:bg-muted hover-lift"
                    }`}
                  >
                    {t(`${plan.key}.cta`)}
                  </Link>
                </CardFooter>
              </Card>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Trust strip */}
      <section className="mx-auto mt-20 max-w-5xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="fade">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { icon: Shield, title: "Cancel anytime", text: "No contracts. Cancel with one click." },
              { icon: Sparkles, title: "14-day refund", text: "Not a fit? Full money back within 14 days." },
              { icon: Zap, title: "Instant access", text: "Start learning the moment you sign up." },
            ].map((trust, i) => (
              <ScrollReveal key={trust.title} mode="up" delay={i * 90}>
                <div className="card-stem flex items-start gap-4 p-5 hover-lift">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-launch-gradient-soft">
                    <trust.icon className="h-5 w-5 text-[#4f3ff0]" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">{trust.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{trust.text}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Pricing FAQ */}
      <div className="mx-auto mt-20 mb-16 max-w-3xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <h2 className="mb-8 text-center font-display text-3xl font-bold">{t("faqTitle")}</h2>
        </ScrollReveal>
        <ScrollReveal mode="fade" delay={100}>
          <div className="divide-y rounded-2xl border bg-card shadow-elev overflow-hidden">
            {faqs.map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium transition-colors hover:bg-muted/50">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
