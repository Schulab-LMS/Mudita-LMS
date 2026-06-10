import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import {
  ChevronDown,
  Shield,
  Sparkles,
  Zap,
  Check,
  X,
  Minus,
} from "lucide-react";
import { FloatingStar } from "@/components/illustrations/stem-icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { GradientText } from "@/components/ui/gradient-text";
import { AuroraBlobs } from "@/components/ui/aurora-blobs";
import { TestimonialCard } from "@/components/shared/testimonial-card";
import { paymentsEnabled } from "@/lib/flags";
import { PricingTiers } from "./pricing-tiers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pricing");
  return {
    title: `${t("title")} | Schulab`,
    description: t("subtitle"),
  };
}

type Cell = boolean | string | "—";
type ValueKey =
  | "payPerKit"
  | "off10"
  | "bulkPricing"
  | "twoFree"
  | "twoPerChild"
  | "bespoke"
  | "included"
  | "limited"
  | "full"
  | "advanced"
  | "advancedReports"
  | "one"
  | "twoToThreePlus"
  | "unlimited";

type CellSpec = boolean | ValueKey | "—";

interface Row {
  labelKey: string;
  basic: CellSpec;
  family: CellSpec;
  school: CellSpec;
}

interface Group {
  groupKey: string;
  rows: Row[];
}

const comparisonMatrix: Group[] = [
  {
    groupKey: "learning",
    rows: [
      { labelKey: "freeCourses", basic: true, family: true, school: true },
      { labelKey: "premiumCourses", basic: true, family: true, school: true },
      { labelKey: "stemKits", basic: "off10", family: "off10", school: "bulkPricing" },
      { labelKey: "liveTutoring", basic: "twoFree", family: "twoPerChild", school: "bespoke" },
      { labelKey: "catalogAccess", basic: "full", family: "full", school: "full" },
    ],
  },
  {
    groupKey: "accountsAccess",
    rows: [
      { labelKey: "studentAccounts", basic: "one", family: "twoToThreePlus", school: "unlimited" },
      { labelKey: "parentDashboard", basic: true, family: true, school: true },
      { labelKey: "bulkEnrollment", basic: false, family: false, school: true },
      { labelKey: "customBranding", basic: false, family: false, school: true },
      { labelKey: "apiAccess", basic: false, family: false, school: true },
    ],
  },
  {
    groupKey: "progressRewards",
    rows: [
      { labelKey: "progressTracking", basic: "advanced", family: "advanced", school: "advancedReports" },
      { labelKey: "certificates", basic: true, family: true, school: true },
      { labelKey: "badgesXp", basic: true, family: true, school: true },
      { labelKey: "leaderboards", basic: true, family: true, school: true },
    ],
  },
  {
    groupKey: "support",
    rows: [
      { labelKey: "community", basic: true, family: true, school: true },
      { labelKey: "email", basic: true, family: true, school: true },
      { labelKey: "priority", basic: false, family: true, school: true },
      { labelKey: "accountManager", basic: false, family: false, school: true },
      { labelKey: "teacherTraining", basic: false, family: false, school: true },
    ],
  },
];

const pricingTestimonials = [
  {
    quote:
      "We tried three platforms before Schulab. None compared. Pro pays for itself the first week — no exaggeration.",
    author: "Lina O.",
    role: "Parent of two, ages 7 & 11",
    initials: "LO",
    tone: "indigo" as const,
  },
  {
    quote:
      "The school plan paid for itself in saved curriculum time. Onboarding was a single afternoon.",
    author: "Tom Liang",
    role: "Curriculum Lead, Bright Future Schools",
    initials: "TL",
    tone: "orange" as const,
  },
];

function CellRender({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#34d399]/15">
        <Check className="h-4 w-4 text-[#34d399]" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted">
        <X className="h-4 w-4 text-muted-foreground/50" />
      </span>
    );
  }
  if (value === "—") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted">
        <Minus className="h-4 w-4 text-muted-foreground/50" />
      </span>
    );
  }
  return (
    <span className="text-sm font-medium text-foreground/80">{value}</span>
  );
}

