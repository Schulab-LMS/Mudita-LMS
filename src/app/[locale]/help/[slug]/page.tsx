import { notFound } from "next/navigation";
import { getArticleBySlug, getPublishedArticles } from "@/services/help.service";
import { HelpArticleView } from "@/components/help/help-article-view";
import { HelpArticleCard } from "@/components/help/help-article-card";
import { Link } from "@/i18n/navigation";
import { ChevronRight, BookOpen } from "lucide-react";
import { getCategoryLabel, CATEGORY_CONFIG } from "@/components/help/category-config";
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
    .slice(0, 3);

  const categoryLabel = getCategoryLabel(article.category, locale);
  const categoryConfig = CATEGORY_CONFIG[article.category];

  return (
    <div
      className="min-h-screen bg-muted/30"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-1.5 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/help" className="flex items-center gap-1 hover:text-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            Help Center
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href={`/help#${article.category}`}
            className="flex items-center gap-1 hover:text-foreground"
          >
            <span>{categoryConfig?.icon}</span>
            {categoryLabel}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="line-clamp-1 text-foreground">{article.title}</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Article */}
          <div className="rounded-xl border bg-white p-8">
            <HelpArticleView article={article} />
          </div>

          {/* Sidebar: Related */}
          {related.length > 0 && (
            <aside>
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Related Articles
              </h3>
              <div className="flex flex-col gap-2">
                {related.map((rel) => (
                  <Link key={rel.id} href={`/help/${rel.slug}`}>
                    <HelpArticleCard article={rel} />
                  </Link>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  href="/help"
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Back to Help Center
                </Link>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
