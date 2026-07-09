import {
  getPublishedArticles,
  getFeaturedArticles,
} from "@/services/help.service";
import { HelpSearch } from "@/components/help/help-search";
import {
  CATEGORY_CONFIG,
  CATEGORIES,
  getCategoryLabel,
} from "@/components/help/category-config";
import { Link } from "@/i18n/navigation";
import {
  BookOpen,
  ChevronRight,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Star,
} from "lucide-react";
import { getLocale } from "next-intl/server";

export async function generateMetadata() {
  return {
    title: "Help Center",
    description:
      "Find answers, guides, and support for using Schulab.",
  };
}

export default async function HelpCenterPage() {
  const [articles, featuredArticles, locale] = await Promise.all([
    getPublishedArticles(),
    getFeaturedArticles(),
    getLocale(),
  ]);

  const articlesByCategory = CATEGORIES.reduce<
    Record<string, typeof articles>
  >((acc, cat) => {
    acc[cat] = articles.filter((a) => a.category === cat);
    return acc;
  }, {});

  const usedCategories = CATEGORIES.filter(
    (cat) => articlesByCategory[cat].length > 0
  );

  function getTitle(article: {
    title: string;
    titleAr?: string | null;
    titleDe?: string | null;
  }) {
    if (locale === "ar" && article.titleAr) return article.titleAr;
    if (locale === "de" && article.titleDe) return article.titleDe;
    return article.title;
  }

  function getExcerpt(article: {
    excerpt: string;
    excerptAr?: string | null;
    excerptDe?: string | null;
  }) {
    if (locale === "ar" && article.excerptAr) return article.excerptAr;
    if (locale === "de" && article.excerptDe) return article.excerptDe;
    return article.excerpt;
  }

  return (
    <div
      className="min-h-screen bg-muted/30"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Hero */}
      <section className="relative overflow-hidden bg-launch-gradient-soft py-16 sm:py-20">
        <div className="aurora-bg opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden />
            <span className="text-launch-gradient">We&apos;re here to help</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Help Center
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Find answers, guides, and support to get the most out of Schulab.
          </p>
          <div className="mx-auto mt-6 max-w-xl">
            <HelpSearchPageWrapper />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {articles.length} article{articles.length === 1 ? "" : "s"} ·{" "}
            {usedCategories.length} categor
            {usedCategories.length === 1 ? "y" : "ies"}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Category grid */}
        <section>
          <h2 className="mb-5 font-display text-xl font-bold text-foreground">
            Browse by category
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const count = articlesByCategory[cat]?.length ?? 0;
              return (
                <a
                  key={cat}
                  href={`#${cat}`}
                  className="card-premium group flex flex-col items-center gap-2 p-4 text-center transition-all hover:-translate-y-0.5"
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${config.bg}`}
                  >
                    {config.icon}
                  </span>
                  <span className="text-xs font-medium text-foreground group-hover:text-primary">
                    {getCategoryLabel(cat, locale)}
                  </span>
                  <span className="chip chip-neutral text-[10px]">
                    {count} article{count === 1 ? "" : "s"}
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* Featured articles */}
        {featuredArticles.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-foreground">
                Featured articles
              </h2>
              <Star
                className="h-4 w-4 fill-amber-400 text-amber-400"
                aria-hidden
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/help/${article.slug}`}
                  className="card-premium group relative flex flex-col gap-2 overflow-hidden p-5 transition-all hover:-translate-y-0.5"
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-1 bg-launch-gradient-horizontal"
                  />
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${CATEGORY_CONFIG[article.category]?.bg}`}
                    >
                      {CATEGORY_CONFIG[article.category]?.icon}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {getCategoryLabel(article.category, locale)}
                    </span>
                    <Star
                      className="ms-auto h-3 w-3 fill-amber-400 text-amber-400"
                      aria-hidden
                    />
                  </div>
                  <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                    {getTitle(article)}
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {getExcerpt(article)}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Read article
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Articles by category */}
        {usedCategories.map((cat) => (
          <section key={cat} id={cat} className="mt-12 scroll-mt-20">
            <div className="mb-4 flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${CATEGORY_CONFIG[cat]?.bg}`}
              >
                {CATEGORY_CONFIG[cat]?.icon}
              </span>
              <h2 className="font-display text-xl font-bold text-foreground">
                {getCategoryLabel(cat, locale)}
              </h2>
              <span className="chip chip-neutral">
                {articlesByCategory[cat].length}
              </span>
            </div>
            <div className="card-premium divide-y divide-border overflow-hidden">
              {articlesByCategory[cat].map((article) => (
                <Link
                  key={article.id}
                  href={`/help/${article.slug}`}
                  className="group flex items-start gap-3 p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-foreground group-hover:text-primary">
                      {getTitle(article)}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {getExcerpt(article)}
                    </p>
                  </div>
                  <ChevronRight
                    className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          </section>
        ))}

        {articles.length === 0 && (
          <div className="card-premium mt-12 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <BookOpen className="h-6 w-6" aria-hidden />
            </div>
            <p className="mt-3 font-semibold text-foreground">
              No help articles published yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check back soon — we&apos;re adding new guides every week.
            </p>
          </div>
        )}

        {/* Still need help CTA */}
        <section className="mt-16">
          <div className="card-premium flex flex-col items-center gap-4 overflow-hidden bg-launch-gradient-soft p-8 text-center sm:flex-row sm:text-start">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <MessageSquare className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-foreground">
                Still need help?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Can&apos;t find what you&apos;re looking for? Our team replies
                within 24 hours.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-launch-gradient px-5 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Contact support
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// Client wrapper for search that handles navigation
function HelpSearchPageWrapper() {
  return (
    <HelpSearch placeholder="Search for help articles…" className="w-full" />
  );
}
