import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { getAllArticlesAdmin } from "@/services/help.service";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Plus, Pencil, ExternalLink, Star } from "lucide-react";
import { CATEGORY_CONFIG, getCategoryLabel } from "@/components/help/category-config";
import { DeleteHelpArticleButton, ToggleHelpPublishButton } from "./help-article-actions";

export async function generateMetadata() {
  const t = await getTranslations("admin.helpArticles");
  return { title: `${t("pageTitle")} | Schulab` };
}

export default async function AdminHelpPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  const [t, tCommon, locale, articles] = await Promise.all([
    getTranslations("admin.helpArticles"),
    getTranslations("admin.common"),
    getLocale(),
    getAllArticlesAdmin(),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const publishedCount = articles.filter((a) => a.isPublished).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{t("pageTitle")}</h1>
          <p className="text-muted-foreground">
            {t("articleCount", { count: articles.length })}
            {" · "}
            {t("publishedCount", { count: publishedCount })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/help"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            {t("viewHelpCenter")}
          </Link>
          <Link
            href="/admin/help/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("newArticle")}
          </Link>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16 text-center">
          <HelpCircle className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="font-display text-lg font-semibold text-foreground">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("emptyBody")}
          </p>
          <Link
            href="/admin/help/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("createArticle")}
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t("titleCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("categoryCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("statusCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("feedbackCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("updatedCol")}</th>
                <th className="px-4 py-3 text-end font-medium">{tCommon("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {articles.map((article) => {
                const config = CATEGORY_CONFIG[article.category];
                return (
                  <tr key={article.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{article.title}</span>
                        {article.isFeatured && (
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        )}
                      </div>
                      <div className="mt-0.5 flex gap-1.5">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-sm">
                        <span>{config?.icon}</span>
                        {getCategoryLabel(article.category, locale)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={article.isPublished ? "default" : "secondary"}>
                        {article.isPublished ? tCommon("published") : tCommon("draft")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {article._count.feedback > 0 ? (
                        <span>{t("responses", { count: article._count.feedback })}</span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {dateFormatter.format(new Date(article.updatedAt))}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {article.isPublished && (
                          <Link
                            href={`/help/${article.slug}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title={t("viewArticleTooltip")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/help/${article.id}/edit`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title={t("editArticleTooltip")}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <ToggleHelpPublishButton
                          articleId={article.id}
                          isPublished={article.isPublished}
                        />
                        <DeleteHelpArticleButton
                          articleId={article.id}
                          title={article.title}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
