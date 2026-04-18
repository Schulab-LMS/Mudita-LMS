import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ | Schulab",
  description:
    "Frequently asked questions about Schulab STEM education platform for children ages 3-18.",
};

const faqs = [
  {
    q: "What age groups does Schulab support?",
    a: "Schulab offers STEM courses for children ages 3 to 18, organized into four learning paths: Early Learners (3–5), Kids (6–8), Juniors (9–12), and Teens (13–18). Each path features age-appropriate content and teaching methods.",
  },
  {
    q: "What subjects are available?",
    a: "Our courses cover a wide range of STEM subjects including Mathematics, Coding & Programming, Science, Robotics, Engineering, Artificial Intelligence, Electronics, Biology, Chemistry, and Physics.",
  },
  {
    q: "How does live tutoring work?",
    a: "Our verified tutors offer one-on-one live sessions via video call. You can browse tutor profiles, check their qualifications and availability, and book sessions at times that work for your family. Sessions are tailored to your child's learning level.",
  },
  {
    q: "What are STEM Kits?",
    a: "STEM Kits are hands-on science and engineering kits shipped to your door. Each kit includes all the materials needed for practical experiments and projects, paired with online guided lessons. They make learning tangible and fun.",
  },
  {
    q: "Is Schulab available in multiple languages?",
    a: "Yes! Schulab currently supports English, Arabic, and German. We're continuously working to add more languages to make STEM education accessible worldwide.",
  },
  {
    q: "How much does Schulab cost?",
    a: "Schulab offers a free tier with access to select courses, a Pro plan at $19/month with full access and certificates, and custom School plans for educational institutions. Visit our Pricing page for details.",
  },
  {
    q: "Can I track my child's progress?",
    a: "Absolutely. Parents have a dedicated dashboard where they can monitor their children's course progress, completed lessons, earned badges, certificates, and overall learning journey in real-time.",
  },
  {
    q: "How are tutors vetted?",
    a: "All tutors go through an application and verification process. We review their qualifications, teaching experience, and subject expertise before they can offer sessions on the platform.",
  },
  {
    q: "Is my child's data safe?",
    a: "Yes. We take data privacy seriously, especially for children. We follow strict data protection practices and comply with relevant regulations. See our Privacy Policy for full details.",
  },
  {
    q: "Can schools use Schulab?",
    a: "Yes! We offer dedicated plans for schools and educational institutions with features like bulk enrollment, admin dashboards, custom branding, and dedicated support. Contact us to learn more.",
  },
];

export default function FAQPage() {
  return (
    <div className="py-16">
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Find answers to common questions about Schulab and our STEM
          education platform.
        </p>
      </section>

      {/* FAQ Items */}
      <section className="mx-auto mt-12 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="divide-y rounded-xl border">
          {faqs.map((faq, index) => (
            <details key={index} className="group">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-muted">
                <span className="font-medium">{faq.q}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-4 text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
