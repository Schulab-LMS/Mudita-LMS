import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  Search,
  BookOpen,
  Trophy,
  Monitor,
  Wrench,
  Video,
  Gamepad2,
  Shield,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { FloatingStar, RocketIllustration } from "@/components/illustrations/stem-icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { GradientText } from "@/components/ui/gradient-text";
import { AuroraBlobs } from "@/components/ui/aurora-blobs";


export const metadata: Metadata = {
  title: "How It Works | Schulab",
  description:
    "Discover how Schulab's STEM education platform works. Browse courses, learn interactively, and achieve real results.",
};

const steps = [
  {
    number: 1,
    title: "Browse & Enroll",
    description:
      "Explore our catalog of STEM courses organized by age group, subject, and skill level. Find the perfect course for your child and enroll in seconds.",
    icon: Search,
    color: "bg-[#4f3ff0]",
    ring: "ring-[#4f3ff0]/30",
  },
  {
    number: 2,
    title: "Learn & Practice",
    description:
      "Your child learns through interactive video lessons, quizzes, and hands-on STEM kit activities. Live tutoring sessions provide personalized support when needed.",
    icon: BookOpen,
    color: "bg-[#8b5cf6]",
    ring: "ring-[#8b5cf6]/30",
  },
  {
    number: 3,
    title: "Achieve & Grow",
    description:
      "Track progress through your parent dashboard. Earn badges and certificates as your child masters new skills and builds confidence in STEM.",
    icon: Trophy,
    color: "bg-[#ff8a3d]",
    ring: "ring-[#ff8a3d]/30",
  },
];

const approaches = [
  {
    title: "Interactive Video Lessons",
    description:
      "Engaging, age-appropriate video content designed by experienced STEM educators. Short, focused lessons that keep young minds engaged.",
    icon: Monitor,
    color: "text-[#4f3ff0]",
    bg: "bg-[#4f3ff0]/10",
  },
  {
    title: "Hands-On STEM Kits",
    description:
      "Physical science and engineering kits delivered to your door. Real experiments and projects that bring theory to life.",
    icon: Wrench,
    color: "text-[#8b5cf6]",
    bg: "bg-[#8b5cf6]/10",
  },
  {
    title: "Live Expert Tutoring",
    description:
      "One-on-one sessions with verified STEM tutors. Personalized learning support tailored to your child's pace and level.",
    icon: Video,
    color: "text-[#34d399]",
    bg: "bg-[#34d399]/10",
  },
  {
    title: "Gamified Progress",
    description:
      "Badges, points, certificates, and leaderboards make learning feel like an adventure. Children stay motivated and excited to learn more.",
    icon: Gamepad2,
    color: "text-[#ff8a3d]",
    bg: "bg-[#ff8a3d]/10",
  },
];

const safetyPoints = [
  "All tutors are verified and vetted before joining the platform",
  "Age-appropriate content reviewed by educational experts",
  "Secure, encrypted platform with strict data privacy practices",
  "Parent dashboard for full visibility into your child's learning",
  "No ads, no distractions — just pure learning",
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 py-20 sm:py-24">
        <AuroraBlobs variant="hero" />
        <div className="pointer-events-none absolute inset-0 bg-stem-grid-fade opacity-40" />
        <div className="pointer-events-none absolute inset-0">
          <FloatingStar size={24} className="absolute top-12 left-[10%] animate-float opacity-40" />
          <FloatingStar size={16} className="absolute top-20 right-[15%] animate-float-delayed opacity-30" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal mode="scale">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-[var(--stem-rocket)]" />
              <GradientText animated>How it works</GradientText>
            </div>
          </ScrollReveal>
          <ScrollReveal mode="up" delay={80}>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              How Schulab Works
            </h1>
          </ScrollReveal>
          <ScrollReveal mode="fade" delay={180}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              A simple, structured approach to STEM education that makes learning
              joyful and effective.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.number} mode="up" delay={i * 140}>
                <div className="group relative text-center">
                  {i < steps.length - 1 && (
                    <div className="absolute top-8 left-[calc(50%+40px)] hidden h-0.5 w-[calc(100%-80px)] bg-launch-gradient-horizontal opacity-40 md:block" />
                  )}
                  <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} text-2xl font-bold text-white shadow-lg ring-8 ${step.ring} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    {step.number}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 transition-transform group-hover:scale-110">
                      <Icon className="h-6 w-6 text-foreground/70" />
                    </div>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Learning Approach Section */}
      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <h2 className="mb-12 text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Our Learning Approach
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {approaches.map((approach, i) => {
            const Icon = approach.icon;
            return (
              <ScrollReveal key={approach.title} mode="up" delay={i * 100}>
                <Card className="group h-full transition-all hover-lift shine">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${approach.bg} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                        <Icon className={`h-6 w-6 ${approach.color}`} />
                      </div>
                      <CardTitle className="font-display text-xl">{approach.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed text-muted-foreground">
                      {approach.description}
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Safety & Trust Section */}
      <section className="mx-auto mt-20 max-w-4xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="scale">
          <div className="relative overflow-hidden rounded-3xl bg-launch-gradient-soft p-8 sm:p-10">
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#4f3ff0]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#34d399]/15 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm backdrop-blur">
                  <Shield className="h-6 w-6 text-[#4f3ff0]" />
                </div>
                <h2 className="font-display text-3xl font-bold tracking-tight">
                  Your Child&apos;s Safety Comes First
                </h2>
              </div>
              <ul className="mx-auto mt-8 max-w-2xl space-y-4">
                {safetyPoints.map((point, i) => (
                  <ScrollReveal key={point} mode="left" delay={i * 70}>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#34d399]" />
                      <span className="text-foreground/80">{point}</span>
                    </li>
                  </ScrollReveal>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA Section */}
      <section className="mx-auto mt-20 mb-16 max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="scale">
          <div className="relative overflow-hidden rounded-3xl bg-launch-gradient-animated px-8 py-16 text-center text-white bg-noise">
            <div className="pointer-events-none absolute inset-0">
              <FloatingStar size={20} className="absolute top-8 left-[10%] animate-float opacity-30" />
              <FloatingStar size={14} className="absolute top-20 right-[20%] animate-float-slow opacity-20" />
              <FloatingStar size={18} className="absolute bottom-8 left-[30%] animate-float-delayed opacity-25" />
            </div>
            <div className="relative">
              <RocketIllustration size={72} className="mx-auto mb-6 opacity-80" />
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
                Join thousands of families already learning with Schulab.
              </p>
              <Link
                href="/register"
                className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary shadow-lg transition-all hover:shadow-xl hover-blastoff shine"
              >
                Start Learning for Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
