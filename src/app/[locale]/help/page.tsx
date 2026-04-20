import { getPublishedArticles, getFeaturedArticles } from "@/services/help.service";
import { HelpSearch } from "@/components/help/help-search";
import { CATEGORY_CONFIG, CATEGORIES, getCategoryLabel } from "@/components/help/category-config";
import { Link } from "@/i18n/navigation";
import { BookOpen, ChevronRight } from "lucide-react";
import { getLocale } from "next-intl/server";

export async function generateMetadata() {
  return {
    title: "Help Center | Schulab",
    description: "Find answers, guides, and support for using Schulab.",
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

  function getTitle(article: { title: string; titleAr?: string | null; titleDe?: string | null }) {
    if (locale === "ar" && article.titleAr) return article.titleAr;
    if (locale === "de" && article.titleDe) return article.titleDe;
    return article.title;
  }

  function getExcerpt(article: { excerpt: string; excerptAr?: string | null; excerptDe?: string | null }) {
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
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <BookOpen className="h-7 w-7" />
            </span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Help Center
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Find answers, guides, and support to get the most out of Schulab.
          </p>
          <div className="mx-auto mt-6 max-w-xl">
            <HelpSearchPageWrapper />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Category grid */}
        <section>
          <h2 className="mb-6 text-xl font-bold text-foreground">Browse by Category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const count = articlesByCategory[cat]?.length ?? 0;
              return (
                <a
                  key={cat}
                  href={`#${cat}`}
                  className="group flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${config.bg}`}
                  >
                    {config.icon}
                  </span>
                  <span className="text-xs font-medium text-foreground group-hover:text-primary">
                    {getCategoryLabel(cat, locale)}
                  </span>
                  {count > 0 && (
                    <span className="text-xs text-muted-foreground">{count} articles</span>
                  )}
                </a>
              );
            })}
          </div>
        </section>

        {/* Featured articles */}
        {featuredArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-foreground">Featured Articles</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/help/${article.slug}`}
                  className="group flex flex-col gap-2 rounded-xl border bg-white p-5 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${CATEGORY_CONFIG[article.category]?.bg}`}
                    >
                      {CATEGORY_CONFIG[article.category]?.icon}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getCategoryLabel(article.category, locale)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary">
                    {getTitle(article)}
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {getExcerpt(article)}
                  </p>
                  <span className="mt-auto flex items-center gap-1 text-xs font-medium text-primary">
                    Read article <ChevronRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Articles by category */}
        {usedCategories.map((cat) => (
          <section key={cat} id={cat} className="mt-12 scroll-mt-8">
            <div className="mb-4 flex items-center gap-3">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${CATEGORY_CONFIG[cat]?.bg}`}
              >
                {CATEGORY_CONFIG[cat]?.icon}
              </span>
              <h2 className="text-xl font-bold text-foreground">
                {getCategoryLabel(cat, locale)}
              </h2>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {articlesByCategory[cat].length}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {articlesByCategory[cat].map((article) => (
                <Link
                  key={article.id}
                  href={`/help/${article.slug}`}
                  className="group flex items-start gap-3 rounded-xl border bg-white p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary line-clamp-1">
                      {getTitle(article)}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {getExcerpt(article)}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </section>
        ))}

        {articles.length === 0 && (
          <div className="mt-12 rounded-xl border bg-white py-16 text-center">
            <p className="text-muted-foreground">
              No help articles published yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Client wrapper for search that handles navigation
function HelpSearchPageWrapper() {
  // This is rendered server-side but HelpSearch is a client component
  // It will redirect to /help?q=... on selection via the Link href
  return (
    <HelpSearch
      placeholder="Search for help..."
      className="w-full"
    />
  );
}
