import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { getAllArticlesAdmin } from "@/services/help.service";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Plus, Pencil, ExternalLink, Star } from "lucide-react";
import { CATEGORY_CONFIG, getCategoryLabel } from "@/components/help/category-config";
import { DeleteHelpArticleButton, ToggleHelpPublishButton } from "./help-article-actions";

export const metadata = { title: "Help Articles | Admin | Schulab" };

export default async function AdminHelpPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  const articles = await getAllArticlesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Help Articles</h1>
          <p className="text-muted-foreground">
            {articles.length} article{articles.length !== 1 ? "s" : ""}
            {" · "}
            {articles.filter((a) => a.isPublished).length} published
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/help"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View Help Center
          </Link>
          <Link
            href="/admin/help/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Article
          </Link>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16 text-center">
          <HelpCircle className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="font-display text-lg font-semibold text-foreground">No help articles yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first help article to populate the Help Center.
          </p>
          <Link
            href="/admin/help/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Article
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Feedback</th>
                <th className="px-4 py-3 text-left font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
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
                        {getCategoryLabel(article.category, "en")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={article.isPublished ? "default" : "secondary"}>
                        {article.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {article._count.feedback > 0 ? (
                        <span>{article._count.feedback} responses</span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {article.isPublished && (
                          <Link
                            href={`/help/${article.slug}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="View article"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/help/${article.id}/edit`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="Edit article"
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
