"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Check,
  Sparkles,
  ArrowRight,
  Rocket,
  Users,
  GraduationCap,
  Zap,
  BookOpen,
  Star,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { BillingToggle, type BillingCycle } from "@/components/shared/billing-toggle";

type SubKey = "basic" | "family" | "school";
type PackKey = "single" | "pack4" | "pack8";

interface SubPlan {
  key: SubKey;
  featured: boolean;
  href: string;
  monthlyEur: number | null;
  secondaryMonthlyEur?: number;
  accent: string;
  ringColor: string;
  Icon: typeof Rocket;
}

const subPlans: SubPlan[] = [
  {
    key: "basic",
    featured: false,
    href: "/register?plan=solo",
    monthlyEur: 49,
    accent: "text-[#4f3ff0]",
    ringColor: "from-[#4f3ff0]/20 to-[#8b5cf6]/20",
    Icon: Rocket,
  },
  {
    key: "family",
    featured: true,
    href: "/register?plan=family",
    monthlyEur: 88,
    secondaryMonthlyEur: 118,
    accent: "text-[#ff8a3d]",
    ringColor: "from-[#ff8a3d]/30 to-[#ef4444]/30",
    Icon: Users,
  },
  {
    key: "school",
    featured: false,
    href: "/contact?subject=Custom%20Plan%20Inquiry",
    monthlyEur: null,
    accent: "text-[#8b5cf6]",
    ringColor: "from-[#8b5cf6]/20 to-[#ec4899]/20",
    Icon: GraduationCap,
  },
];

interface Pack {
  key: PackKey;
  priceEur: number;
  sessions: number;
  featured: boolean;
  href: string;
  accent: string;
  ringColor: string;
  Icon: typeof Zap;
}

const packs: Pack[] = [
  {
    key: "single",
    priceEur: 25,
    sessions: 1,
    featured: false,
    href: "/tutors",
    accent: "text-[#4f3ff0]",
    ringColor: "from-[#4f3ff0]/15 to-[#8b5cf6]/15",
    Icon: Zap,
  },
  {
    key: "pack4",
    priceEur: 90,
    sessions: 4,
    featured: false,
    href: "/tutors?pack=4",
    accent: "text-[#ff8a3d]",
    ringColor: "from-[#ff8a3d]/15 to-[#ef4444]/15",
    Icon: BookOpen,
  },
  {
    key: "pack8",
    priceEur: 160,
    sessions: 8,
    featured: true,
    href: "/tutors?pack=8",
    accent: "text-[#ec4899]",
    ringColor: "from-[#ec4899]/20 to-[#ff8a3d]/20",
    Icon: Star,
  },
];

const SINGLE_SESSION_EUR = 25;

function formatEur(locale: string, amount: number, decimals = 0): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(amount);
}

// During the payments-off beta, every purchase CTA routes to free registration
// instead of a checkout we can't fulfil. Custom/school still routes to contact.
const BETA_SUB_HREF: Record<SubKey, string> = {
  basic: "/register?plan=solo",
  family: "/register?plan=family",
  school: "/contact?subject=Custom%20Plan%20Inquiry",
};

