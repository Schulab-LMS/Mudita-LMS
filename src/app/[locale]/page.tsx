import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  RocketIllustration,
  RobotIllustration,
  AtomIllustration,
  CodeBracketsIllustration,
  PlanetIllustration,
  MathIllustration,
  DnaIllustration,
  FloatingStar,
} from "@/components/illustrations/stem-icons";
import {
  GraduationCap,
  BookOpen,
  BarChart3,
  Globe,
  Search,
  Trophy,
  Video,
  Wrench,
  Gamepad2,
  ArrowRight,
  Quote,
  Building2,
  Monitor,
  Sparkles,
  Shield,
  Star,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Schulab — Joyful STEM Learning for Children Ages 3–18",
  description:
    "Interactive STEM courses, live expert tutoring, and hands-on science kits for children ages 3 to 18. Available in English, Arabic, and German.",
};

const stats = [
  { value: "5,000+", key: "students", icon: GraduationCap, color: "text-[var(--stem-space)]" },
  { value: "120+", key: "courses", icon: BookOpen, color: "text-[var(--stem-science)]" },
  { value: "50+", key: "tutors", icon: Star, color: "text-[var(--stem-math)]" },
  { value: "30+", key: "countries", icon: Globe, color: "text-[var(--stem-rocket)]" },
];

const ageGroups = [
  {
    range: "3–5",
    label: "Early Learners",
    gradient: "from-pink-100 to-pink-50",
    border: "border-pink-200 hover:border-pink-400",
    tagColor: "bg-pink-100 text-pink-700",
    illustration: "rocket",
    description: "Play-based discovery with colors, shapes & sounds",
  },
  {
    range: "6–8",
    label: "Kids",
    gradient: "from-blue-100 to-blue-50",
    border: "border-blue-200 hover:border-blue-400",
    tagColor: "bg-blue-100 text-blue-700",
    illustration: "robot",
    description: "Hands-on experiments and beginner coding",
  },
  {
    range: "9–12",
    label: "Juniors",
    gradient: "from-emerald-100 to-emerald-50",
    border: "border-emerald-200 hover:border-emerald-400",
    tagColor: "bg-emerald-100 text-emerald-700",
    illustration: "code",
    description: "Build apps, robots & run science projects",
  },
  {
    range: "13–18",
    label: "Teens",
    gradient: "from-purple-100 to-purple-50",
    border: "border-purple-200 hover:border-purple-400",
    tagColor: "bg-purple-100 text-purple-700",
    illustration: "atom",
    description: "Advanced topics, competitions & career prep",
  },
];

const howSteps = [
  { num: "1", icon: Search, titleKey: "howStep1Title", descKey: "howStep1Desc", color: "bg-[var(--stem-space)]" },
  { num: "2", icon: BookOpen, titleKey: "howStep2Title", descKey: "howStep2Desc", color: "bg-[var(--stem-robot)]" },
  { num: "3", icon: Trophy, titleKey: "howStep3Title", descKey: "howStep3Desc", color: "bg-[var(--stem-math)]" },
];

const differentiators = [
  { icon: Video, titleKey: "whyReason1Title", descKey: "whyReason1Desc", color: "text-[var(--stem-science)]", bg: "bg-cyan-50", border: "border-cyan-200" },
  { icon: Wrench, titleKey: "whyReason2Title", descKey: "whyReason2Desc", color: "text-[var(--stem-robot)]", bg: "bg-purple-50", border: "border-purple-200" },
  { icon: BarChart3, titleKey: "whyReason3Title", descKey: "whyReason3Desc", color: "text-[var(--stem-code)]", bg: "bg-emerald-50", border: "border-emerald-200" },
  { icon: Globe, titleKey: "whyReason4Title", descKey: "whyReason4Desc", color: "text-[var(--stem-math)]", bg: "bg-amber-50", border: "border-amber-200" },
];

const testimonials = [
  { quoteKey: "testimonial1Quote", nameKey: "testimonial1Name", roleKey: "testimonial1Role" },
  { quoteKey: "testimonial2Quote", nameKey: "testimonial2Name", roleKey: "testimonial2Role" },
  { quoteKey: "testimonial3Quote", nameKey: "testimonial3Name", roleKey: "testimonial3Role" },
];

function AgeGroupIllustration({ type, size }: { type: string; size: number }) {
  switch (type) {
    case "rocket": return <RocketIllustration size={size} />;
    case "robot": return <RobotIllustration size={size} />;
    case "code": return <CodeBracketsIllustration size={size} />;
    case "atom": return <AtomIllustration size={size} />;
    default: return null;
  }
}

