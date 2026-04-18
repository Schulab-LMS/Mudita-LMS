"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, Sparkles, Zap, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { BillingToggle, type BillingCycle } from "@/components/shared/billing-toggle";

interface Plan {
  key: "free" | "pro" | "school";
  featured: boolean;
  href: string;
  monthlyUsd: number | null; // null = custom pricing
  accent: string;
  accentBg: string;
  ringColor: string;
}

const plans: Plan[] = [
  {
    key: "free",
    featured: false,
    href: "/register",
    monthlyUsd: 0,
    accent: "text-[#4f3ff0]",
    accentBg: "bg-[#4f3ff0]/10",
    ringColor: "from-[#4f3ff0]/20 to-[#8b5cf6]/20",
  },
  {
    key: "pro",
    featured: true,
    href: "/register",
    monthlyUsd: 19,
    accent: "text-[#ff8a3d]",
    accentBg: "bg-[#ff8a3d]/10",
    ringColor: "from-[#ff8a3d]/30 to-[#ef4444]/30",
  },
  {
    key: "school",
    featured: false,
    href: "/contact?subject=School%20Plan%20Inquiry",
    monthlyUsd: null,
    accent: "text-[#8b5cf6]",
    accentBg: "bg-[#8b5cf6]/10",
    ringColor: "from-[#8b5cf6]/20 to-[#ec4899]/20",
  },
];

export function PricingTiers() {
  const t = useTranslations("pricing");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <>
      {/* Billing toggle */}
      <ScrollReveal mode="up">
        <div className="flex justify-center">
          <BillingToggle value={cycle} onChange={setCycle} />
        </div>
      </ScrollReveal>

      {/* Plans */}
      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan, i) => {
          const features = t.raw(`${plan.key}.features`) as string[];

          // Compute price label based on cycle (annual = 20% off)
          let priceNode: React.ReactNode;
          let periodLabel: string;
          if (plan.monthlyUsd === null) {
            priceNode = "Custom";
            periodLabel = t(`${plan.key}.period`);
          } else if (plan.monthlyUsd === 0) {
            priceNode = "$0";
            periodLabel = "forever";
          } else {
            const display =
              cycle === "annual"
                ? Math.round(plan.monthlyUsd * 0.8)
                : plan.monthlyUsd;
            priceNode = `$${display}`;
            periodLabel = "per month";
          }

          return (
            <ScrollReveal key={plan.key} mode="up" delay={i * 100}>
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
                  <div
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${plan.ringColor}`}
                  >
                    <Zap className={`h-6 w-6 ${plan.accent}`} />
                  </div>
                  <CardTitle className="mt-4 font-display text-xl">
                    {t(`${plan.key}.name`)}
                  </CardTitle>
                  <div className="mt-4">
                    <span
                      className={`font-display text-5xl font-extrabold ${
                        plan.featured ? "text-launch-gradient" : ""
                      }`}
                    >
                      {priceNode}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      / {periodLabel}
                    </span>
                  </div>
                  {plan.monthlyUsd !== null &&
                    plan.monthlyUsd > 0 &&
                    cycle === "annual" && (
                      <p className="mt-1 text-xs font-semibold text-[#047857]">
                        Billed ${Math.round(plan.monthlyUsd * 0.8 * 12)} yearly •
                        Save ${plan.monthlyUsd * 12 - Math.round(plan.monthlyUsd * 0.8) * 12}
                      </p>
                    )}
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            plan.featured
                              ? "bg-[#ff8a3d]/15"
                              : "bg-[#34d399]/15"
                          }`}
                        >
                          <Check
                            className={`h-3 w-3 ${
                              plan.featured
                                ? "text-[#ff8a3d]"
                                : "text-[#34d399]"
                            }`}
                          />
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
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
                  </Link>
                </CardFooter>
              </Card>
            </ScrollReveal>
          );
        })}
      </div>
    </>
  );
}
