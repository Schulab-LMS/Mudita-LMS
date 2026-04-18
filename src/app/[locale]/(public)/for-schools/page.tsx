import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import {
  BookOpen,
  BarChart3,
  Settings,
  Headphones,
  Check,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

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
    color: "text-blue-600 bg-blue-100",
  },
  {
    title: "Admin Dashboard & Analytics",
    description:
      "Monitor student progress, manage enrollments, and generate reports through a powerful administration panel.",
    icon: BarChart3,
    color: "text-purple-600 bg-purple-100",
  },
  {
    title: "Flexible Implementation",
    description:
      "Use Schulab as a standalone platform, supplement your existing curriculum, or integrate via our API. Custom branding available.",
    icon: Settings,
    color: "text-green-600 bg-green-100",
  },
  {
    title: "Dedicated Support",
    description:
      "Get a dedicated account manager, teacher training, technical support, and onboarding assistance.",
    icon: Headphones,
    color: "text-orange-600 bg-orange-100",
  },
];

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
      <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-background py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
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
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-primary/90 transition-all"
            >
              Request a Demo
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-base font-semibold text-foreground hover:bg-muted transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Why Schools Choose Schulab */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
          Why Schools Choose Schulab
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${feature.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
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
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="p-8">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">
            Everything Your Institution Needs
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <ul className="space-y-4">
              {leftFeatures.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <ul className="space-y-4">
              {rightFeatures.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </section>

      {/* How It Works for Schools */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            How It Works for Schools
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {schoolSteps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {step.number}
                </div>
                <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-foreground py-20 text-background">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Let&apos;s Build the Future Together
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-background/80">
            Join schools and organizations worldwide using Schulab to inspire the
            next generation of STEM leaders.
          </p>
          <Link
            href="/contact?subject=School%20Partnership%20Inquiry"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-foreground shadow-lg hover:bg-white/90 transition-all"
          >
            Get in Touch
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-sm text-background/60">
            Or email us directly at hello@schulab.com
          </p>
        </div>
      </section>
    </div>
  );
}
