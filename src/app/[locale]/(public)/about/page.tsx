import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { User, Heart, Globe, Shield, Sparkles } from "lucide-react";
import { FloatingStar } from "@/components/illustrations/stem-icons";

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
  { valueKey: "impact.stat1Value", labelKey: "impact.stat1Label" },
  { valueKey: "impact.stat2Value", labelKey: "impact.stat2Label" },
  { valueKey: "impact.stat3Value", labelKey: "impact.stat3Label" },
  { valueKey: "impact.stat4Value", labelKey: "impact.stat4Label" },
];

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div>
      {/* Hero Section — gradient wash */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 py-20 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <FloatingStar size={24} className="absolute top-10 left-[8%] animate-float opacity-40" />
          <FloatingStar size={16} className="absolute top-20 right-[12%] animate-float-delayed opacity-30" />
          <FloatingStar size={20} className="absolute bottom-10 left-[30%] animate-float-slow opacity-25" />
          <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-[#4f3ff0] opacity-[0.05] blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#ff8a3d] opacity-[0.05] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-1.5 text-sm font-semibold shadow-sm">
            <Sparkles className="h-4 w-4 text-[var(--stem-rocket)]" />
            <span className="text-launch-gradient">About Schulab</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{t("storyTitle")}</h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {t("storyText")}
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="card-stem p-8 hover-lift">
            <h2 className="font-display text-xl font-bold">{t("mission.title")}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t("mission.text")}
            </p>
          </div>
          <div className="card-stem p-8 hover-lift">
            <h2 className="font-display text-xl font-bold">{t("vision.title")}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t("vision.text")}
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto mt-20 max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center font-display text-3xl font-bold">{t("values.title")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.key} className={`rounded-2xl border ${v.border} bg-card p-6 transition-all hover-lift`}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${v.bg}`}>
                <v.icon className={`h-6 w-6 ${v.color}`} />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{t(`values.${v.key}`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`values.${v.key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Methodology */}
      <section className="mx-auto mt-20 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-launch-gradient-soft p-8 sm:p-10">
          <h2 className="font-display text-2xl font-bold">{t("methodology.title")}</h2>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">
            {t("methodology.text")}
          </p>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="mx-auto mt-20 max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center font-display text-3xl font-bold">{t("impact.title")}</h2>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {impactStats.map((stat) => (
            <div key={stat.valueKey} className="card-stem p-6 text-center hover-lift">
              <p className="font-display text-4xl font-extrabold text-launch-gradient">{t(stat.valueKey)}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t(stat.labelKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto mt-20 mb-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center font-display text-3xl font-bold">{t("team.title")}</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {team.map((member, i) => (
            <div
              key={i}
              className="card-stem flex flex-col items-center p-8 text-center hover-lift"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-launch-gradient shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{t(member.nameKey)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(member.roleKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
