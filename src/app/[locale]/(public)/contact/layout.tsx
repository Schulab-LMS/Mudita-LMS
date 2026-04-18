import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Schulab",
  description:
    "Get in touch with the Schulab team. We're here to help with any questions about our STEM education programs for children ages 3-18.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