export default function HomePage() {
  const t = useTranslations("home");
  const tc = useTranslations("common");

  return (
    <div className="flex flex-col">
      <Navbar />

      {/* Hero Section — STEM Space Theme */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Floating decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          <FloatingStar size={28} className="absolute top-16 left-[10%] animate-float opacity-40" />
          <FloatingStar size={18} className="absolute top-32 right-[15%] animate-float-delayed opacity-30" />
          <FloatingStar size={22} className="absolute bottom-20 left-[20%] animate-float-slow opacity-25" />
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[var(--stem-space)] opacity-[0.04] blur-3xl" />
          <div className="absolute top-1/2 -left-20 h-48 w-48 rounded-full bg-[var(--stem-robot)] opacity-[0.04] blur-3xl" />
          <div className="absolute -bottom-20 right-1/3 h-52 w-52 rounded-full bg-[var(--stem-rocket)] opacity-[0.03] blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — Text */}
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-1.5 text-sm font-semibold shadow-sm">
                <Sparkles className="h-4 w-4 text-[var(--stem-rocket)]" />
                <span className="text-launch-gradient">{tc("tagline")}</span>
              </div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {t("heroTitle")}
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
                {t("heroSubtitle")}
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  href="/courses"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-launch-gradient px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover-lift"
                >
                  {t("heroCta")}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-border px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {t("heroCtaSecondary")}
                </Link>
              </div>
              {/* Trust badges under CTA */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground lg:justify-start">
                <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-green-500" /> Child-Safe & COPPA Compliant</span>
                <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-amber-500" /> No Credit Card Required</span>
              </div>
            </div>

            {/* Right — STEM Illustrations Collage */}
            <div className="relative mx-auto hidden h-[400px] w-full max-w-lg lg:block">
              <div className="absolute top-0 left-1/2 -translate-x-1/2">
                <RocketIllustration size={140} />
              </div>
              <div className="absolute bottom-8 left-4">
                <RobotIllustration size={120} />
              </div>
              <div className="absolute right-0 bottom-12">
                <AtomIllustration size={110} />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <PlanetIllustration size={80} className="opacity-40" />
              </div>
              {/* Scattered small stars */}
              <FloatingStar size={16} className="absolute top-4 right-8 animate-sparkle" />
              <FloatingStar size={12} className="absolute bottom-4 left-24 animate-sparkle" style={{ animationDelay: "1s" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats — Card style */}
      <section className="relative -mt-8 z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.key}
                className="card-stem flex flex-col items-center p-6 text-center animate-slide-up"
              >
                <stat.icon className={`h-7 w-7 ${stat.color} mb-2`} />
                <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t(`stats.${stat.key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              {t("howItWorks")}
            </h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {howSteps.map((step, i) => (
              <div key={step.num} className="group relative text-center">
                {/* Connector line */}
                {i < howSteps.length - 1 && (
                  <div className="absolute top-8 left-[calc(50%+40px)] hidden h-0.5 w-[calc(100%-80px)] bg-launch-gradient-horizontal opacity-40 md:block" />
                )}
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} text-2xl font-bold text-white shadow-lg transition-transform group-hover:scale-110`}>
                  {step.num}
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-foreground">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t(step.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Age Groups — with STEM illustrations */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">{t("ageGroups")}</h2>
            <p className="mt-4 text-muted-foreground">{t("ageGroupsSubtitle")}</p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ageGroups.map((group) => (
              <Link
                key={group.range}
                href="/courses"
                className={`group flex flex-col items-center rounded-3xl border-2 bg-gradient-to-b ${group.gradient} ${group.border} p-8 text-center transition-all hover:shadow-xl hover-lift`}
              >
                <div className="mb-4">
                  <AgeGroupIllustration type={group.illustration} size={90} />
                </div>
                <span className={`inline-block rounded-full px-4 py-1 text-sm font-bold ${group.tagColor}`}>
                  Ages {group.range}
                </span>
                <span className="mt-2 font-display text-lg font-semibold text-foreground">
                  {group.label}
                </span>
                <span className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {group.description}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Schulab Different */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold text-foreground sm:text-4xl">
            {t("whySchulab")}
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {differentiators.map((item) => (
              <div key={item.titleKey} className={`card-stem p-8 hover-lift`}>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} border ${item.border}`}>
                  <item.icon className={`h-7 w-7 ${item.color}`} />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{t(item.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold text-foreground sm:text-4xl">
            {t("testimonials")}
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.nameKey}
                className="card-stem p-8 hover-lift"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground italic">
                  &ldquo;{t(item.quoteKey)}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-launch-gradient font-bold text-white shadow-sm">
                    {t(item.nameKey).charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t(item.nameKey)}</p>
                    <p className="text-xs text-muted-foreground">{t(item.roleKey)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Schools Teaser — with illustration */}
      <section className="relative overflow-hidden bg-foreground py-24 text-white">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <div className="bg-stem-grid absolute inset-0" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80">
                <Building2 className="h-4 w-4" />
                B2B Solutions
              </div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">{t("forSchools")}</h2>
              <p className="mt-4 text-lg text-white/70">{t("forSchoolsDesc")}</p>
              <Link
                href="/for-schools"
                className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-foreground transition-all hover:bg-white/90 hover:shadow-lg"
              >
                {t("forSchoolsCta")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Monitor, label: "Admin Dashboard", color: "text-cyan-300" },
                { icon: GraduationCap, label: "120+ Courses", color: "text-amber-300" },
                { icon: BarChart3, label: "Analytics & Reports", color: "text-emerald-300" },
                { icon: Gamepad2, label: "Gamified Learning", color: "text-pink-300" },
              ].map((feature) => (
                <div
                  key={feature.label}
                  className="rounded-2xl bg-white/10 p-6 backdrop-blur transition-colors hover:bg-white/15"
                >
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  <p className="mt-3 text-sm font-medium text-white/80">{feature.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — Gradient with illustration */}
      <section className="relative overflow-hidden bg-launch-gradient py-24">
        <div className="pointer-events-none absolute inset-0">
          <FloatingStar size={20} className="absolute top-8 left-[10%] animate-float opacity-30" />
          <FloatingStar size={14} className="absolute top-20 right-[20%] animate-float-slow opacity-20" />
          <FloatingStar size={18} className="absolute bottom-8 left-[30%] animate-float-delayed opacity-25" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <RocketIllustration size={80} className="mx-auto mb-6 opacity-80" />
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">{t("ctaTitle")}</h2>
          <p className="mt-4 text-lg text-white/80">{t("ctaSubtitle")}</p>
          <Link
            href="/register"
            className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary shadow-lg transition-all hover:bg-white/95 hover:shadow-xl"
          >
            {t("ctaButton")}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
