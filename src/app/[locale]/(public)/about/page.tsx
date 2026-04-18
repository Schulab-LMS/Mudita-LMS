import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  User,
  Heart,
  Globe,
  Shield,
  Sparkles,
  ArrowRight,
  Mail,
  ExternalLink,
  Quote,
  Trophy,
  GraduationCap,
} from "lucide-react";
import {
  FloatingStar,
  RocketIllustration,
  AtomIllustration,
  PlanetIllustration,
  RobotIllustration,
} from "@/components/illustrations/stem-icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { GradientText } from "@/components/ui/gradient-text";
import { AuroraBlobs } from "@/components/ui/aurora-blobs";
import { TestimonialCard } from "@/components/shared/testimonial-card";

export const metadata: Metadata = {
  title: "About Us | Schulab",
  description:
    "Learn about Schulab's mission, vision, team, and approach to joyful STEM education for children ages 3-18.",
};

const team = [
  {
    nameKey: "team.member1.name",
    roleKey: "team.member1.role",
    initials: "AM",
    tone: "from-[#4f3ff0] to-[#8b5cf6]",
  },
  {
    nameKey: "team.member2.name",
    roleKey: "team.member2.role",
    initials: "SR",
    tone: "from-[#8b5cf6] to-[#ff8a3d]",
  },
  {
    nameKey: "team.member3.name",
    roleKey: "team.member3.role",
    initials: "JK",
    tone: "from-[#ff8a3d] to-[#34d399]",
  },
];

const impactStats = [
  { value: 5000, suffix: "+", labelKey: "impact.stat1Label" },
  { value: 120, suffix: "+", labelKey: "impact.stat2Label" },
  { value: 30, suffix: "+", labelKey: "impact.stat3Label" },
  { value: 92, suffix: "%", labelKey: "impact.stat4Label" },
];

const pressLogos = [
  "TechCrunch",
  "Forbes Education",
  "EdSurge",
  "Wired Kids",
  "ParentsCo",
  "STEM Today",
];

