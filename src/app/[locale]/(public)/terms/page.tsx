import type { Metadata } from "next";
import {
  LegalLayout,
  type LegalSection,
} from "@/components/shared/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for Schulab platform.",
};

const sections: LegalSection[] = [
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "registration", label: "Account registration" },
  { id: "use", label: "Use of services" },
  { id: "payments", label: "Subscriptions & payments" },
  { id: "ip", label: "Content & intellectual property" },
  { id: "tutoring", label: "Tutoring services" },
  { id: "kits", label: "STEM kits" },
  { id: "liability", label: "Limitation of liability" },
  { id: "termination", label: "Termination" },
  { id: "changes", label: "Changes to terms" },
  { id: "contact", label: "Contact" },
];

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="The rules for using Schulab — written plainly. If anything is unclear, write to us and we'll explain."
      lastUpdated="March 2026"
      sections={sections}
    >
      <section id="acceptance">
        <h2>Acceptance of terms</h2>
        <p>
          By accessing or using Schulab, you agree to be bound by these Terms
          of Service and all applicable laws and regulations. If you do not
          agree with any of these terms, you may not use the platform.
        </p>
      </section>

      <section id="registration">
        <h2>Account registration</h2>
        <p>
          To access certain features, you must create an account and provide
          accurate, complete information. You are responsible for maintaining
          the security of your account credentials. Parents or legal guardians
          are responsible for managing and overseeing their children&apos;s
          accounts and activity on the platform.
        </p>
      </section>

      <section id="use">
        <h2>Use of services</h2>
        <p>
          Schulab is intended for educational purposes. You agree to use the
          platform responsibly and not to:
        </p>
        <ul>
          <li>Attempt unauthorized access to any part of the platform</li>
          <li>Copy, distribute, or modify course content without permission</li>
          <li>
            Use the platform in any way that infringes on intellectual
            property rights
          </li>
        </ul>
      </section>

      <section id="payments">
        <h2>Subscriptions &amp; payments</h2>
        <p>
          Paid plans are billed on a recurring basis (monthly or annually) and
          will automatically renew unless cancelled. You may cancel your
          subscription at any time through your account settings. Refunds are
          available within 14 days of purchase if you are not satisfied with
          the service.
        </p>
      </section>

      <section id="ip">
        <h2>Content &amp; intellectual property</h2>
        <p>
          All course content, materials, and platform design are owned by
          Schulab LMS and protected by intellectual property laws. By
          submitting user-generated content (such as forum posts or project
          submissions), you grant Schulab a non-exclusive, royalty-free
          license to use, display, and distribute that content within the
          platform.
        </p>
      </section>

      <section id="tutoring">
        <h2>Tutoring services</h2>
        <p>
          Tutors on Schulab are vetted but operate as independent educators.
          Schulab facilitates the connection between tutors and learners but
          does not guarantee specific learning outcomes. Any disputes between
          tutors and users should be reported to our support team.
        </p>
      </section>

      <section id="kits">
        <h2>STEM kits</h2>
        <p>
          STEM Kits are physical products subject to our shipping and return
          policies. Delivery times may vary by location. Returns and exchanges
          are accepted within 30 days of delivery, provided the kit is in its
          original condition.
        </p>
      </section>

      <section id="liability">
        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Schulab shall not be liable
          for any indirect, incidental, special, consequential, or punitive
          damages arising from your use of the platform. Our total liability
          shall not exceed the amount you have paid to us in the twelve months
          preceding the claim.
        </p>
      </section>

      <section id="termination">
        <h2>Termination</h2>
        <p>
          We reserve the right to suspend or terminate your account if you
          violate these Terms of Service or engage in conduct that is harmful
          to other users or the platform. You may also delete your account at
          any time.
        </p>
      </section>

      <section id="changes">
        <h2>Changes to terms</h2>
        <p>
          We may update these Terms of Service from time to time. When we make
          changes, we will notify users via email or a notice on the platform.
          Continued use of the platform after changes constitutes acceptance
          of the updated terms.
        </p>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>
          If you have any questions about these Terms of Service, please
          contact us at{" "}
          <a href="mailto:hello@schulab.com">hello@schulab.com</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
