import { notFound } from "next/navigation";
import {
  getArticleBySlug,
  getPublishedArticles,
} from "@/services/help.service";
import { HelpArticleView } from "@/components/help/help-article-view";
import { HelpArticleCard } from "@/components/help/help-article-card";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BookOpen, Sparkles, ArrowRight, MessageSquare } from "lucide-react";
import {
  getCategoryLabel,
  CATEGORY_CONFIG,
} from "@/components/help/category-config";
import { getLocale } from "next-intl/server";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: `${article.title} | Help Center | Schulab`,
    description: article.excerpt,
  };
}

export default async function HelpArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [article, allArticles, locale] = await Promise.all([
    getArticleBySlug(slug),
    getPublishedArticles(),
    getLocale(),
  ]);

  if (!article) notFound();

  // Related articles: same category, different article
  const related = allArticles
    .filter((a) => a.category === article.category && a.slug !== slug)
    .slice(0, 4);

  const categoryLabel = getCategoryLabel(article.category, locale);
  const categoryConfig = CATEGORY_CONFIG[article.category];

  return (
    <div
      className="min-h-screen bg-muted/30"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Breadcrumb strip */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <Breadcrumbs
            items={[
              {
                label: "Help Center",
                href: "/help",
                icon: <BookOpen className="h-3.5 w-3.5" aria-hidden />,
              },
              {
                label: categoryLabel,
                href: `/help#${article.category}`,
              },
              { label: article.title },
            ]}
          />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Article body */}
          <div className="card-premium p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-2">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-base ${categoryConfig?.bg}`}
              >
                {categoryConfig?.icon}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {categoryLabel}
              </span>
            </div>
            <HelpArticleView article={article} />
          </div>

          {/* Sidebar: related + back link */}
          <aside className="space-y-4">
            {related.length > 0 && (
              <div className="card-premium p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Related articles
                </h3>
                <div className="flex flex-col gap-2">
                  {related.map((rel) => (
                    <Link key={rel.id} href={`/help/${rel.slug}`}>
                      <HelpArticleCard article={rel} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Still need help CTA */}
            <div className="rounded-2xl border border-primary/20 bg-launch-gradient-soft p-5">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <MessageSquare className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Didn&apos;t solve it?
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Our team replies within 24 hours.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-3 inline-flex h-8 items-center gap-1 rounded-md bg-launch-gradient px-3 text-xs font-semibold text-white shadow-sm"
                  >
                    <Sparkles className="h-3 w-3" aria-hidden />
                    Contact support
                  </Link>
                </div>
              </div>
            </div>

            {/* Back link */}
            <Link
              href="/help"
              className="group inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              Back to Help Center
              <ArrowRight
                className="h-3 w-3 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                aria-hidden
              />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