const testimonials = [
  {
    quote:
      "My daughter went from asking when screen time ends to begging for one more lesson. The way Schulab teaches science is the closest I've seen to actual magic.",
    author: "Maya K.",
    role: "Parent of Lina, age 9",
    initials: "MK",
    tone: "indigo" as const,
  },
  {
    quote:
      "We rolled it out to 240 students across three grades. Engagement on STEM modules jumped dramatically — and our teachers love the dashboard.",
    author: "Daniel Reyes",
    role: "Principal, Olive Tree Academy",
    initials: "DR",
    tone: "orange" as const,
  },
  {
    quote:
      "The mix of video lessons, hands-on kits, and live tutors actually fits how kids learn. It's the first platform I've recommended to every family I know.",
    author: "Dr. Hana Yousef",
    role: "Pediatric Educator",
    initials: "HY",
    tone: "purple" as const,
  },
];

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div>
      {/* === Hero === */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <AuroraBlobs variant="hero" />
        <div className="pointer-events-none absolute inset-0 bg-stem-grid-fade opacity-40" />
        <div className="pointer-events-none absolute inset-0">
          <FloatingStar size={24} className="absolute top-12 left-[6%] animate-float opacity-40" />
          <FloatingStar size={16} className="absolute top-32 right-[40%] animate-float-delayed opacity-30" />
          <FloatingStar size={20} className="absolute bottom-16 left-[30%] animate-float-slow opacity-25" />
        </div>
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
          {/* Left: copy */}
          <div className="lg:col-span-7">
            <ScrollReveal mode="scale">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-[var(--stem-rocket)]" />
                <GradientText animated>About Schulab</GradientText>
              </div>
            </ScrollReveal>
            <ScrollReveal mode="up" delay={80}>
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                Building the{" "}
                <GradientText animated>future of STEM</GradientText> learning —
                joyfully.
              </h1>
            </ScrollReveal>
            <ScrollReveal mode="fade" delay={180}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {t("subtitle")}
              </p>
            </ScrollReveal>
            <ScrollReveal mode="up" delay={260}>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-launch-gradient px-7 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover-blastoff shine"
                >
                  Start free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-white px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted hover-lift"
                >
                  How it works
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal mode="fade" delay={360}>
              <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["#4f3ff0", "#8b5cf6", "#ff8a3d", "#34d399"].map((c, i) => (
                      <div
                        key={i}
                        style={{ background: c }}
                        className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                      />
                    ))}
                  </div>
                  <span className="font-medium text-foreground/70">
                    Trusted by 5,000+ families
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#ff8a3d]" />
                  <span className="font-medium text-foreground/70">
                    Best EdTech 2025 — TechCrunch
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: illustration cluster + floating cards */}
          <div className="relative lg:col-span-5">
            <ScrollReveal mode="scale" delay={120}>
              <div className="relative mx-auto h-[420px] w-full max-w-md sm:h-[480px]">
                {/* Center planet */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlanetIllustration size={260} className="drop-shadow-2xl" />
                </div>
                {/* Orbiting rocket */}
                <div className="absolute -top-2 -left-4 sm:-left-6">
                  <RocketIllustration size={150} />
                </div>
                {/* Orbiting atom */}
                <div className="absolute -right-2 top-1/3 sm:-right-6">
                  <AtomIllustration size={140} />
                </div>
                {/* Orbiting robot */}
                <div className="absolute bottom-0 left-1/4">
                  <RobotIllustration size={130} />
                </div>

                {/* Floating mini "achievement" card */}
                <div className="absolute -right-4 bottom-8 w-[180px] rounded-2xl border border-border/60 bg-white/95 p-3 shadow-hero backdrop-blur animate-float-delayed sm:-right-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff8a3d]/15">
                      <Trophy className="h-5 w-5 text-[#ff8a3d]" />
                    </div>
                    <div>
                      <p className="font-display text-xs font-bold">
                        Badge unlocked!
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Junior Scientist
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating mini "live class" card */}
                <div className="absolute -left-4 top-12 w-[180px] rounded-2xl border border-border/60 bg-white/95 p-3 shadow-hero backdrop-blur animate-float sm:-left-8">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34d399]/15">
                        <GraduationCap className="h-5 w-5 text-[#34d399]" />
                      </div>
                      <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34d399] opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-[#34d399]" />
                      </span>
                    </div>
                    <div>
                      <p className="font-display text-xs font-bold">Live now</p>
                      <p className="text-[10px] text-muted-foreground">
                        12 students learning
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* === Press strip === */}
      <section className="border-y border-border/60 bg-white/40 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            As featured in
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {pressLogos.map((logo) => (
              <span
                key={logo}
                className="font-display text-base font-bold tracking-tight text-muted-foreground transition-colors hover:text-foreground sm:text-lg"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* === Story + pull quote === */}
      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ScrollReveal mode="up">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
                Our story
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                {t("storyTitle")}
              </h2>
            </ScrollReveal>
            <ScrollReveal mode="fade" delay={120}>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {t("storyText")}
              </p>
            </ScrollReveal>
          </div>
          <div className="lg:col-span-5">
            <ScrollReveal mode="right" delay={140}>
              <figure className="card-stem relative overflow-hidden p-8 hover-lift">
                <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[#4f3ff0]/10 blur-3xl" />
                <Quote className="h-10 w-10 text-[#4f3ff0]/30" />
                <blockquote className="mt-4 font-display text-xl font-semibold leading-relaxed text-foreground/90">
                  &ldquo;Every child deserves a learning experience that feels
                  like the best part of their day — not a chore.&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#4f3ff0] to-[#8b5cf6] font-display text-sm font-bold text-white">
                    AM
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold">
                      Amani Malek
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Founder &amp; CEO, Schulab
                    </p>
                  </div>
                </figcaption>
              </figure>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* === Mission + Vision === */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <ScrollReveal mode="left">
            <div className="card-stem group relative overflow-hidden p-10 hover-lift shine">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#4f3ff0]/10 blur-3xl transition-opacity group-hover:opacity-80" />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f3ff0]/20 to-[#8b5cf6]/20">
                <Sparkles className="h-7 w-7 text-[#4f3ff0]" />
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold">
                {t("mission.title")}
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {t("mission.text")}
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal mode="right" delay={100}>
            <div className="card-stem group relative overflow-hidden p-10 hover-lift shine">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#ff8a3d]/10 blur-3xl transition-opacity group-hover:opacity-80" />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff8a3d]/20 to-[#ef4444]/20">
                <Globe className="h-7 w-7 text-[#ff8a3d]" />
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold">
                {t("vision.title")}
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {t("vision.text")}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* === Bento Values === */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
              What we stand for
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              {t("values.title")}
            </h2>
          </div>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[200px]">
          {/* Joy — featured large */}
          <ScrollReveal mode="up" className="lg:col-span-4 lg:row-span-2">
            <div className="card-stem group relative h-full overflow-hidden p-8 hover-lift shine">
              <div className="pointer-events-none absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-gradient-to-br from-[#ff8a3d]/30 to-[#ef4444]/20 blur-3xl" />
              <div className="relative flex h-full flex-col justify-between gap-6">
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff8a3d]/15">
                    <Heart className="h-7 w-7 text-[#ff8a3d]" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-bold sm:text-3xl">
                    {t("values.joy")}
                  </h3>
                  <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
                    {t("values.joyDesc")}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#ff8a3d]">
                  <Sparkles className="h-4 w-4" />
                  Our north star
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Access */}
          <ScrollReveal mode="up" delay={80} className="lg:col-span-2">
            <div className="card-stem group relative h-full overflow-hidden p-6 hover-lift shine">
              <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[#4f3ff0]/10 blur-3xl" />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4f3ff0]/15">
                <Globe className="h-6 w-6 text-[#4f3ff0]" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">
                {t("values.access")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("values.accessDesc")}
              </p>
            </div>
          </ScrollReveal>

          {/* Quality */}
          <ScrollReveal mode="up" delay={160} className="lg:col-span-2">
            <div className="card-stem group relative h-full overflow-hidden p-6 hover-lift shine">
              <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[#8b5cf6]/10 blur-3xl" />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8b5cf6]/15">
                <Sparkles className="h-6 w-6 text-[#8b5cf6]" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">
                {t("values.quality")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("values.qualityDesc")}
              </p>
            </div>
          </ScrollReveal>

          {/* Safety — wide */}
          <ScrollReveal mode="up" delay={220} className="lg:col-span-6">
            <div className="card-stem group relative h-full overflow-hidden p-6 hover-lift shine">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#34d399]/15 blur-3xl" />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#34d399]/15">
                    <Shield className="h-6 w-6 text-[#34d399]" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold">
                      {t("values.safety")}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {t("values.safetyDesc")}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#34d399]/15 px-3 py-1 text-xs font-semibold text-[#047857]">
                    <Shield className="h-3 w-3" />
                    COPPA
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#34d399]/15 px-3 py-1 text-xs font-semibold text-[#047857]">
                    <Shield className="h-3 w-3" />
                    GDPR
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#34d399]/15 px-3 py-1 text-xs font-semibold text-[#047857]">
                    <Shield className="h-3 w-3" />
                    SOC 2
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* === Methodology — full bleed soft gradient === */}
      <section className="mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal mode="scale">
            <div className="relative overflow-hidden rounded-[2rem] bg-launch-gradient-soft p-10 sm:p-14">
              <div className="pointer-events-none absolute inset-0 bg-stem-grid-fade opacity-30" />
              <div className="pointer-events-none absolute -top-20 -right-10 h-72 w-72 rounded-full bg-[#4f3ff0]/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-[#ff8a3d]/15 blur-3xl" />
              <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
                    Methodology
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                    {t("methodology.title")}
                  </h2>
                  <p className="mt-5 text-lg leading-relaxed text-foreground/80">
                    {t("methodology.text")}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Curiosity-led", color: "#ff8a3d" },
                    { label: "Hands-on first", color: "#4f3ff0" },
                    { label: "Spaced practice", color: "#8b5cf6" },
                    { label: "Real-world projects", color: "#34d399" },
                  ].map((item, i) => (
                    <ScrollReveal key={item.label} mode="up" delay={i * 80}>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur transition-all hover-lift">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ background: item.color }}
                        />
                        <span className="font-display text-sm font-semibold">
                          {item.label}
                        </span>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* === Impact stats === */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
              By the numbers
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              {t("impact.title")}
            </h2>
          </div>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {impactStats.map((stat, i) => (
            <ScrollReveal key={stat.labelKey} mode="up" delay={i * 100}>
              <div className="card-stem p-6 text-center hover-lift">
                <p className="font-display text-4xl font-extrabold text-launch-gradient sm:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(stat.labelKey)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* === Testimonials === */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
              Loved by families &amp; educators
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              What people are saying
            </h2>
          </div>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((tst, i) => (
            <ScrollReveal key={tst.author} mode="up" delay={i * 100}>
              <TestimonialCard {...tst} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* === Team === */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
              The humans behind Schulab
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              {t("team.title")}
            </h2>
          </div>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {team.map((member, i) => (
            <ScrollReveal key={i} mode="up" delay={i * 100}>
              <div className="card-stem group relative flex h-full flex-col items-center overflow-hidden p-8 text-center hover-lift shine">
                <div className="pointer-events-none absolute -top-12 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-launch-gradient opacity-20 blur-3xl transition-opacity group-hover:opacity-40" />
                <div className="relative">
                  <div
                    className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${member.tone} font-display text-2xl font-bold text-white shadow-lg ring-4 ring-white transition-transform group-hover:scale-105`}
                  >
                    {member.initials}
                  </div>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">
                  {t(member.nameKey)}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(member.roleKey)}
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-[#4f3ff0]/15 hover:text-[#4f3ff0]">
                    <ExternalLink className="h-4 w-4" />
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-[#4f3ff0]/15 hover:text-[#4f3ff0]">
                    <Mail className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* === Final CTA === */}
      <section className="mx-auto mt-24 mb-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="scale">
          <div className="relative overflow-hidden rounded-[2rem] bg-launch-gradient-animated px-8 py-20 text-center text-white bg-noise">
            <div className="pointer-events-none absolute inset-0">
              <FloatingStar size={20} className="absolute top-8 left-[8%] animate-float opacity-30" />
              <FloatingStar size={14} className="absolute top-20 right-[12%] animate-float-slow opacity-25" />
              <FloatingStar size={18} className="absolute bottom-12 left-[20%] animate-float-delayed opacity-20" />
              <FloatingStar size={16} className="absolute bottom-8 right-[24%] animate-float opacity-25" />
            </div>
            <div className="relative mx-auto max-w-3xl">
              <RocketIllustration size={80} className="mx-auto mb-6 opacity-90" />
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Join the next generation of learners
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
                Try Schulab free for 14 days. No credit card. Just curious kids.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary shadow-lg transition-all hover:shadow-xl hover-blastoff shine"
                >
                  Start free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  Talk to us
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
