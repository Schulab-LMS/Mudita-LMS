import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { User, Heart, Globe, Shield, Sparkles } from "lucide-react";
import { FloatingStar } from "@/components/illustrations/stem-icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { GradientText } from "@/components/ui/gradient-text";
import { AuroraBlobs } from "@/components/ui/aurora-blobs";

export const metadata: Metadata = {
  title: "About Us | Schulab",
  description:
    "Learn about Schulab's mission, vision, team, and approach to joyful STEM education for children ages 3-18.",
};

const values = [
  { key: "joy", icon: Heart, color: "text-[#ff8a3d]", bg: "bg-[#ff8a3d]/10", border: "border-[#ff8a3d]/20" },
  { key: "access", icon: Globe, color: "text-[#4f3ff0]", bg: "bg-[#4f3ff0]/10", border: "border-[#4f3ff0]/20" },
  { key: "quality", icon: Sparkles, color: "text-[#8b5cf6]", bg: "bg-[#8b5cf6]/10", border: "border-[#8b5cf6]/20" },
  { key: "safety", icon: Shield, color: "text-[#34d399]", bg: "bg-[#34d399]/10", border: "border-[#34d399]/20" },
];

const team = [
  { nameKey: "team.member1.name", roleKey: "team.member1.role" },
  { nameKey: "team.member2.name", roleKey: "team.member2.role" },
  { nameKey: "team.member3.name", roleKey: "team.member3.role" },
];

const impactStats = [
  { value: 5000, suffix: "+", labelKey: "impact.stat1Label" },
  { value: 120, suffix: "+", labelKey: "impact.stat2Label" },
  { value: 30, suffix: "+", labelKey: "impact.stat3Label" },
  { value: 92, suffix: "%", labelKey: "impact.stat4Label" },
];

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div>
      {/* Hero Section — aurora wash */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 py-20 sm:py-24">
        <AuroraBlobs variant="hero" />
        <div className="pointer-events-none absolute inset-0 bg-stem-grid-fade opacity-40" />
        <div className="pointer-events-none absolute inset-0">
          <FloatingStar size={24} className="absolute top-10 left-[8%] animate-float opacity-40" />
          <FloatingStar size={16} className="absolute top-20 right-[12%] animate-float-delayed opacity-30" />
          <FloatingStar size={20} className="absolute bottom-10 left-[30%] animate-float-slow opacity-25" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal mode="scale">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-[var(--stem-rocket)]" />
              <GradientText animated>About Schulab</GradientText>
            </div>
          </ScrollReveal>
          <ScrollReveal mode="up" delay={80}>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
          </ScrollReveal>
          <ScrollReveal mode="fade" delay={180}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{t("storyTitle")}</h2>
        </ScrollReveal>
        <ScrollReveal mode="fade" delay={120}>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {t("storyText")}
          </p>
        </ScrollReveal>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <ScrollReveal mode="left">
            <div className="card-stem p-8 hover-lift">
              <h2 className="font-display text-xl font-bold">{t("mission.title")}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {t("mission.text")}
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal mode="right" delay={100}>
            <div className="card-stem p-8 hover-lift">
              <h2 className="font-display text-xl font-bold">{t("vision.title")}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {t("vision.text")}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto mt-20 max-w-5xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <h2 className="mb-10 text-center font-display text-3xl font-bold">{t("values.title")}</h2>
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <ScrollReveal key={v.key} mode="up" delay={i * 90}>
              <div className={`group h-full rounded-2xl border ${v.border} bg-card p-6 transition-all hover-lift shine`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${v.bg} transition-transform group-hover:scale-110`}>
                  <v.icon className={`h-6 w-6 ${v.color}`} />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{t(`values.${v.key}`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`values.${v.key}Desc`)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Learning Methodology */}
      <section className="mx-auto mt-20 max-w-4xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="scale">
          <div className="relative overflow-hidden rounded-3xl bg-launch-gradient-soft p-8 sm:p-10">
            <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#4f3ff0]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-[#ff8a3d]/10 blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-2xl font-bold">{t("methodology.title")}</h2>
              <p className="mt-4 text-lg leading-relaxed text-foreground/80">
                {t("methodology.text")}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Impact Stats */}
      <section className="mx-auto mt-20 max-w-5xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <h2 className="mb-10 text-center font-display text-3xl font-bold">{t("impact.title")}</h2>
        </ScrollReveal>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {impactStats.map((stat, i) => (
            <ScrollReveal key={stat.labelKey} mode="up" delay={i * 100}>
              <div className="card-stem p-6 text-center hover-lift">
                <p className="font-display text-4xl font-extrabold text-launch-gradient">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{t(stat.labelKey)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto mt-20 mb-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <h2 className="mb-10 text-center font-display text-3xl font-bold">{t("team.title")}</h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {team.map((member, i) => (
            <ScrollReveal key={i} mode="up" delay={i * 120}>
              <div className="card-stem group flex h-full flex-col items-center p-8 text-center hover-lift shine">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-launch-gradient opacity-60 blur-xl transition-opacity group-hover:opacity-90" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-launch-gradient shadow-lg transition-transform group-hover:scale-105">
                    <User className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{t(member.nameKey)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(member.roleKey)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  );
}
