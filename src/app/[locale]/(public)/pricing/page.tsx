import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, ChevronDown, Shield, Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pricing | Schulab",
  description:
    "Simple, transparent pricing for Schulab. Free, Pro, and School plans for STEM education.",
};

export default function PricingPage() {
  const t = useTranslations("pricing");

  const plans = [
    { key: "free", featured: false, href: "/register" },
    { key: "pro", featured: true, href: "/register" },
    { key: "school", featured: false, href: "/contact?subject=School%20Plan%20Inquiry" },
  ] as const;

  const faqs = t.raw("faq") as { q: string; a: string }[];

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
            <span className="text-launch-gradient">Simple, honest pricing</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#34d399]/15 px-4 py-2 text-sm font-medium text-[#047857]">
            <Shield className="h-4 w-4" />
            {t("guarantee")}
          </div>
        </div>
      </section>

      {/* Plans */}
      <div className="mx-auto mt-4 grid max-w-5xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        {plans.map((plan) => {
          const features = t.raw(`${plan.key}.features`) as string[];

          return (
            <Card
              key={plan.key}
              className={`relative flex flex-col transition-all hover-lift ${
                plan.featured
                  ? "ring-launch-gradient shadow-xl md:-translate-y-4"
                  : "border hover:shadow-md"
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
                <CardTitle className="font-display text-xl">{t(`${plan.key}.name`)}</CardTitle>
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
                  {features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.featured ? "text-[#ff8a3d]" : "text-[#34d399]"}`} />
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
                  className={`flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    plan.featured
                      ? "bg-launch-gradient text-white shadow-lg hover:shadow-xl"
                      : "border border-input bg-background hover:bg-muted"
                  }`}
                >
                  {t(`${plan.key}.cta`)}
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Pricing FAQ */}
      <div className="mx-auto mt-20 mb-16 max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center font-display text-3xl font-bold">{t("faqTitle")}</h2>
        <div className="divide-y rounded-2xl border bg-card shadow-sm">
          {faqs.map((faq, i) => (
            <details key={i} className="group">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium hover:bg-muted/50">
                <span>{faq.q}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
