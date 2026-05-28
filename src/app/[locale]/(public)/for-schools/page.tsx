import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  BookOpen,
  BarChart3,
  Settings,
  Headphones,
  Check,
  X,
  ArrowRight,
  Building2,
  Sparkles,
  Users,
  Globe2,
  GraduationCap,
  TrendingUp,
  Calendar,
  ChevronDown,
  Shield,
} from "lucide-react";
import {
  FloatingStar,
  RocketIllustration,
  AtomIllustration,
} from "@/components/illustrations/stem-icons";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { GradientText } from "@/components/ui/gradient-text";
import { AuroraBlobs } from "@/components/ui/aurora-blobs";
import { TestimonialCard } from "@/components/shared/testimonial-card";

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
    color: "text-[#4f3ff0]",
    bg: "bg-[#4f3ff0]/10",
  },
  {
    title: "Admin Dashboard & Analytics",
    description:
      "Monitor student progress, manage enrollments, and generate reports through a powerful administration panel.",
    icon: BarChart3,
    color: "text-[#8b5cf6]",
    bg: "bg-[#8b5cf6]/10",
  },
  {
    title: "Flexible Implementation",
    description:
      "Use Schulab as a standalone platform, supplement your existing curriculum, or integrate via our API. Custom branding available.",
    icon: Settings,
    color: "text-[#34d399]",
    bg: "bg-[#34d399]/10",
  },
  {
    title: "Dedicated Support",
    description:
      "Get a dedicated account manager, teacher training, technical support, and onboarding assistance.",
    icon: Headphones,
    color: "text-[#ff8a3d]",
    bg: "bg-[#ff8a3d]/10",
  },
];

const schoolStepColors = ["bg-[#4f3ff0]", "bg-[#8b5cf6]", "bg-[#ff8a3d]"];
const schoolStepRings = ["ring-[#4f3ff0]/30", "ring-[#8b5cf6]/30", "ring-[#ff8a3d]/30"];

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

const beforeAfter = [
  {
    label: "Curriculum prep",
    before: "Hours per teacher each week",
    after: "Plug-and-play course catalog",
  },
  {
    label: "Student engagement",
    before: "Hard to keep attention",
    after: "Gamified, age-appropriate lessons",
  },
  {
    label: "Progress tracking",
    before: "Manual spreadsheets",
    after: "Real-time admin dashboard",
  },
  {
    label: "Parent visibility",
    before: "Quarterly reports",
    after: "Live parent portal",
  },
  {
    label: "Onboarding new students",
    before: "Days of setup",
    after: "Bulk import in minutes",
  },
];

const partnerLogos = [
  "Olive Tree Academy",
  "Bright Future Schools",
  "STEM Lab International",
  "Riyadh Science",
  "Cedar Valley K-12",
  "Newton Tech Lab",
];

const principalTestimonial = {
  quote:
    "We rolled Schulab out across 240 students in three weeks. Teacher prep time dropped, kids actually look forward to STEM, and our board gets reports they can read. It paid for itself by month two.",
  author: "Daniel Reyes",
  role: "Principal, Olive Tree Academy",
  initials: "DR",
  tone: "indigo" as const,
  rating: 5,
};

const schoolFaqs = [
  {
    q: "How long does setup take?",
    a: "Most schools are fully onboarded within one week — accounts created, courses assigned, teachers trained. We do the heavy lifting.",
  },
  {
    q: "Can we use our existing student data?",
    a: "Yes. We support CSV bulk import, SSO via Google Workspace and Microsoft, and API integrations for SIS systems.",
  },
  {
    q: "Is the platform aligned to our curriculum standards?",
    a: "Our courses map to common standards (Common Core, IB, national frameworks). We can also map to your specific curriculum on request.",
  },
  {
    q: "What about data privacy and student safety?",
    a: "We are COPPA, GDPR, and FERPA compliant. Data is encrypted in transit and at rest. We sign DPAs and provide a public privacy report.",
  },
  {
    q: "Can we white-label the platform?",
    a: "Yes — the Custom plan for schools includes custom branding, your logo, color palette, and a custom subdomain.",
  },
  {
    q: "What does pricing look like?",
    a: "Pricing scales with student count. Most schools land between $4–$12 per student per month, with volume discounts. Reach out for a tailored quote.",
  },
];

