"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  ChevronDown,
  HelpCircle,
  Search,
  Sparkles,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

// This page is "use client" for search/filter state. Document title falls
// back to the layout's template; override in a server wrapper if needed.

interface Faq {
  q: string;
  a: string;
  category: Category;
  tags?: string[];
}

type Category =
  | "all"
  | "getting-started"
  | "pricing"
  | "courses"
  | "parents"
  | "tutors"
  | "safety";

const FAQ_CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: "all", label: "All", emoji: "✨" },
  { key: "getting-started", label: "Getting started", emoji: "🚀" },
  { key: "pricing", label: "Pricing", emoji: "💳" },
  { key: "courses", label: "Courses", emoji: "📚" },
  { key: "parents", label: "For parents", emoji: "👨‍👩‍👧" },
  { key: "tutors", label: "Tutors", emoji: "🎓" },
  { key: "safety", label: "Safety", emoji: "🛡️" },
];

const faqs: Faq[] = [
  {
    q: "What age groups does Schulab support?",
    a: "Schulab offers STEM courses for children ages 3 to 18, organized into four learning paths: Early Learners (3–5), Kids (6–8), Juniors (9–12), and Teens (13–18). Each path features age-appropriate content and teaching methods.",
    category: "getting-started",
  },
  {
    q: "What subjects are available?",
    a: "Our courses cover a wide range of STEM subjects including Mathematics, Coding & Programming, Science, Robotics, Engineering, Artificial Intelligence, Electronics, Biology, Chemistry, and Physics.",
    category: "courses",
  },
  {
    q: "How does live tutoring work?",
    a: "Our verified tutors offer one-on-one live sessions via video call. You can browse tutor profiles, check their qualifications and availability, and book sessions at times that work for your family. Sessions are tailored to your child's learning level.",
    category: "tutors",
  },
  {
    q: "What are STEM Kits?",
    a: "STEM Kits are hands-on science and engineering kits shipped to your door. Each kit includes all the materials needed for practical experiments and projects, paired with online guided lessons. They make learning tangible and fun.",
    category: "courses",
  },
  {
    q: "Is Schulab available in multiple languages?",
    a: "Yes! Schulab currently supports English, Arabic, and German. We're continuously working to add more languages to make STEM education accessible worldwide.",
    category: "getting-started",
  },
  {
    q: "How much does Schulab cost?",
    a: "Schulab offers a Solo plan at €49/month per learner, a Family plan at €88/month for up to 3 children, and a Custom plan for schools, partners, and bespoke households. Each plan includes 4 live tutor sessions per month — and your very first session is free. Save 20% by paying annually. Visit our Pricing page for details.",
    category: "pricing",
  },
  {
    q: "Can I track my child's progress?",
    a: "Absolutely. Parents have a dedicated dashboard where they can monitor their children's course progress, completed lessons, earned badges, certificates, and overall learning journey in real-time.",
    category: "parents",
  },
  {
    q: "How are tutors vetted?",
    a: "All tutors go through an application and verification process. We review their qualifications, teaching experience, background checks, and subject expertise before they can offer sessions on the platform.",
    category: "tutors",
  },
  {
    q: "Is my child's data safe?",
    a: "Yes. We take data privacy seriously, especially for children. We are COPPA compliant, GDPR ready, and SOC 2 Type I certified. See our Privacy Policy for full details.",
    category: "safety",
  },
  {
    q: "Can schools use Schulab?",
    a: "Yes! We offer dedicated plans for schools and educational institutions with features like bulk enrollment, admin dashboards, custom branding, and dedicated support. Contact us to learn more.",
    category: "getting-started",
  },
];

export default function FAQPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      if (category !== "all" && f.category !== category) return false;
      if (!q) return true;
      return (
        f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-launch-gradient-soft py-14 sm:py-20">
        <div className="aurora-bg opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
            <HelpCircle className="h-4 w-4 text-accent" aria-hidden />
            <span className="text-launch-gradient">We&apos;re here to help</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Frequently asked questions
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
            Find answers about Schulab, our STEM courses, tutors, pricing, and
            safety.
          </p>

          {/* Search */}
          <div className="mx-auto mt-6 max-w-xl">
            <div className="relative">
              <Search
                className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions…"
                className="input-pretty h-12 w-full rounded-xl border border-border bg-card ps-10 pe-4 text-sm shadow-soft focus-visible:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <section className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {FAQ_CATEGORIES.map((c) => {
            const count =
              c.key === "all"
                ? faqs.length
                : faqs.filter((f) => f.category === c.key).length;
            const active = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all " +
                  (active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background hover:border-foreground/20 hover:bg-muted")
                }
              >
                <span aria-hidden>{c.emoji}</span>
                {c.label}
                <span
                  className={
                    "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold " +
                    (active
                      ? "bg-white/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground")
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* FAQ items */}
      <section className="mx-auto mb-8 mt-6 max-w-4xl px-4 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="card-premium py-12 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Search className="h-6 w-6" aria-hidden />
            </div>
            <p className="mt-3 font-semibold text-foreground">No matches</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term or clear filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="mt-4 inline-flex h-9 items-center rounded-lg border border-input bg-background px-3 text-xs font-semibold transition-colors hover:bg-muted"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="card-premium divide-y divide-border">
            {filtered.map((faq, index) => (
              <details key={index} className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40 sm:px-6 sm:py-5">
                  <span className="font-display font-semibold text-foreground">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <div className="px-5 pb-5 sm:px-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                  <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    <span>Was this helpful?</span>
                    <button
                      type="button"
                      className="inline-flex h-7 items-center rounded-md border border-input px-2 font-semibold transition-colors hover:bg-muted"
                    >
                      👍 Yes
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-7 items-center rounded-md border border-input px-2 font-semibold transition-colors hover:bg-muted"
                    >
                      👎 No
                    </button>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </section>

      {/* Still need help CTA */}
      <section className="mx-auto mb-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="card-premium flex flex-col items-center gap-4 overflow-hidden bg-launch-gradient-soft p-8 text-center sm:flex-row sm:text-start">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <MessageSquare className="h-5 w-5" aria-hidden />
          </span>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-foreground">
              Didn&apos;t find your answer?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Our team replies within 24 hours — ask us anything about courses,
              billing, or getting started.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-launch-gradient px-5 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Contact support
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
