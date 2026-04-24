"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ScrollText, Printer, Clock } from "lucide-react";

export interface LegalSection {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  title: string;
  description?: string;
  lastUpdated?: string;
  sections: LegalSection[];
  children: ReactNode;
}

/**
 * Two-column wrapper for legal / CMS-style prose. Left column has a sticky
 * table of contents that highlights the section currently intersecting the
 * viewport via IntersectionObserver. Right column is the prose content —
 * callers render their own <section id={...}> blocks, matching the
 * `sections` list they pass in.
 *
 * Prose follows Tailwind's `prose` scale so the existing Markdown-style
 * content just works. Print stylesheet is inlined for clean PDF-ready pages.
 */
export function LegalLayout({
  title,
  description,
  lastUpdated,
  sections,
  children,
}: LegalLayoutProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    if (!sections.length) return;
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-88px 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 1],
      }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="bg-muted/20 print:bg-transparent">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-launch-gradient-soft py-10 sm:py-14 print:border-b-0 print:py-4">
        <div className="aurora-bg opacity-30 print:hidden" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:inline-flex print:hidden"
            >
              <ScrollText className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              {description && (
                <p className="mt-2 max-w-2xl text-base text-muted-foreground">
                  {description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                {lastUpdated && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 font-semibold text-muted-foreground backdrop-blur">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    Last updated: {lastUpdated}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    typeof window !== "undefined" && window.print()
                  }
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 font-semibold text-muted-foreground backdrop-blur transition-colors hover:bg-muted hover:text-foreground print:hidden"
                >
                  <Printer className="h-3.5 w-3.5" aria-hidden />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content grid */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 print:max-w-none print:py-6">
        <div className="grid gap-8 lg:grid-cols-[16rem_1fr] print:grid-cols-1 print:gap-0">
          {/* Sticky TOC (hidden in print) */}
          <aside className="order-2 lg:order-1 print:hidden">
            <nav
              aria-label="On this page"
              className="lg:sticky lg:top-20 lg:h-fit"
            >
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                On this page
              </p>
              <ol className="space-y-0.5 border-s border-border">
                {sections.map((section, i) => {
                  const isActive = section.id === activeId;
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className={`-ms-px block border-s-2 ps-3 py-1.5 text-sm transition-colors ${
                          isActive
                            ? "border-primary font-semibold text-primary"
                            : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                        }`}
                      >
                        <span className="me-2 text-[10px] font-semibold text-muted-foreground/60">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {section.label}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </aside>

          {/* Prose */}
          <article className="order-1 lg:order-2 print:order-none">
            <div className="card-premium p-6 sm:p-10 print:border-none print:bg-transparent print:p-0 print:shadow-none">
              <div className="legal-prose max-w-none text-foreground">
                {children}
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Scoped prose styling — this page class wins over any global prose
          defaults without pulling in the @tailwindcss/typography plugin. */}
      <style>{`
        .legal-prose h2 {
          scroll-margin-top: 6rem;
          font-family: var(--font-display), system-ui, sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          color: var(--foreground);
        }
        .legal-prose h2:first-child { margin-top: 0; }
        .legal-prose h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }
        .legal-prose p {
          line-height: 1.7;
          color: var(--muted-foreground);
          margin-bottom: 1rem;
        }
        .legal-prose ul, .legal-prose ol {
          padding-inline-start: 1.5rem;
          margin-bottom: 1rem;
          color: var(--muted-foreground);
        }
        .legal-prose ul { list-style: disc; }
        .legal-prose ol { list-style: decimal; }
        .legal-prose li { margin-bottom: 0.35rem; line-height: 1.6; }
        .legal-prose a {
          color: var(--primary);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .legal-prose a:hover { opacity: 0.85; }
        .legal-prose strong { color: var(--foreground); font-weight: 600; }
        .legal-prose hr {
          margin: 2rem 0;
          border: 0;
          border-top: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
}
