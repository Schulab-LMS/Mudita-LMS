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
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { FloatingStar } from "@/components/illustrations/stem-icons";

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

export default function ForSchoolsPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 py-20 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <FloatingStar size={24} className="absolute top-10 left-[10%] animate-float opacity-40" />
          <FloatingStar size={16} className="absolute top-24 right-[12%] animate-float-delayed opacity-30" />
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#4f3ff0] opacity-[0.05] blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#ff8a3d] opacity-[0.05] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-1.5 text-sm font-semibold shadow-sm">
            <Building2 className="h-4 w-4 text-[var(--stem-rocket)]" />
            <span className="text-launch-gradient">For Schools & Institutions</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Bring STEM Education to Your School
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Schulab provides schools, learning centers, and organizations with a
            complete STEM education platform — interactive courses, live
            tutoring, hands-on kits, and powerful admin tools.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact?subject=School%20Demo%20Request"
              className="group inline-flex items-center gap-2 rounded-2xl bg-launch-gradient px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover-lift"
            >
              Request a Demo
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-white px-8 py-4 text-base font-semibold text-foreground hover:bg-muted transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Why Schools Choose Schulab */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Why Schools Choose Schulab
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="transition-all hover-lift"
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${feature.color}`}
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
            );
          })}
        </div>
      </section>

      {/* What You Get Section */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-launch-gradient-soft p-8 sm:p-10">
          <h2 className="mb-8 text-center font-display text-3xl font-bold tracking-tight">
            Everything Your Institution Needs
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <ul className="space-y-4">
              {leftFeatures.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-[#34d399]" />
                  <span className="text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
            <ul className="space-y-4">
              {rightFeatures.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-[#34d399]" />
                  <span className="text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works for Schools */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works for Schools
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {schoolSteps.map((step, i) => (
              <div key={step.number} className="group relative text-center">
                {i < schoolSteps.length - 1 && (
                  <div className="absolute top-7 left-[calc(50%+32px)] hidden h-0.5 w-[calc(100%-64px)] bg-launch-gradient-horizontal opacity-40 md:block" />
                )}
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${schoolStepColors[i]} text-xl font-bold text-white shadow-lg transition-transform group-hover:scale-110`}>
                  {step.number}
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-launch-gradient py-20 text-white">
        <div className="pointer-events-none absolute inset-0">
          <FloatingStar size={20} className="absolute top-8 left-[10%] animate-float opacity-30" />
          <FloatingStar size={14} className="absolute top-20 right-[20%] animate-float-slow opacity-20" />
          <FloatingStar size={18} className="absolute bottom-8 left-[30%] animate-float-delayed opacity-25" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Schulab for Schools
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Let&apos;s Build the Future Together
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
            Join schools and organizations worldwide using Schulab to inspire the
            next generation of STEM leaders.
          </p>
          <Link
            href="/contact?subject=School%20Partnership%20Inquiry"
            className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary shadow-lg transition-all hover:shadow-xl"
          >
            Get in Touch
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-4 text-sm text-white/70">
            Or email us directly at hello@schulab.com
          </p>
        </div>
      </section>
    </div>
  );
}
