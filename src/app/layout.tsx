import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Schulab – The Next Era of Learning",
    template: "%s | Schulab",
  },
  description:
    "Schulab is the next era of learning. Interactive STEM courses, live tutoring, and hands-on kits for children ages 3–18.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