function resolveCell(
  spec: CellSpec,
  tVal: (key: ValueKey) => string
): Cell {
  if (typeof spec === "boolean" || spec === "—") return spec;
  return tVal(spec);
}

export default function PricingPage() {
  // Server-only flag (this is a Server Component). During the payments-off beta we
  // suppress purchase-specific trust copy (refund / cancel-anytime) since nothing is
  // being sold yet; PricingTiers handles the per-card reframe.
  const payments = paymentsEnabled();
  const t = useTranslations("pricing");
  const tGroup = useTranslations("pricing.comparison.groups") as (
    key: string
  ) => string;
  const tRow = useTranslations("pricing.comparison.rows") as (
    key: string
  ) => string;
  const tVal = useTranslations("pricing.comparison.values") as (
    key: ValueKey
  ) => string;
  const faqs = t.raw("faq") as { q: string; a: string }[];

  // "Cancel anytime" / "14-day refund" only make sense once we sell. In the
  // payments-off beta, lead with the early-access promise instead.
  const trustPoints = payments
    ? [
        { icon: Shield, title: t("trustCancelTitle"), text: t("trustCancelBody") },
        { icon: Sparkles, title: t("trustRefundTitle"), text: t("trustRefundBody") },
        { icon: Zap, title: t("trustInstantTitle"), text: t("trustInstantBody") },
      ]
    : [
        { icon: Sparkles, title: t("earlyAccess.trustFreeTitle"), text: t("earlyAccess.trustFreeBody") },
        { icon: Shield, title: t("earlyAccess.trustNoCardTitle"), text: t("earlyAccess.trustNoCardBody") },
        { icon: Zap, title: t("trustInstantTitle"), text: t("trustInstantBody") },
      ];

  return (
    <div>
      {/* === Hero === */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 py-20 sm:py-24">
        <AuroraBlobs variant="hero" />
        <div className="pointer-events-none absolute inset-0 bg-stem-grid-fade opacity-40" />
        <div className="pointer-events-none absolute inset-0">
          <FloatingStar size={24} className="absolute top-10 start-[10%] animate-float opacity-40" />
          <FloatingStar size={16} className="absolute top-24 end-[12%] animate-float-delayed opacity-30" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal mode="scale">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-[var(--stem-rocket)]" />
              <GradientText animated>{t("simpleHonestPricing")}</GradientText>
            </div>
          </ScrollReveal>
          <ScrollReveal mode="up" delay={80}>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
          </ScrollReveal>
          <ScrollReveal mode="fade" delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              {payments ? t("subtitle") : t("earlyAccess.subtitle")}
            </p>
          </ScrollReveal>
          <ScrollReveal mode="fade" delay={240}>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#34d399]/15 px-4 py-2 text-sm font-medium text-[#047857] ring-1 ring-[#34d399]/30">
              <Shield className="h-4 w-4" />
              {payments ? t("guarantee") : t("earlyAccess.guarantee")}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* === Plans (client) === */}
      <section className="mx-auto -mt-8 max-w-5xl px-4 sm:px-6 lg:px-8">
        <PricingTiers paymentsEnabled={payments} />
      </section>

      {/* === Trust strip === */}
      <section className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {trustPoints.map((trust, i) => (
            <ScrollReveal key={trust.title} mode="up" delay={i * 90}>
              <div className="card-stem flex items-start gap-4 p-5 hover-lift">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-launch-gradient-soft">
                  <trust.icon className="h-5 w-5 text-[#4f3ff0]" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{trust.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {trust.text}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* === Comparison matrix === */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
              {t("planComparison")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              {t("compareEveryFeature")}
            </h2>
          </div>
        </ScrollReveal>

        {/* Desktop table */}
        <ScrollReveal mode="fade" delay={120}>
          <div className="mt-12 hidden overflow-hidden rounded-3xl border border-border/60 bg-white shadow-elev md:block">
            {/* Header */}
            <div className="sticky top-0 grid grid-cols-[2fr_1fr_1.2fr_1fr] items-center gap-4 border-b border-border/60 bg-white/95 px-6 py-5 backdrop-blur">
              <div></div>
              <div className="text-center">
                <div className="font-display text-base font-bold">
                  {t("basic.name")}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {payments ? t("basic.headerPrice") : t("earlyAccess.free")}
                </div>
              </div>
              <div className="rounded-2xl bg-launch-gradient-soft px-3 py-2 text-center ring-2 ring-[#4f3ff0]/20">
                <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[#ff8a3d]">
                  <Sparkles className="h-3 w-3" />
                  {t("mostPopular")}
                </div>
                <div className="mt-1 font-display text-base font-bold">
                  {t("family.name")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {payments ? t("family.headerPrice") : t("earlyAccess.free")}
                </div>
              </div>
              <div className="text-center">
                <div className="font-display text-base font-bold">
                  {t("school.name")}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {t("custom")}
                </div>
              </div>
            </div>

            {/* Groups */}
            {comparisonMatrix.map((group) => (
              <div key={group.groupKey}>
                <div className="bg-muted/30 px-6 py-3">
                  <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#4f3ff0]">
                    {tGroup(group.groupKey)}
                  </p>
                </div>
                {group.rows.map((row, i) => (
                  <div
                    key={row.labelKey}
                    className={`grid grid-cols-[2fr_1fr_1.2fr_1fr] items-center gap-4 px-6 py-4 ${
                      i % 2 === 1 ? "bg-muted/20" : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-foreground/90">
                      {tRow(row.labelKey)}
                    </span>
                    <div className="flex justify-center">
                      <CellRender value={resolveCell(row.basic, (k) => tVal(k))} />
                    </div>
                    <div className="flex justify-center">
                      <CellRender value={resolveCell(row.family, (k) => tVal(k))} />
                    </div>
                    <div className="flex justify-center">
                      <CellRender value={resolveCell(row.school, (k) => tVal(k))} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Mobile stacked */}
        <div className="mt-10 space-y-6 md:hidden">
          {(["basic", "family", "school"] as const).map((planKey) => (
            <ScrollReveal key={planKey} mode="up">
              <div
                className={`rounded-2xl border p-5 shadow-sm ${
                  planKey === "family"
                    ? "border-[#4f3ff0]/40 bg-launch-gradient-soft"
                    : "border-border bg-white"
                }`}
              >
                <p className="font-display text-lg font-bold">
                  {t(`${planKey}.name`)}
                </p>
                <ul className="mt-4 space-y-3">
                  {comparisonMatrix.flatMap((g) =>
                    g.rows.map((row) => (
                      <li
                        key={`${g.groupKey}-${row.labelKey}`}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <span className="text-foreground/80">
                          {tRow(row.labelKey)}
                        </span>
                        <CellRender value={resolveCell(row[planKey], (k) => tVal(k))} />
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* === Testimonials === */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
              {t("worthEveryPenny")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              {t("fromFamiliesSchools")}
            </h2>
          </div>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {pricingTestimonials.map((tst, i) => (
            <ScrollReveal key={tst.author} mode="up" delay={i * 100}>
              <TestimonialCard {...tst} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* === FAQ === */}
      <section className="mx-auto mt-24 mb-16 max-w-3xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
              {t("faqTitle")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              {t("faqTitle")}
            </h2>
          </div>
        </ScrollReveal>
        <ScrollReveal mode="fade" delay={100}>
          <div className="mt-10 divide-y rounded-3xl border bg-card shadow-elev overflow-hidden">
            {faqs.map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 font-display font-semibold transition-colors hover:bg-muted/40">
                  <span>{faq.q}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/60 transition-transform group-open:rotate-180 group-open:bg-[#4f3ff0] group-open:text-white">
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </summary>
                <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
