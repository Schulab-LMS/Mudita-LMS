import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { User, Heart, Globe, Shield, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Schulab",
  description:
    "Learn about Schulab's mission, vision, team, and approach to joyful STEM education for children ages 3-18.",
};

const values = [
  { key: "joy", icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
  { key: "access", icon: Globe, color: "text-blue-500", bg: "bg-blue-50" },
  { key: "quality", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50" },
  { key: "safety", icon: Shield, color: "text-green-500", bg: "bg-green-50" },
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
    <div className="py-16">
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {t("subtitle")}
        </p>
      </section>

      {/* Our Story */}
      <section className="mx-auto mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold">{t("storyTitle")}</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          {t("storyText")}
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-8">
            <h2 className="text-xl font-bold">{t("mission.title")}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t("mission.text")}
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-8">
            <h2 className="text-xl font-bold">{t("vision.title")}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t("vision.text")}
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold">{t("values.title")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.key} className="rounded-2xl border bg-card p-6">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${v.bg}`}>
                <v.icon className={`h-5 w-5 ${v.color}`} />
              </div>
              <h3 className="mt-4 font-semibold">{t(`values.${v.key}`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`values.${v.key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Methodology */}
      <section className="mx-auto mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-muted/50 p-8">
          <h2 className="text-xl font-bold">{t("methodology.title")}</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {t("methodology.text")}
          </p>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold">{t("impact.title")}</h2>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {impactStats.map((stat) => (
            <div key={stat.valueKey} className="text-center">
              <p className="text-3xl font-bold text-primary">{t(stat.valueKey)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t(stat.labelKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold">{t("team.title")}</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {team.map((member, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-xl border bg-card p-6 text-center shadow-sm"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <User className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{t(member.nameKey)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(member.roleKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
