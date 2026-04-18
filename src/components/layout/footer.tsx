"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { FlaskConical } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="bg-foreground text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo & Description */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-white"
            >
              <FlaskConical className="h-6 w-6" />
              <span>Schulab</span>
            </Link>
            <p className="text-sm leading-relaxed">{t("description")}</p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/courses"
                  className="text-sm transition-colors hover:text-white"
                >
                  {nav("courses")}
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm transition-colors hover:text-white"
                >
                  {nav("howItWorks")}
                </Link>
              </li>
              <li>
                <Link
                  href="/for-schools"
                  className="text-sm transition-colors hover:text-white"
                >
                  {nav("forSchools")}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm transition-colors hover:text-white"
                >
                  {nav("pricing")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t("support")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/faq"
                  className="text-sm transition-colors hover:text-white"
                >
                  {t("faq")}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm transition-colors hover:text-white"
                >
                  {t("helpCenter")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm transition-colors hover:text-white"
                >
                  {nav("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t("legal")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm transition-colors hover:text-white"
                >
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm transition-colors hover:text-white"
                >
                  {t("terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
