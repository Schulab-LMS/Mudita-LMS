import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Schulab",
  description:
    "Privacy policy for Schulab. Learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: March 2026
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          Information We Collect
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          We collect information that you provide directly to us when using
          Schulab. This includes:
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Name and contact information (email address)</li>
          <li>Learning progress and course completion data</li>
          <li>
            Usage data such as pages visited, features used, and session
            duration
          </li>
        </ul>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          How We Use Your Information
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          We use the information we collect to:
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>
            Provide, maintain, and improve our educational services and platform
          </li>
          <li>
            Personalize your learning experience and recommend relevant courses
          </li>
          <li>
            Communicate with you about your account, updates, and new features
          </li>
        </ul>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          Children&apos;s Privacy
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          We take special care when it comes to children&apos;s data. Parental
          consent is required for users under the age of 13. We do not sell
          children&apos;s personal data under any circumstances. Parents can
          review, modify, or request deletion of their child&apos;s data at any
          time through their parent dashboard.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">Data Sharing</h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          We do not sell your personal data to third parties. We may share
          information with trusted service providers who assist us in operating
          the platform, such as hosting providers, payment processors, and
          analytics services. These providers are contractually obligated to
          protect your data.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">Data Security</h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          We implement industry-standard security measures to protect your data,
          including encryption in transit and at rest, secure server
          infrastructure, and regular security audits. While no system is 100%
          secure, we are committed to protecting your information to the best of
          our ability.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">Your Rights</h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          You have the right to access, correct, and delete your personal data.
          You may also request a copy of the data we hold about you. To exercise
          any of these rights, please contact us using the information below.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">Cookies</h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          We use cookies to ensure the proper functionality of our platform and
          to gather analytics that help us improve the user experience. You can
          manage your cookie preferences through your browser settings.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">Contact Us</h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          If you have any questions about this Privacy Policy or our data
          practices, please contact us at{" "}
          <a
            href="mailto:hello@schulab.com"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            hello@schulab.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
