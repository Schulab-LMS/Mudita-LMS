import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { GradientText } from "@/components/ui/gradient-text";
import { AuroraBlobs } from "@/components/ui/aurora-blobs";
import { TrustedBy } from "@/components/shared/trusted-by";
import {
  RocketIllustration,
  RobotIllustration,
  AtomIllustration,
  CodeBracketsIllustration,
  PlanetIllustration,
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
  Building2,
  Monitor,
  Sparkles,
  Shield,
  Star,
  Zap,
  Play,
  Flame,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Schulab — Joyful STEM Learning for Children Ages 3–18",
  description:
    "Interactive STEM courses, live expert tutoring, and hands-on science kits for children ages 3 to 18. Available in English, Arabic, and German.",
};

const stats = [
  {
    value: 5000,
    suffix: "+",
    key: "students",
    icon: GraduationCap,
    color: "text-[var(--stem-space)]",
  },
  {
    value: 120,
    suffix: "+",
    key: "courses",
    icon: BookOpen,
    color: "text-[var(--stem-science)]",
  },
  {
    value: 50,
    suffix: "+",
    key: "tutors",
    icon: Star,
    color: "text-[var(--stem-math)]",
  },
  {
    value: 30,
    suffix: "+",
    key: "countries",
    icon: Globe,
    color: "text-[var(--stem-rocket)]",
  },
];

