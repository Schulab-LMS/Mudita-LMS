"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Mail, Shield, Award, Lock, ArrowRight } from "lucide-react";
import { SchulabLogo } from "@/components/brand/schulab-logo";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitted" | "error">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("error");
      return;
    }
    // In a later PR: wire to /api/newsletter. For now, optimistic confirm.
    setStatus("submitted");
    setEmail("");
    setTimeout(() => setStatus("idle"), 4000);
  }

  return (
    <footer className="relative overflow-hidden bg-foreground text-white/70">
      <div className="aurora-bg opacity-30" aria-hidden />

      {/* Newsletter strip */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Get learning tips in your inbox</h2>
            <p className="mt-2 text-sm text-white/70">Weekly STEM ideas for parents, free project downloads, and early access to new courses. No spam — unsubscribe anytime.</p>
          </div>
          <form onSubmit={handleSubmit} className="flex w-full max-w-md items-center gap-2 sm:w-auto">
            <label htmlFor="footer-newsletter" className="sr-only">Email</label>
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" aria-hidden />
              <input
                id="footer-newsletter"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                className="h-11 w-full rounded-lg border border-white/15 bg-white/5 ps-9 pe-3 text-sm text-white placeholder:text-white/40 focus-visible:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-launch-gradient px-5 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
            >
              Subscribe
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </form>
        </div>
        {status === "submitted" && (
          <p className="mx-auto -mt-2 max-w-7xl px-4 pb-4 text-sm text-emerald-300 sm:px-6 lg:px-8" role="status">
            Thanks — check your inbox to confirm your subscription.
          </p>
        )}
        {status === "error" && (
          <p className="mx-auto -mt-2 max-w-7xl px-4 pb-4 text-sm text-amber-300 sm:px-6 lg:px-8" role="alert">
            Please enter a valid email address.
          </p>
        )}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: Logo & Description + social */}
          <div className="space-y-4 lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-xl font-extrabold"
            >
              <SchulabLogo size={26} variant="tile" />
              <span className="text-launch-gradient">Schulab</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed">{t("description")}</p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <TrustBadge icon={<Shield className="h-3.5 w-3.5" />} label="COPPA compliant" />
              <TrustBadge icon={<Lock className="h-3.5 w-3.5" />} label="GDPR ready" />
              <TrustBadge icon={<Award className="h-3.5 w-3.5" />} label="SOC 2 Type I" />
            </div>
          </div>

          {/* Column 2: Learn */}
          <nav aria-label={t("quickLinks")}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{t("quickLinks")}</h3>
            <ul className="space-y-2">
              <li><FooterLink href="/courses" label={nav("courses")} /></li>
              <li><FooterLink href="/how-it-works" label={nav("howItWorks")} /></li>
              <li><FooterLink href="/for-schools" label={nav("forSchools")} /></li>
              <li><FooterLink href="/pricing" label={nav("pricing")} /></li>
            </ul>
          </nav>

          {/* Column 3: Support */}
          <nav aria-label={t("support")}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{t("support")}</h3>
            <ul className="space-y-2">
              <li><FooterLink href="/faq" label={t("faq")} /></li>
              <li><FooterLink href="/help" label={t("helpCenter")} /></li>
              <li><FooterLink href="/contact" label={nav("contact")} /></li>
            </ul>
          </nav>

          {/* Column 4: Legal */}
          <nav aria-label={t("legal")}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{t("legal")}</h3>
            <ul className="space-y-2">
              <li><FooterLink href="/privacy" label={t("privacy")} /></li>
              <li><FooterLink href="/terms" label={t("terms")} /></li>
              <li><FooterLink href="/impressum" label={t("impressum")} /></li>
              <li><FooterLink href="/agb" label={t("agb")} /></li>
              <li><FooterLink href="/widerruf" label={t("widerruf")} /></li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center text-sm md:flex-row md:text-start">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p className="text-xs text-white/50">
            Built with care for curious minds.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center text-sm transition-colors hover:text-white">
      {label}
    </Link>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80">
      {icon}
      {label}
    </span>
  );
}
