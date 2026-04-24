import type { Metadata } from "next";
import {
  LegalLayout,
  type LegalSection,
} from "@/components/shared/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy | Schulab",
  description:
    "Privacy policy for Schulab. Learn how we collect, use, and protect your data.",
};

const sections: LegalSection[] = [
  { id: "collect", label: "Information we collect" },
  { id: "use", label: "How we use your information" },
  { id: "children", label: "Children's privacy" },
  { id: "sharing", label: "Data sharing" },
  { id: "security", label: "Data security" },
  { id: "rights", label: "Your rights" },
  { id: "cookies", label: "Cookies" },
  { id: "contact", label: "Contact us" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="How we collect, use, and protect your data. COPPA and GDPR compliant."
      lastUpdated="March 2026"
      sections={sections}
    >
      <section id="collect">
        <h2>Information we collect</h2>
        <p>
          We collect information that you provide directly to us when using
          Schulab. This includes:
        </p>
        <ul>
          <li>Name and contact information (email address)</li>
          <li>Learning progress and course completion data</li>
          <li>
            Usage data such as pages visited, features used, and session
            duration
          </li>
        </ul>
      </section>

      <section id="use">
        <h2>How we use your information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>
            Provide, maintain, and improve our educational services and
            platform
          </li>
          <li>
            Personalize your learning experience and recommend relevant courses
          </li>
          <li>
            Communicate with you about your account, updates, and new features
          </li>
        </ul>
      </section>

      <section id="children">
        <h2>Children&apos;s privacy</h2>
        <p>
          We take special care when it comes to children&apos;s data. Parental
          consent is required for users under the age of 13. We do not sell
          children&apos;s personal data under any circumstances. Parents can
          review, modify, or request deletion of their child&apos;s data at
          any time through their parent dashboard.
        </p>
      </section>

      <section id="sharing">
        <h2>Data sharing</h2>
        <p>
          We do not sell your personal data to third parties. We may share
          information with trusted service providers who assist us in
          operating the platform, such as hosting providers, payment
          processors, and analytics services. These providers are
          contractually obligated to protect your data.
        </p>
      </section>

      <section id="security">
        <h2>Data security</h2>
        <p>
          We implement industry-standard security measures to protect your
          data, including encryption in transit and at rest, secure server
          infrastructure, and regular security audits. While no system is
          100% secure, we are committed to protecting your information to the
          best of our ability.
        </p>
      </section>

      <section id="rights">
        <h2>Your rights</h2>
        <p>
          You have the right to access, correct, and delete your personal
          data. You may also request a copy of the data we hold about you. To
          exercise any of these rights, please contact us using the
          information below, or use the &quot;Export my data&quot; and
          &quot;Delete my account&quot; options in your account settings.
        </p>
      </section>

      <section id="cookies">
        <h2>Cookies</h2>
        <p>
          We use cookies to ensure the proper functionality of our platform
          and to gather analytics that help us improve the user experience.
          You can manage your cookie preferences through your browser
          settings or the consent banner that appears on your first visit.
        </p>
      </section>

      <section id="contact">
        <h2>Contact us</h2>
        <p>
          If you have any questions about this Privacy Policy or our data
          practices, please contact us at{" "}
          <a href="mailto:hello@schulab.com">hello@schulab.com</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
