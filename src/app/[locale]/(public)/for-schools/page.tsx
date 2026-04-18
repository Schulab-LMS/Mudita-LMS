import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  BookOpen,
  BarChart3,
  Settings,
  Headphones,
  Check,
  ArrowRight,
  Building2,
  Sparkles,
  Users,
  Globe2,
  GraduationCap,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { FloatingStar } from "@/components/illustrations/stem-icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { GradientText } from "@/components/ui/gradient-text";
import { AuroraBlobs } from "@/components/ui/aurora-blobs";

export const metadata: Metadata = {
  title: "Schulab for Schools | STEM Education Solutions",
  description:
    "Bring engaging STEM education to your school or organization. Custom solutions, admin tools, and dedicated support for educational institutions.",
};

const features = [
  {
    title: "Ready-Made Curriculum",
    description:
      "Access 120+ structured STEM courses covering Mathematics, Coding, Science, Robotics, and more — designed for ages 3 to 18.",
    icon: BookOpen,
    color: "text-[#4f3ff0] bg-[#4f3ff0]/10",
  },
  {
    title: "Admin Dashboard & Analytics",
    description:
      "Monitor student progress, manage enrollments, and generate reports through a powerful administration panel.",
    icon: BarChart3,
    color: "text-[#8b5cf6] bg-[#8b5cf6]/10",
  },
  {
    title: "Flexible Implementation",
    description:
      "Use Schulab as a standalone platform, supplement your existing curriculum, or integrate via our API. Custom branding available.",
    icon: Settings,
    color: "text-[#34d399] bg-[#34d399]/10",
  },
  {
    title: "Dedicated Support",
    description:
      "Get a dedicated account manager, teacher training, technical support, and onboarding assistance.",
    icon: Headphones,
    color: "text-[#ff8a3d] bg-[#ff8a3d]/10",
  },
];

const schoolStepColors = ["bg-[#4f3ff0]", "bg-[#8b5cf6]", "bg-[#ff8a3d]"];
const schoolStepRings = ["ring-[#4f3ff0]/30", "ring-[#8b5cf6]/30", "ring-[#ff8a3d]/30"];

const leftFeatures = [
  "Unlimited student accounts",
  "Full course catalog access",
  "Admin dashboard & reporting",
  "Bulk student enrollment",
  "Custom branding options",
];

const rightFeatures = [
  "Live tutoring access",
  "STEM Kit ordering",
  "Teacher training resources",
  "API integration",
  "Priority technical support",
];

const schoolSteps = [
  {
    number: 1,
    title: "Contact Us",
    description:
      "Tell us about your school and needs. We'll create a custom plan.",
  },
  {
    number: 2,
    title: "Setup & Training",
    description:
      "We set up your accounts, import students, and train your team.",
  },
  {
    number: 3,
    title: "Launch & Learn",
    description:
      "Students start learning immediately. We provide ongoing support.",
  },
];

const institutionStats = [
  { value: 300, suffix: "+", label: "Partner institutions", icon: Building2 },
  { value: 50000, suffix: "+", label: "Students learning daily", icon: Users },
  { value: 30, suffix: "+", label: "Countries served", icon: Globe2 },
  { value: 98, suffix: "%", label: "Teacher satisfaction", icon: GraduationCap },
];

