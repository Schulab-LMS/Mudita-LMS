import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Schulab",
  description: "Terms of service for Schulab platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="py-16">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: March 2026
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          Acceptance of Terms
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          By accessing or using Schulab, you agree to be bound by these Terms
          of Service and all applicable laws and regulations. If you do not agree
          with any of these terms, you may not use the platform.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          Account Registration
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          To access certain features, you must create an account and provide
          accurate, complete information. You are responsible for maintaining the
          security of your account credentials. Parents or legal guardians are
          responsible for managing and overseeing their children&apos;s accounts
          and activity on the platform.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">Use of Services</h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Schulab is intended for educational purposes. You agree to use the
          platform responsibly and not to:
        </p>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Attempt unauthorized access to any part of the platform</li>
          <li>
            Copy, distribute, or modify course content without permission
          </li>
          <li>
            Use the platform in any way that infringes on intellectual property
            rights
          </li>
        </ul>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          Subscriptions &amp; Payments
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Paid plans are billed on a recurring basis (monthly or annually) and
          will automatically renew unless cancelled. You may cancel your
          subscription at any time through your account settings. Refunds are
          available within 14 days of purchase if you are not satisfied with the
          service.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          Content &amp; Intellectual Property
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          All course content, materials, and platform design are owned by Schulab
          LMS and protected by intellectual property laws. By submitting
          user-generated content (such as forum posts or project submissions),
          you grant Schulab a non-exclusive, royalty-free license to use, display,
          and distribute that content within the platform.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          Tutoring Services
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Tutors on Schulab are vetted but operate as independent educators.
          Schulab facilitates the connection between tutors and learners but does
          not guarantee specific learning outcomes. Any disputes between tutors
          and users should be reported to our support team.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">STEM Kits</h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          STEM Kits are physical products subject to our shipping and return
          policies. Delivery times may vary by location. Returns and exchanges
          are accepted within 30 days of delivery, provided the kit is in its
          original condition.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">
          Limitation of Liability
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          To the maximum extent permitted by law, Schulab shall not be liable
          for any indirect, incidental, special, consequential, or punitive
          damages arising from your use of the platform. Our total liability
          shall not exceed the amount you have paid to us in the twelve months
          preceding the claim.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">Termination</h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          We reserve the right to suspend or terminate your account if you
          violate these Terms of Service or engage in conduct that is harmful to
          other users or the platform. You may also delete your account at any
          time.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">Changes to Terms</h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          We may update these Terms of Service from time to time. When we make
          changes, we will notify users via email or a notice on the platform.
          Continued use of the platform after changes constitutes acceptance of
          the updated terms.
        </p>

        <h2 className="mt-8 mb-3 text-xl font-semibold">Contact</h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          If you have any questions about these Terms of Service, please contact
          us at{" "}
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