export default function ForSchoolsPage() {
  return (
    <div>
      {/* === Hero with classroom mock === */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <AuroraBlobs variant="hero" />
        <div className="pointer-events-none absolute inset-0 bg-stem-grid-fade opacity-40" />
        <div className="pointer-events-none absolute inset-0">
          <FloatingStar size={24} className="absolute top-12 left-[8%] animate-float opacity-40" />
          <FloatingStar size={16} className="absolute top-32 right-[40%] animate-float-delayed opacity-30" />
        </div>
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
          {/* Left: copy */}
          <div className="lg:col-span-6">
            <ScrollReveal mode="scale">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
                <Building2 className="h-4 w-4 text-[var(--stem-rocket)]" />
                <GradientText animated>For Schools &amp; Institutions</GradientText>
              </div>
            </ScrollReveal>
            <ScrollReveal mode="up" delay={80}>
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                The <GradientText animated>STEM platform</GradientText> your
                whole school will love.
              </h1>
            </ScrollReveal>
            <ScrollReveal mode="fade" delay={180}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Schulab gives schools, learning centers, and organizations a
                complete STEM stack — interactive courses, live tutoring,
                hands-on kits, and admin tools — all in one place.
              </p>
            </ScrollReveal>
            <ScrollReveal mode="up" delay={260}>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/contact?subject=School%20Demo%20Request"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-launch-gradient px-7 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover-blastoff shine"
                >
                  Request a demo
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-white px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted hover-lift"
                >
                  View pricing
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal mode="fade" delay={360}>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground/70">
                  <Shield className="h-4 w-4 text-[#34d399]" />
                  COPPA / GDPR / FERPA
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground/70">
                  <Users className="h-4 w-4 text-[#4f3ff0]" />
                  300+ partner institutions
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground/70">
                  <Calendar className="h-4 w-4 text-[#ff8a3d]" />
                  Onboarding in &lt; 1 week
                </span>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: admin dashboard mock */}
          <div className="lg:col-span-6">
            <ScrollReveal mode="scale" delay={120}>
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-launch-gradient opacity-20 blur-2xl" />
                <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-white shadow-hero">
                  {/* Top bar */}
                  <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-launch-gradient text-xs font-bold text-white">
                        OT
                      </div>
                      <span className="font-display text-xs font-bold">
                        Olive Tree Academy
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Admin · Spring term
                    </span>
                  </div>
                  {/* Body */}
                  <div className="bg-gradient-to-br from-indigo-50/40 to-orange-50/30 p-5">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Active students", value: 240, color: "text-[#4f3ff0]" },
                        { label: "Avg. weekly XP", value: "1.2k", color: "text-[#8b5cf6]" },
                        { label: "Completion", value: "87%", color: "text-[#34d399]" },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl bg-white p-3 shadow-sm">
                          <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {s.label}
                          </p>
                          <p className={`mt-1 font-display text-lg font-extrabold ${s.color}`}>
                            {s.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Mock chart */}
                    <div className="mt-4 rounded-2xl bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Engagement (last 30 days)
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#34d399]/15 px-2 py-0.5 text-[10px] font-bold text-[#047857]">
                          <TrendingUp className="h-3 w-3" />
                          +18%
                        </span>
                      </div>
                      <svg viewBox="0 0 280 80" className="mt-3 h-20 w-full">
                        <defs>
                          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f3ff0" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#4f3ff0" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="chartStroke" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#4f3ff0" />
                            <stop offset="100%" stopColor="#ff8a3d" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,60 L20,55 L40,58 L60,45 L80,48 L100,38 L120,40 L140,28 L160,32 L180,22 L200,25 L220,18 L240,20 L260,12 L280,15 L280,80 L0,80 Z"
                          fill="url(#chartFill)"
                        />
                        <path
                          d="M0,60 L20,55 L40,58 L60,45 L80,48 L100,38 L120,40 L140,28 L160,32 L180,22 L200,25 L220,18 L240,20 L260,12 L280,15"
                          fill="none"
                          stroke="url(#chartStroke)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {/* Roster strip */}
                    <div className="mt-4 rounded-2xl bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Top performers
                        </p>
                        <span className="text-[10px] font-medium text-[#4f3ff0]">
                          View all
                        </span>
                      </div>
                      <ul className="mt-2 space-y-1.5">
                        {[
                          { name: "Lina K.", grade: "Grade 4", xp: 2840 },
                          { name: "Khalid R.", grade: "Grade 5", xp: 2710 },
                          { name: "Mia B.", grade: "Grade 4", xp: 2580 },
                        ].map((s, i) => (
                          <li key={s.name} className="flex items-center gap-3">
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white ${
                                i === 0
                                  ? "from-[#ff8a3d] to-[#ef4444]"
                                  : i === 1
                                    ? "from-[#4f3ff0] to-[#8b5cf6]"
                                    : "from-[#34d399] to-[#10b981]"
                              }`}
                            >
                              {s.name.split(" ")[0]?.[0]}
                            </div>
                            <div className="flex-1">
                              <p className="text-[11px] font-semibold">
                                {s.name}
                              </p>
                              <p className="text-[9px] text-muted-foreground">
                                {s.grade}
                              </p>
                            </div>
                            <span className="font-display text-xs font-bold text-[#4f3ff0]">
                              {s.xp} XP
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Floating "kit shipped" card */}
                <div className="absolute -right-4 -top-4 w-[180px] rounded-2xl border border-border/60 bg-white p-3 shadow-hero animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34d399]/15">
                      <Check className="h-5 w-5 text-[#34d399]" />
                    </div>
                    <div>
                      <p className="font-display text-xs font-bold">
                        Kits shipped
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        240 / 240 delivered
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating illustration */}
                <div className="absolute -bottom-8 -left-8 hidden sm:block">
                  <RocketIllustration size={100} />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* === Logo wall === */}
      <section className="border-y border-border/60 bg-white/40 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Trusted by leading schools &amp; learning centers
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {partnerLogos.map((logo) => (
              <span
                key={logo}
                className="font-display text-sm font-bold tracking-tight text-muted-foreground transition-colors hover:text-foreground sm:text-base"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* === Institution Stats === */}
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
                  <p className="mt-2 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* === Why schools — bento === */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
              Built for institutions
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Why schools choose Schulab
            </h2>
          </div>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal key={feature.title} mode="up" delay={i * 100}>
                <div className="card-stem group relative h-full overflow-hidden p-7 hover-lift shine">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-current/5 to-transparent blur-3xl" />
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${feature.bg} transition-transform group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="font-display text-xl font-semibold">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="mt-4 leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* === Before / After === */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
              The Schulab effect
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Before vs. with Schulab
            </h2>
          </div>
        </ScrollReveal>
        <ScrollReveal mode="fade" delay={120}>
          <div className="mt-12 overflow-hidden rounded-3xl border border-border/60 bg-white shadow-elev">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="border-b border-border/60 bg-muted/40 p-5 md:border-b-0 md:border-r">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <p className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Without Schulab
                  </p>
                </div>
              </div>
              <div className="bg-launch-gradient-soft p-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34d399]/15">
                    <Check className="h-4 w-4 text-[#34d399]" />
                  </span>
                  <p className="font-display text-sm font-bold uppercase tracking-wide text-[#4f3ff0]">
                    With Schulab
                  </p>
                </div>
              </div>
            </div>
            <ul>
              {beforeAfter.map((row, i) => (
                <li
                  key={row.label}
                  className={`grid grid-cols-1 md:grid-cols-2 ${
                    i % 2 === 1 ? "bg-muted/10" : ""
                  }`}
                >
                  <div className="border-b border-border/60 p-5 md:border-b-0 md:border-r">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {row.label}
                    </p>
                    <p className="mt-1 text-sm text-foreground/70 line-through decoration-muted-foreground/30">
                      {row.before}
                    </p>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#4f3ff0]">
                      {row.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {row.after}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </section>

      {/* === Principal testimonial — featured === */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal mode="scale">
          <div className="relative overflow-hidden rounded-[2rem] bg-launch-gradient-soft p-8 sm:p-12">
            <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[#4f3ff0]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#ff8a3d]/15 blur-3xl" />
            <div className="relative">
              <div className="mx-auto max-w-3xl">
                <TestimonialCard {...principalTestimonial} className="bg-white/80 backdrop-blur" />
              </div>
              <div className="mx-auto mt-8 grid max-w-3xl grid-cols-3 gap-6 text-center">
                <div>
                  <p className="font-display text-2xl font-extrabold text-launch-gradient sm:text-3xl">
                    +47%
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Engagement vs. baseline
                  </p>
                </div>
                <div>
                  <p className="font-display text-2xl font-extrabold text-launch-gradient sm:text-3xl">
                    -64%
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Teacher prep time
                  </p>
                </div>
                <div>
                  <p className="font-display text-2xl font-extrabold text-launch-gradient sm:text-3xl">
                    2 mo
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Time to ROI
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* === How It Works for Schools === */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal mode="up">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
                Onboarding
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                How it works for schools
              </h2>
            </div>
          </ScrollReveal>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {schoolSteps.map((step, i) => (
              <ScrollReveal key={step.number} mode="up" delay={i * 140}>
                <div className="group relative text-center">
                  {i < schoolSteps.length - 1 && (
                    <div className="absolute top-7 left-[calc(50%+32px)] hidden h-0.5 w-[calc(100%-64px)] bg-launch-gradient-horizontal opacity-40 md:block" />
                  )}
                  <div
                    className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${schoolStepColors[i]} text-xl font-bold text-white shadow-lg ring-8 ${schoolStepRings[i]} transition-transform group-hover:scale-110 group-hover:rotate-3`}
                  >
                    {step.number}
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* === Institution FAQ === */}
      <section className="mx-auto mt-20 max-w-3xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="up">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4f3ff0]">
              Questions from administrators
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
        </ScrollReveal>
        <ScrollReveal mode="fade" delay={100}>
          <div className="mt-10 divide-y rounded-3xl border bg-card shadow-elev overflow-hidden">
            {schoolFaqs.map((faq, i) => (
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

      {/* === CTA === */}
      <section className="mx-auto mt-20 mb-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal mode="scale">
          <div className="relative overflow-hidden rounded-[2rem] bg-launch-gradient-animated px-8 py-20 text-center text-white bg-noise">
            <div className="pointer-events-none absolute inset-0">
              <FloatingStar size={20} className="absolute top-8 left-[10%] animate-float opacity-30" />
              <FloatingStar size={14} className="absolute top-20 right-[20%] animate-float-slow opacity-20" />
              <FloatingStar size={18} className="absolute bottom-8 left-[30%] animate-float-delayed opacity-25" />
              <AtomIllustration size={80} className="absolute right-[8%] top-1/2 hidden -translate-y-1/2 opacity-40 lg:block" />
            </div>
            <div className="relative mx-auto max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur ring-1 ring-white/20">
                <Sparkles className="h-4 w-4" />
                Schulab for Schools
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Let&apos;s build the future together
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
                Join schools and organizations worldwide using Schulab to
                inspire the next generation of STEM leaders.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/contact?subject=School%20Partnership%20Inquiry"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary shadow-lg transition-all hover:shadow-xl hover-blastoff shine"
                >
                  Get in touch
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="mailto:hello@schulab.com"
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  hello@schulab.com
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