const ageGroups = [
  {
    range: "3–5",
    ageGroup: "AGES_3_5",
    label: "Early Learners",
    gradient: "from-pink-100 to-pink-50",
    border: "border-pink-200 hover:border-pink-400",
    tagColor: "bg-pink-100 text-pink-700",
    illustration: "rocket",
    description: "Play-based discovery with colors, shapes & sounds",
  },
  {
    range: "6–8",
    ageGroup: "AGES_6_8",
    label: "Kids",
    gradient: "from-blue-100 to-blue-50",
    border: "border-blue-200 hover:border-blue-400",
    tagColor: "bg-blue-100 text-blue-700",
    illustration: "robot",
    description: "Hands-on experiments and beginner coding",
  },
  {
    range: "9–12",
    ageGroup: "AGES_9_12",
    label: "Juniors",
    gradient: "from-emerald-100 to-emerald-50",
    border: "border-emerald-200 hover:border-emerald-400",
    tagColor: "bg-emerald-100 text-emerald-700",
    illustration: "code",
    description: "Build apps, robots & run science projects",
  },
  {
    range: "13–18",
    ageGroup: "AGES_13_15",
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

      {/* =============== HERO =============== */}
      <section className="relative overflow-hidden">
        {/* Ambient color blobs */}
        <AuroraBlobs variant="hero" />
        {/* Faded grid */}
        <div aria-hidden className="bg-stem-grid-fade absolute inset-0 opacity-70" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            {/* Left — Text */}
            <div className="text-center lg:text-left">
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-4 py-1.5 text-sm font-semibold shadow-sm animate-slide-down"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--stem-rocket)] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--stem-rocket)]" />
                </span>
                <GradientText animated className="font-bold">
                  {tc("tagline")}
                </GradientText>
              </div>

              <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[4rem] lg:leading-[1.05] animate-slide-up">
                {t("heroTitle")}
              </h1>
              <p
                className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl animate-slide-up"
                style={{ animationDelay: "120ms" }}
              >
                {t("heroSubtitle")}
              </p>

              <div
                className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start animate-slide-up"
                style={{ animationDelay: "220ms" }}
              >
                <Link
                  href="/courses"
                  className="shine hover-blastoff group inline-flex items-center gap-2 rounded-2xl bg-launch-gradient px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-12px_rgba(79,63,240,0.5)]"
                >
                  <span className="icon-rocket inline-flex">
                    <Zap className="h-5 w-5" />
                  </span>
                  {t("heroCta")}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="group inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-white/80 px-8 py-4 text-base font-semibold text-foreground backdrop-blur transition-all hover:border-foreground/30 hover:bg-white"
                >
                  <Play className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                  {t("heroCtaSecondary")}
                </Link>
              </div>

              {/* Trust badges */}
              <div
                className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground lg:justify-start animate-slide-up"
                style={{ animationDelay: "320ms" }}
              >
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  Child-Safe & COPPA Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                  No Credit Card Required
                </span>
                <span className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  Daily streaks & XP
                </span>
              </div>
            </div>

            {/* Right — Orbit scene */}
            <div className="relative mx-auto hidden aspect-square w-full max-w-lg lg:block">
              {/* Halo rings */}
              <div aria-hidden className="absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/20" />
                <div className="absolute left-1/2 top-1/2 h-[65%] w-[65%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[var(--stem-rocket)]/20" />
                <div className="absolute left-1/2 top-1/2 h-[45%] w-[45%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[var(--stem-robot)]/20" />
              </div>

              {/* Center planet */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <PlanetIllustration size={180} />
              </div>

              {/* Rocket, top */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-4 animate-float">
                <RocketIllustration size={120} />
              </div>
              {/* Robot, bottom left */}
              <div className="absolute bottom-4 left-2 animate-float-slow">
                <RobotIllustration size={110} />
              </div>
              {/* Atom, bottom right */}
              <div className="absolute right-0 bottom-12 animate-float-delayed">
                <AtomIllustration size={100} />
              </div>

              {/* Floating UI preview card — "Live quest" */}
              <div className="absolute top-8 -left-6 rounded-2xl bg-white p-3 shadow-hero ring-1 ring-black/5 animate-float-delayed">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">7-day streak!</p>
                    <p className="text-[10px] text-muted-foreground">+120 XP today</p>
                  </div>
                </div>
              </div>

              {/* Floating UI preview card — "Badge earned" */}
              <div className="absolute bottom-24 -right-4 rounded-2xl bg-white p-3 shadow-hero ring-1 ring-black/5 animate-float">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-purple-600 text-white">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Badge unlocked</p>
                    <p className="text-[10px] text-muted-foreground">Code Ninja I</p>
                  </div>
                </div>
              </div>

              {/* Stars */}
              <FloatingStar size={18} className="absolute top-4 right-20 animate-sparkle" />
              <FloatingStar size={14} className="absolute bottom-4 left-28 animate-sparkle" style={{ animationDelay: "1s" }} />
              <FloatingStar size={22} className="absolute top-1/2 right-2 animate-sparkle" style={{ animationDelay: "1.8s" }} />
            </div>
          </div>
        </div>
      </section>

      {/* =============== STATS =============== */}
      <section className="relative -mt-8 z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal
            mode="up"
            className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <div
                key={stat.key}
                className="card-stem flex flex-col items-center p-6 text-center shadow-elev"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <stat.icon className={`h-7 w-7 ${stat.color} mb-2`} />
                <p className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(`stats.${stat.key}`)}
                </p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* =============== TRUSTED BY =============== */}
      <div className="mt-20">
        <TrustedBy />
      </div>

      {/* =============== HOW IT WORKS =============== */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <span className="tag-chip">
              <Sparkles className="h-3.5 w-3.5" /> How it works
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              {t("howItWorks")}
            </h2>
          </ScrollReveal>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {howSteps.map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 120} className="group relative text-center">
                {i < howSteps.length - 1 && (
                  <div className="absolute top-8 left-[calc(50%+40px)] hidden h-0.5 w-[calc(100%-80px)] bg-launch-gradient-horizontal opacity-40 md:block" />
                )}
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} text-2xl font-bold text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}
                >
                  {step.num}
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-foreground">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t(step.descKey)}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =============== AGE GROUPS =============== */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              {t("ageGroups")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("ageGroupsSubtitle")}</p>
          </ScrollReveal>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ageGroups.map((group, i) => (
              <ScrollReveal key={group.range} delay={i * 100} mode="scale">
                <Link
                  href={{ pathname: "/courses", query: { ageGroup: group.ageGroup } }}
                  className={`group flex h-full flex-col items-center rounded-3xl border-2 bg-gradient-to-b ${group.gradient} ${group.border} p-8 text-center transition-all hover:shadow-xl hover:-translate-y-1`}
                >
                  <div className="mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =============== WHY SCHULAB =============== */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              {t("whySchulab")}
            </h2>
          </ScrollReveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {differentiators.map((item, i) => (
              <ScrollReveal key={item.titleKey} delay={i * 90} mode="up">
                <div className="card-stem relative h-full p-8 transition-transform hover:-translate-y-1">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} border ${item.border}`}>
                    <item.icon className={`h-7 w-7 ${item.color}`} />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                    {t(item.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(item.descKey)}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =============== TESTIMONIALS =============== */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              {t("testimonials")}
            </h2>
          </ScrollReveal>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {testimonials.map((item, i) => (
              <ScrollReveal key={item.nameKey} delay={i * 120}>
                <div className="card-stem h-full p-8 transition-transform hover:-translate-y-1">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, k) => (
                      <Star key={k} className="h-4 w-4 fill-amber-400 text-amber-400" />
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
                      <p className="text-sm font-semibold text-foreground">
                        {t(item.nameKey)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t(item.roleKey)}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =============== FOR SCHOOLS =============== */}
      <section className="relative overflow-hidden bg-foreground py-24 text-white bg-noise">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-10">
          <div className="bg-stem-grid absolute inset-0" />
        </div>
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#4f3ff0]/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#ff8a3d]/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <ScrollReveal mode="left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur ring-1 ring-white/10">
                <Building2 className="h-4 w-4" />
                B2B Solutions
              </div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                {t("forSchools")}
              </h2>
              <p className="mt-4 text-lg text-white/70">
                {t("forSchoolsDesc")}
              </p>
              <Link
                href="/for-schools"
                className="shine group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                {t("forSchoolsCta")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </ScrollReveal>
            <ScrollReveal mode="right">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Monitor, label: "Admin Dashboard", color: "text-cyan-300" },
                  { icon: GraduationCap, label: "120+ Courses", color: "text-amber-300" },
                  { icon: BarChart3, label: "Analytics & Reports", color: "text-emerald-300" },
                  { icon: Gamepad2, label: "Gamified Learning", color: "text-pink-300" },
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:bg-white/10"
                  >
                    <feature.icon
                      className={`h-7 w-7 ${feature.color} transition-transform group-hover:scale-110`}
                    />
                    <p className="mt-3 text-sm font-medium text-white/80">
                      {feature.label}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* =============== FINAL CTA =============== */}
      <section className="relative overflow-hidden bg-launch-gradient-animated py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <FloatingStar size={20} className="absolute top-8 left-[10%] animate-float opacity-40" />
          <FloatingStar size={14} className="absolute top-20 right-[20%] animate-float-slow opacity-30" />
          <FloatingStar size={18} className="absolute bottom-8 left-[30%] animate-float-delayed opacity-35" />
          <FloatingStar size={12} className="absolute bottom-20 right-[10%] animate-sparkle opacity-30" />
        </div>
        <ScrollReveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <RocketIllustration size={80} className="mx-auto mb-6 opacity-90" />
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {t("ctaTitle")}
          </h2>
          <p className="mt-4 text-lg text-white/85">
            {t("ctaSubtitle")}
          </p>
          <Link
            href="/register"
            className="shine group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
          >
            {t("ctaButton")}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