export default function ForSchoolsPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 py-20 sm:py-24">
        <AuroraBlobs variant="hero" />
        <div className="pointer-events-none absolute inset-0 bg-stem-grid-fade opacity-40" />
        <div className="pointer-events-none absolute inset-0">
          <FloatingStar size={24} className="absolute top-10 left-[10%] animate-float opacity-40" />
          <FloatingStar size={16} className="absolute top-24 right-[12%] animate-float-delayed opacity-30" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal mode="scale">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
              <Building2 className="h-4 w-4 text-[var(--stem-rocket)]" />
              <GradientText animated>For Schools & Institutions</GradientText>
            </div>
          </ScrollReveal>
          <ScrollReveal mode="up" delay={80}>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Bring STEM Education to Your School
            </h1>
          </ScrollReveal>
          <ScrollReveal mode="fade" delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Schulab provides schools, learning centers, and organizations with a
              complete STEM education platform — interactive courses, live
              tutoring, hands-on kits, and powerful admin tools.
            </p>
          </ScrollReveal>
          <ScrollReveal mode="up" delay={240}>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/contact?subject=School%20Demo%20Request"
                className="group inline-flex items-center gap-2 rounded-2xl bg-launch-gradient px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover-blastoff shine"
              >
                Request a Demo
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-white px-8 py-4 text-base font-semibold text-foreground hover:bg-muted transition-colors hover-lift"
              >
                View Pricing
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Institution Stats */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {institutionStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <ScrollReveal key={stat.label} mode="up" delay={i * 100}>
                <div className="card-stem flex flex-col items-center p-6 text-center hover-lift">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-launch-gradient-soft">
                    <Icon className="h-6 w-6 text-[#4f3ff0]" />
                  </div>
                  <p className="mt-4 font-display text-3xl font-extrabold text-launch-gradient sm:text-4xl">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Why Schools Choose Schulab */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <h2 className="mb-12 text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Why Schools Choose Schulab
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal key={feature.title} mode="up" delay={i * 100}>
                <Card className="group h-full transition-all hover-lift shine">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${feature.color} transition-transform group-hover:scale-110 group-hover:rotate-3`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="font-display text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* What You Get Section */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <ScrollReveal mode="scale">
          <div className="relative overflow-hidden rounded-3xl bg-launch-gradient-soft p-8 sm:p-10">
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#4f3ff0]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#ff8a3d]/15 blur-3xl" />
            <div className="relative">
              <h2 className="mb-8 text-center font-display text-3xl font-bold tracking-tight">
                Everything Your Institution Needs
              </h2>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <ul className="space-y-4">
                  {leftFeatures.map((item, i) => (
                    <ScrollReveal key={item} mode="left" delay={i * 70}>
                      <li className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#34d399]/15">
                          <Check className="h-4 w-4 text-[#34d399]" />
                        </div>
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    </ScrollReveal>
                  ))}
                </ul>
                <ul className="space-y-4">
                  {rightFeatures.map((item, i) => (
                    <ScrollReveal key={item} mode="right" delay={i * 70}>
                      <li className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#34d399]/15">
                          <Check className="h-4 w-4 text-[#34d399]" />
                        </div>
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    </ScrollReveal>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* How It Works for Schools */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal mode="up">
            <h2 className="mb-12 text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works for Schools
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {schoolSteps.map((step, i) => (
              <ScrollReveal key={step.number} mode="up" delay={i * 140}>
                <div className="group relative text-center">
                  {i < schoolSteps.length - 1 && (
                    <div className="absolute top-7 left-[calc(50%+32px)] hidden h-0.5 w-[calc(100%-64px)] bg-launch-gradient-horizontal opacity-40 md:block" />
                  )}
                  <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${schoolStepColors[i]} text-xl font-bold text-white shadow-lg ring-8 ${schoolStepRings[i]} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    {step.number}
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-launch-gradient-animated py-20 text-white bg-noise">
        <div className="pointer-events-none absolute inset-0">
          <FloatingStar size={20} className="absolute top-8 left-[10%] animate-float opacity-30" />
          <FloatingStar size={14} className="absolute top-20 right-[20%] animate-float-slow opacity-20" />
          <FloatingStar size={18} className="absolute bottom-8 left-[30%] animate-float-delayed opacity-25" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal mode="scale">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur ring-1 ring-white/20">
              <Sparkles className="h-4 w-4" />
              Schulab for Schools
            </div>
          </ScrollReveal>
          <ScrollReveal mode="up" delay={100}>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Let&apos;s Build the Future Together
            </h2>
          </ScrollReveal>
          <ScrollReveal mode="fade" delay={180}>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
              Join schools and organizations worldwide using Schulab to inspire the
              next generation of STEM leaders.
            </p>
          </ScrollReveal>
          <ScrollReveal mode="up" delay={260}>
            <Link
              href="/contact?subject=School%20Partnership%20Inquiry"
              className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary shadow-lg transition-all hover:shadow-xl hover-blastoff shine"
            >
              Get in Touch
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="mt-4 text-sm text-white/70">
              Or email us directly at hello@schulab.com
            </p>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