export function PricingTiers({ paymentsEnabled }: { paymentsEnabled: boolean }) {
  const t = useTranslations("pricing");
  const locale = useLocale();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <div className="space-y-20">
      {/* ============ SUBSCRIPTIONS ============ */}
      <section>
        <ScrollReveal mode="up">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#4f3ff0]">
              {t("subscriptionsLabel")}
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              {t("subscriptionsTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              {t("subscriptionsSubtitle")}
            </p>
          </div>
        </ScrollReveal>

        {paymentsEnabled && (
          <ScrollReveal mode="up" delay={80}>
            <div className="mt-8 flex justify-center">
              <BillingToggle value={cycle} onChange={setCycle} />
            </div>
          </ScrollReveal>
        )}

        <div className="mt-10 grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
          {subPlans.map((plan, i) => {
            const features = t.raw(`${plan.key}.features`) as string[];
            const Icon = plan.Icon;

            let priceValue: string;
            let periodLabel: string;
            let secondaryLine: React.ReactNode = null;
            let annualSavings: React.ReactNode = null;
            const isCustom = plan.monthlyEur === null;
            // In the payments-off beta, paid tiers read "Free / Early access" and
            // route to registration; Custom still routes to contact sales.
            const betaFree = !paymentsEnabled && !isCustom;
            const href = paymentsEnabled ? plan.href : BETA_SUB_HREF[plan.key];

            if (betaFree) {
              priceValue = t("earlyAccess.free");
              periodLabel = t("earlyAccess.freePeriod");
            } else if (plan.monthlyEur === null) {
              priceValue = t("custom");
              periodLabel = t(`${plan.key}.period`);
            } else {
              const monthly = plan.monthlyEur;
              const display =
                cycle === "annual" ? Math.round(monthly * 0.8) : monthly;
              priceValue = formatEur(locale, display);
              periodLabel = `/ ${t("perMonth")}`;

              if (plan.secondaryMonthlyEur) {
                const secondary = plan.secondaryMonthlyEur;
                const secDisplay =
                  cycle === "annual"
                    ? Math.round(secondary * 0.8)
                    : secondary;
                secondaryLine = (
                  <p className="text-xs text-muted-foreground">
                    {t("family.secondaryLine", {
                      price: formatEur(locale, secDisplay),
                    })}
                  </p>
                );
              }

              if (cycle === "annual") {
                annualSavings = (
                  <p className="text-xs font-semibold text-[#047857]">
                    {t("billedYearlySave", {
                      billed: formatEur(locale, Math.round(monthly * 0.8) * 12),
                      save: formatEur(
                        locale,
                        monthly * 12 - Math.round(monthly * 0.8) * 12
                      ),
                    })}
                  </p>
                );
              }
            }

            return (
              <ScrollReveal key={plan.key} mode="up" delay={i * 100} className="h-full">
                {/* Wrapper: relative + non-clipping, holds the "Most Popular" ribbon
                    so it's never cut by the card's own overflow: hidden. */}
                <div
                  className={`relative h-full ${plan.featured ? "md:-translate-y-4" : ""}`}
                >
                  {plan.featured && (
                    <div className="pointer-events-none absolute -top-3 inset-x-0 z-10 flex justify-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-launch-gradient px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                        <Sparkles className="h-3 w-3" />
                        {t("mostPopular")}
                      </span>
                    </div>
                  )}

                  <Card
                    className={`relative flex h-full flex-col overflow-hidden transition-all hover-lift shine ${
                      plan.featured
                        ? "ring-launch-gradient shadow-hero bg-gradient-to-b from-white to-indigo-50/30"
                        : "border hover:shadow-elev"
                    }`}
                  >
                    <CardHeader className="text-center">
                      <div
                        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${plan.ringColor}`}
                      >
                        <Icon className={`h-6 w-6 ${plan.accent}`} />
                      </div>
                      <CardTitle className="mt-4 font-display text-xl">
                        {t(`${plan.key}.name`)}
                      </CardTitle>
                      {/* Reserve 2 lines so taglines of any length keep the
                          icons/prices below visually aligned across cards. */}
                      <p className="mt-1 min-h-[2.5rem] text-xs text-muted-foreground">
                        {t(`${plan.key}.tagline`)}
                      </p>

                      {/* Price block — fixed min-height so all three cards
                          show their price at the same baseline regardless of
                          whether a secondary line / annual-savings line is
                          rendered. */}
                      <div className="mt-4 flex min-h-[8rem] flex-col items-center justify-start gap-1">
                        {!isCustom && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#34d399]/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#047857]">
                            <Sparkles className="h-3 w-3" />
                            {betaFree ? t("earlyAccess.badge") : t("firstSessionFree")}
                          </span>
                        )}
                        <div className="flex items-baseline justify-center gap-1 whitespace-nowrap">
                          <span
                            className={`font-display font-extrabold leading-none ${
                              isCustom ? "text-4xl sm:text-5xl" : "text-5xl"
                            } ${plan.featured ? "text-launch-gradient" : ""}`}
                          >
                            {priceValue}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {periodLabel}
                          </span>
                        </div>
                        {secondaryLine}
                        {annualSavings}
                        {!isCustom && (
                          <p className="text-[11px] text-muted-foreground">
                            {betaFree ? t("earlyAccess.cardNote") : t("autoRenewNote")}
                          </p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1">
                      <ul className="space-y-3">
                        {features.map((feature, idx) => (
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
                        href={href}
                        className={`group/cta flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                          plan.featured
                            ? "bg-launch-gradient text-white shadow-lg hover:shadow-xl hover-blastoff"
                            : "border border-input bg-background hover:bg-muted hover-lift"
                        }`}
                      >
                        {betaFree ? t("earlyAccess.cta") : t(`${plan.key}.cta`)}
                        <ArrowRight className="h-4 w-4 rtl:rotate-180 transition-transform group-hover/cta:translate-x-1 rtl:group-hover/cta:-translate-x-1" />
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ============ 1:1 TUTORING ============ */}
      <section>
        <ScrollReveal mode="up">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ff8a3d]">
              {t("tutoringLabel")}
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              {t("tutoringTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              {t("tutoringSubtitle")}
            </p>
            {!paymentsEnabled && (
              <div className="mx-auto mt-4 inline-flex items-center gap-1 rounded-full bg-[#34d399]/15 px-3 py-1 text-xs font-semibold text-[#047857] ring-1 ring-[#34d399]/30">
                <Sparkles className="h-3 w-3" />
                {t("earlyAccess.tutoringNote")}
              </div>
            )}
          </div>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
          {packs.map((pack, i) => {
            const features = t.raw(`tutoring.${pack.key}.features`) as string[];
            const perSession = pack.priceEur / pack.sessions;
            const perSessionDecimals = perSession % 1 === 0 ? 0 : 2;
            const savings = SINGLE_SESSION_EUR * pack.sessions - pack.priceEur;
            const Icon = pack.Icon;

            return (
              <ScrollReveal key={pack.key} mode="up" delay={i * 100} className="h-full">
                <div className={`relative h-full ${pack.featured ? "md:-translate-y-2" : ""}`}>
                  {pack.featured && (
                    <div className="pointer-events-none absolute -top-3 inset-x-0 z-10 flex justify-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#ec4899] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                        <Sparkles className="h-3 w-3" />
                        {t("bestValue")}
                      </span>
                    </div>
                  )}

                  <Card
                    className={`relative flex h-full flex-col overflow-hidden transition-all hover-lift ${
                      pack.featured
                        ? "ring-2 ring-[#ec4899]/40 shadow-elev bg-gradient-to-b from-white to-pink-50/40"
                        : "border hover:shadow-elev"
                    }`}
                  >
                    <CardHeader className="text-center">
                      <div
                        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${pack.ringColor}`}
                      >
                        <Icon className={`h-6 w-6 ${pack.accent}`} />
                      </div>
                      <CardTitle className="mt-4 font-display text-xl">
                        {t(`tutoring.${pack.key}.name`)}
                      </CardTitle>
                      {/* Reserved price block — same min-height across all 3 cards.
                          In the payments-off beta we don't show buyable € prices;
                          the section note already says sessions are free in early access. */}
                      <div className="mt-4 flex min-h-[7.5rem] flex-col items-center justify-start gap-1">
                        {paymentsEnabled ? (
                          <>
                            <span className="font-display text-5xl font-extrabold leading-none">
                              {formatEur(locale, pack.priceEur)}
                            </span>
                            <p className={`text-sm font-semibold ${pack.accent}`}>
                              {t("perSession", {
                                price: formatEur(
                                  locale,
                                  perSession,
                                  perSessionDecimals
                                ),
                              })}
                            </p>
                            {savings > 0 && (
                              <p className="inline-flex items-center rounded-full bg-[#34d399]/15 px-2.5 py-0.5 text-xs font-bold text-[#047857]">
                                {t("saveAmount", {
                                  amount: formatEur(locale, savings),
                                })}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="font-display text-4xl font-extrabold leading-none">
                              {t("earlyAccess.free")}
                            </span>
                            <p className={`text-sm font-semibold ${pack.accent}`}>
                              {t("earlyAccess.freePeriod")}
                            </p>
                          </>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1">
                      <ul className="space-y-3">
                        {features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#34d399]/15">
                              <Check className="h-3 w-3 text-[#34d399]" />
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
                        href={pack.href}
                        className={`group/cta flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                          pack.featured
                            ? "bg-[#ec4899] text-white shadow-lg hover:shadow-xl hover-blastoff"
                            : "border border-input bg-background hover:bg-muted hover-lift"
                        }`}
                      >
                        {t(`tutoring.${pack.key}.cta`)}
                        <ArrowRight className="h-4 w-4 rtl:rotate-180 transition-transform group-hover/cta:translate-x-1 rtl:group-hover/cta:-translate-x-1" />
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal mode="fade" delay={200}>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {t("tutoringFootnote")}
          </p>
        </ScrollReveal>
      </section>
    </div>
  );
}
