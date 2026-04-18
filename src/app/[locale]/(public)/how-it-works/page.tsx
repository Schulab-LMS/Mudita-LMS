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
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";


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
  },
  {
    number: 2,
    title: "Learn & Practice",
    description:
      "Your child learns through interactive video lessons, quizzes, and hands-on STEM kit activities. Live tutoring sessions provide personalized support when needed.",
    icon: BookOpen,
  },
  {
    number: 3,
    title: "Achieve & Grow",
    description:
      "Track progress through your parent dashboard. Earn badges and certificates as your child masters new skills and builds confidence in STEM.",
    icon: Trophy,
  },
];

const approaches = [
  {
    title: "Interactive Video Lessons",
    description:
      "Engaging, age-appropriate video content designed by experienced STEM educators. Short, focused lessons that keep young minds engaged.",
    icon: Monitor,
  },
  {
    title: "Hands-On STEM Kits",
    description:
      "Physical science and engineering kits delivered to your door. Real experiments and projects that bring theory to life.",
    icon: Wrench,
  },
  {
    title: "Live Expert Tutoring",
    description:
      "One-on-one sessions with verified STEM tutors. Personalized learning support tailored to your child's pace and level.",
    icon: Video,
  },
  {
    title: "Gamified Progress",
    description:
      "Badges, points, certificates, and leaderboards make learning feel like an adventure. Children stay motivated and excited to learn more.",
    icon: Gamepad2,
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
    <div className="py-20">
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          How Schulab Works
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          A simple, structured approach to STEM education that makes learning
          joyful and effective.
        </p>
      </section>

      {/* 3-Step Process */}
      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {step.number}
                </div>
                <div className="mt-6 flex justify-center">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Learning Approach Section */}
      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
          Our Learning Approach
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {approaches.map((approach) => {
            const Icon = approach.icon;
            return (
              <Card key={approach.title} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{approach.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed text-muted-foreground">
                    {approach.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Safety & Trust Section */}
      <section className="mx-auto mt-20 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-muted/50 p-8">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">
              Your Child&apos;s Safety Comes First
            </h2>
          </div>
          <ul className="mx-auto mt-8 max-w-2xl space-y-4">
            {safetyPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-8 py-16 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/90">
            Join thousands of families already learning with Schulab.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary shadow-lg hover:bg-white/90 transition-all"
          >
            Start Learning for Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
