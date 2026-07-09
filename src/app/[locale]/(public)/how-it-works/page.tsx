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
  Play,
  Flame,
  Star,
  Clock,
  Award,
  Users,
} from "lucide-react";
import {
  FloatingStar,
  RocketIllustration,
  RobotIllustration,
} from "@/components/illustrations/stem-icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { GradientText } from "@/components/ui/gradient-text";
import { AuroraBlobs } from "@/components/ui/aurora-blobs";
import { TestimonialCard } from "@/components/shared/testimonial-card";

export const metadata: Metadata = {
  title: "How It Works",
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
    accent: "text-[#4f3ff0]",
    accentBg: "bg-[#4f3ff0]/10",
  },
  {
    number: 2,
    title: "Learn & Practice",
    description:
      "Your child learns through interactive video lessons, quizzes, and hands-on STEM kit activities. Live tutoring sessions provide personalized support when needed.",
    icon: BookOpen,
    color: "bg-[#8b5cf6]",
    ring: "ring-[#8b5cf6]/30",
    accent: "text-[#8b5cf6]",
    accentBg: "bg-[#8b5cf6]/10",
  },
  {
    number: 3,
    title: "Achieve & Grow",
    description:
      "Track progress through your parent dashboard. Earn badges and certificates as your child masters new skills and builds confidence in STEM.",
    icon: Trophy,
    color: "bg-[#ff8a3d]",
    ring: "ring-[#ff8a3d]/30",
    accent: "text-[#ff8a3d]",
    accentBg: "bg-[#ff8a3d]/10",
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

const parentTestimonials = [
  {
    quote:
      "The first week, my son finished four lessons before dinner. We've never had to ask him to do school work since.",
    author: "Yara T.",
    role: "Parent of Khalid, age 8",
    initials: "YT",
    tone: "indigo" as const,
  },
  {
    quote:
      "Live tutors are kind, patient, and clearly love what they do. My twins ask for them by name now.",
    author: "Marcus B.",
    role: "Parent of Mia & Noah, age 10",
    initials: "MB",
    tone: "purple" as const,
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* === Hero with floating dashboard mock === */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <AuroraBlobs variant="hero" />
        <div className="pointer-events-none absolute inset-0 bg-stem-grid-fade opacity-40" />
        <div className="pointer-events-none absolute inset-0">
          <FloatingStar size={24} className="absolute top-12 left-[8%] animate-float opacity-40" />
          <FloatingStar size={16} className="absolute top-24 right-[40%] animate-float-delayed opacity-30" />
          <FloatingStar size={20} className="absolute bottom-16 left-[35%] animate-float-slow opacity-25" />
        </div>
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
          {/* Left: copy */}
          <div className="lg:col-span-6">
            <ScrollReveal mode="scale">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-[var(--stem-rocket)]" />
                <GradientText animated>How it works</GradientText>
              </div>
            </ScrollReveal>
            <ScrollReveal mode="up" delay={80}>
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                Learning that feels like{" "}
                <GradientText animated>play</GradientText>, results that feel
                like magic.
              </h1>
            </ScrollReveal>
            <ScrollReveal mode="fade" delay={180}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                A simple, structured approach to STEM that turns curious kids
                into confident builders, scientists, and creators.
              </p>
            </ScrollReveal>
            <ScrollReveal mode="up" delay={260}>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-launch-gradient px-7 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover-blastoff shine"
                >
                  Start learning free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-white px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted hover-lift"
                >
                  Browse courses
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal mode="fade" delay={360}>
              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { value: "120+", label: "Courses" },
                  { value: "5,000+", label: "Learners" },
                  { value: "4.9★", label: "Parent rating" },
                ].map((m) => (
                  <div key={m.label}>
                    <p className="font-display text-xl font-bold text-launch-gradient sm:text-2xl">
                      {m.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Right: dashboard preview mock */}
          <div className="lg:col-span-6">
            <ScrollReveal mode="scale" delay={120}>
              <div className="relative">
                {/* Backdrop blob */}
                <div className="absolute -inset-4 rounded-[2rem] bg-launch-gradient opacity-20 blur-2xl" />

                {/* Browser-chrome card */}
                <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-white shadow-hero">
                  {/* Top bar */}
                  <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                    <span className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-xs text-muted-foreground">
                      schulab.com / dashboard
                    </span>
                  </div>
                  {/* Body */}
                  <div className="bg-gradient-to-br from-indigo-50/40 to-orange-50/30 p-5">
                    {/* Greeting */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display text-base font-bold">
                          Hi, Lina! 👋
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ready for today&apos;s mission?
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff8a3d]/15 px-3 py-1 text-xs font-bold text-[#ff8a3d]">
                        <Flame className="h-3.5 w-3.5" />
                        12 day streak
                      </span>
                    </div>

                    {/* Daily goal ring + next lesson */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-sm">
                        <div className="relative h-20 w-20">
                          <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
                            <circle cx="40" cy="40" r="32" stroke="#edeef7" strokeWidth="6" fill="none" />
                            <circle
                              cx="40"
                              cy="40"
                              r="32"
                              stroke="url(#ringGrad)"
                              strokeWidth="6"
                              fill="none"
                              strokeDasharray="201"
                              strokeDashoffset="60"
                              strokeLinecap="round"
                            />
                            <defs>
                              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#4f3ff0" />
                                <stop offset="100%" stopColor="#ff8a3d" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="font-display text-base font-extrabold text-launch-gradient">
                              70%
                            </span>
                            <span className="text-[9px] font-semibold uppercase text-muted-foreground">
                              Goal
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                          7 of 10 XP today
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gradient-to-br from-[#4f3ff0] to-[#8b5cf6] p-4 text-white shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                          Next up
                        </p>
                        <p className="mt-1 font-display text-sm font-bold leading-tight">
                          Build your first robot arm
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-[10px] opacity-90">
                          <Clock className="h-3 w-3" />
                          12 min
                          <span className="opacity-50">•</span>
                          <Star className="h-3 w-3" />
                          +25 XP
                        </div>
                        <button className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white py-1.5 text-xs font-bold text-[#4f3ff0]">
                          <Play className="h-3 w-3 fill-current" />
                          Start lesson
                        </button>
                      </div>
                    </div>

                    {/* Recent badges */}
                    <div className="mt-4 rounded-2xl bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Recent badges
                        </p>
                        <span className="text-[10px] font-medium text-[#4f3ff0]">
                          See all
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        {[
                          { color: "from-[#ff8a3d] to-[#ef4444]", icon: Trophy },
                          { color: "from-[#4f3ff0] to-[#8b5cf6]", icon: Star },
                          { color: "from-[#34d399] to-[#10b981]", icon: Award },
                          { color: "from-[#8b5cf6] to-[#ec4899]", icon: Sparkles },
                        ].map((b, i) => {
                          const Icon = b.icon;
                          return (
                            <div
                              key={i}
                              className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${b.color} text-white shadow-sm`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating live class chip */}
                <div className="absolute -right-3 -top-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-hero animate-float">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34d399] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34d399]" />
                  </span>
                  <span className="text-foreground">Live class in 5 min</span>
                </div>

                {/* Floating tutor card */}
                <div className="absolute -bottom-6 -left-6 w-[200px] rounded-2xl border border-border/60 bg-white p-3 shadow-hero animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#34d399] to-[#4f3ff0] font-display text-xs font-bold text-white">
                      MS
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-xs font-bold">Ms. Sara</p>
                      <p className="text-[10px] text-muted-foreground">
                        Robotics tutor • 4.9★
                      </p>
                    </div>
                  </div>
                  <button className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#4f3ff0]/10 py-1.5 text-[11px] font-semibold text-[#4f3ff0]">
                    <Video className="h-3 w-3" />
                    Book session
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* === 3-step process timeline (vertical alternating) === */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
              Three simple steps
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              From curious to confident
            </h2>
          </div>
        </ScrollReveal>

        <div className="relative mt-16 space-y-16">
          {/* Vertical guideline */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-[#4f3ff0]/30 via-[#8b5cf6]/30 to-[#ff8a3d]/30 lg:block"
          />
          {steps.map((step, i) => {
            const Icon = step.icon;
            const flip = i % 2 === 1;
            return (
              <div
                key={step.number}
                className={`relative grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center lg:gap-16`}
              >
                {/* Center dot on the timeline */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute left-1/2 top-1/2 hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ${step.color} ring-8 ring-white lg:block`}
                />

                {/* Copy */}
                <ScrollReveal
                  mode={flip ? "right" : "left"}
                  className={flip ? "lg:order-2" : ""}
                >
                  <div className={flip ? "lg:pl-12" : "lg:pr-12 lg:text-right"}>
                    <div
                      className={`inline-flex items-center gap-3 ${flip ? "" : "lg:flex-row-reverse"}`}
                    >
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${step.color} text-lg font-bold text-white shadow-lg ring-4 ${step.ring}`}
                      >
                        {step.number}
                      </span>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.accentBg}`}>
                        <Icon className={`h-5 w-5 ${step.accent}`} />
                      </div>
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </ScrollReveal>

                {/* Mock visual */}
                <ScrollReveal
                  mode={flip ? "left" : "right"}
                  delay={120}
                  className={flip ? "lg:order-1" : ""}
                >
                  <StepMock step={step.number} />
                </ScrollReveal>
              </div>
            );
          })}
        </div>
      </section>

      {/* === Approach: bento === */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
              How we teach
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Our learning approach
            </h2>
          </div>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {approaches.map((approach, i) => {
            const Icon = approach.icon;
            return (
              <ScrollReveal key={approach.title} mode="up" delay={i * 80}>
                <div className="card-stem group relative h-full overflow-hidden p-6 hover-lift shine sm:p-7">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-current/5 to-transparent blur-3xl" />
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${approach.bg} transition-transform group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon className={`h-6 w-6 ${approach.color}`} />
                    </div>
                    <h3 className="font-display text-xl font-semibold">
                      {approach.title}
                    </h3>
                  </div>
                  <p className="mt-4 leading-relaxed text-muted-foreground">
                    {approach.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* === Parent testimonials === */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
              Parent stories
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Why parents recommend Schulab
            </h2>
          </div>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {parentTestimonials.map((tst, i) => (
            <ScrollReveal key={tst.author} mode="up" delay={i * 100}>
              <TestimonialCard {...tst} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* === Safety & Trust === */}
      <section className="mx-auto mt-24 max-w-5xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="scale">
          <div className="relative overflow-hidden rounded-[2rem] bg-launch-gradient-soft p-8 sm:p-12">
            <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[#4f3ff0]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#34d399]/15 blur-3xl" />
            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-sm backdrop-blur">
                  <Shield className="h-7 w-7 text-[#4f3ff0]" />
                </div>
                <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Your child&apos;s safety comes first
                </h2>
                <p className="mt-4 text-foreground/80">
                  We treat the trust you place in us as sacred. Every tutor is
                  vetted, every interaction is private, every byte is encrypted.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["COPPA", "GDPR", "SOC 2", "FERPA"].map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[#4f3ff0] backdrop-blur"
                    >
                      <Shield className="h-3 w-3" />
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              <ul className="space-y-3 lg:col-span-7">
                {safetyPoints.map((point, i) => (
                  <ScrollReveal key={point} mode="left" delay={i * 70}>
                    <li className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur transition-all hover-lift">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#34d399]" />
                      <span className="text-sm text-foreground/80">{point}</span>
                    </li>
                  </ScrollReveal>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* === Final CTA === */}
      <section className="mx-auto mt-24 mb-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="scale">
          <div className="relative overflow-hidden rounded-[2rem] bg-launch-gradient-animated px-8 py-20 text-center text-white bg-noise">
            <div className="pointer-events-none absolute inset-0">
              <FloatingStar size={20} className="absolute top-8 left-[10%] animate-float opacity-30" />
              <FloatingStar size={14} className="absolute top-20 right-[20%] animate-float-slow opacity-20" />
              <FloatingStar size={18} className="absolute bottom-8 left-[30%] animate-float-delayed opacity-25" />
            </div>
            <div className="relative">
              <RocketIllustration size={80} className="mx-auto mb-6 opacity-90" />
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Ready to get started?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
                Join thousands of families already learning with Schulab. No
                credit card required.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary shadow-lg transition-all hover:shadow-xl hover-blastoff shine"
                >
                  Start learning for free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  Browse courses
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

/* === Step mock visual ============================================== */
function StepMock({ step }: { step: number }) {
  if (step === 1) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-white p-5 shadow-elev">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#4f3ff0]/10 blur-2xl" />
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Course catalog
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Robotics, ages 8-12...
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["All", "Coding", "Robotics", "Math", "Science"].map((t, i) => (
            <span
              key={t}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${i === 2 ? "bg-[#4f3ff0] text-white" : "bg-muted text-foreground/60"}`}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { name: "Robot Builders", color: "from-[#4f3ff0] to-[#8b5cf6]", icon: RobotIllustration },
            { name: "Cosmic Quest", color: "from-[#ff8a3d] to-[#ef4444]", icon: RocketIllustration },
          ].map((c) => {
            const Illu = c.icon;
            return (
              <div
                key={c.name}
                className="overflow-hidden rounded-xl border border-border bg-white"
              >
                <div className={`flex h-20 items-center justify-center bg-gradient-to-br ${c.color}`}>
                  <Illu size={64} className="opacity-90" />
                </div>
                <div className="p-2.5">
                  <p className="font-display text-xs font-bold leading-tight">
                    {c.name}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    8 lessons • Ages 8-12
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-white p-5 shadow-elev">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8b5cf6]/10 blur-2xl" />
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Lesson 3 of 8
          </p>
          <span className="rounded-full bg-[#8b5cf6]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#8b5cf6]">
            12 min
          </span>
        </div>
        {/* Video placeholder */}
        <div className="mt-3 flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] shadow-inner">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg">
            <Play className="h-6 w-6 fill-[#8b5cf6] text-[#8b5cf6]" />
          </div>
        </div>
        <div className="mt-3">
          <p className="font-display text-sm font-bold">
            Building circuits with light
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[40%] rounded-full bg-launch-gradient" />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">40% complete</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: "Quiz", icon: CheckCircle2, color: "text-[#34d399]" },
            { label: "Kit", icon: Wrench, color: "text-[#ff8a3d]" },
            { label: "Tutor", icon: Users, color: "text-[#4f3ff0]" },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.label}
                className="flex flex-col items-center gap-1 rounded-xl border border-border bg-muted/30 py-2"
              >
                <Icon className={`h-4 w-4 ${a.color}`} />
                <span className="text-[10px] font-semibold">{a.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  // step 3
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-white p-5 shadow-elev">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#ff8a3d]/10 blur-2xl" />
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Achievements
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#ff8a3d]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#ff8a3d]">
          <Flame className="h-3 w-3" />
          12 day streak
        </span>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {[
          { color: "from-[#ff8a3d] to-[#ef4444]", icon: Trophy, name: "Champion" },
          { color: "from-[#4f3ff0] to-[#8b5cf6]", icon: Star, name: "Stellar" },
          { color: "from-[#34d399] to-[#10b981]", icon: Award, name: "Builder" },
          { color: "from-[#8b5cf6] to-[#ec4899]", icon: Sparkles, name: "Brilliant" },
        ].map((b, i) => {
          const Icon = b.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${b.color} text-white shadow-md`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[9px] font-semibold text-foreground/70">
                {b.name}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-orange-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Certificate earned
        </p>
        <p className="mt-1 font-display text-sm font-bold">
          Robotics Foundations 🏆
        </p>
        <button className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-launch-gradient py-1.5 text-[11px] font-bold text-white">
          Download PDF
        </button>
      </div>
    </div>
  );
}
