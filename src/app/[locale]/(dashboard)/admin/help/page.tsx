import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { getAllArticlesAdmin } from "@/services/help.service";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import {
  HelpCircle,
  Plus,
  Pencil,
  ExternalLink,
  Star,
  MessageSquare,
} from "lucide-react";
import {
  CATEGORY_CONFIG,
  getCategoryLabel,
} from "@/components/help/category-config";
import {
  DeleteHelpArticleButton,
  ToggleHelpPublishButton,
} from "./help-article-actions";

export const metadata = { title: "Help Articles | Admin | Schulab" };

export default async function AdminHelpPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role))
    redirect("/dashboard");

  const articles = await getAllArticlesAdmin();
  const published = articles.filter((a) => a.isPublished).length;
  const drafts = articles.length - published;
  const featured = articles.filter((a) => a.isFeatured).length;
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Help Articles"
        description={`${articles.length} article${
          articles.length === 1 ? "" : "s"
        } · ${published} published · ${drafts} draft${
          drafts === 1 ? "" : "s"
        } · ${featured} featured`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Help Articles" },
        ]}
        actions={
          <>
            <Link
              href="/help"
              target="_blank"
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              View Help Center
            </Link>
            <Link
              href="/admin/help/new"
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-launch-gradient px-3 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              New Article
            </Link>
          </>
        }
      />

      {articles.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title="No help articles yet"
          description="Create your first help article to populate the Help Center. Articles power the /help landing page and search."
          action={{ label: "Create Article", href: "/admin/help/new" }}
          tone="first-use"
          size="lg"
        />
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Title
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Category
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Feedback
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Updated
                  </th>
                  <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map((article) => {
                  const config = CATEGORY_CONFIG[article.category];
                  return (
                    <tr
                      key={article.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <HelpCircle className="h-4 w-4" aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate font-medium text-foreground">
                                {article.title}
                              </p>
                              {article.isFeatured && (
                                <Star
                                  className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                                  aria-label="Featured"
                                />
                              )}
                            </div>
                            {article.tags.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {article.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="chip chip-neutral"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                          <span>{config?.icon}</span>
                          {getCategoryLabel(article.category, "en")}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={
                            article.isPublished
                              ? "chip chip-success"
                              : "chip chip-accent"
                          }
                        >
                          {article.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {article._count.feedback > 0 ? (
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare
                              className="h-3 w-3"
                              aria-hidden
                            />
                            {article._count.feedback}
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {dateFmt.format(new Date(article.updatedAt))}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {article.isPublished && (
                            <Link
                              href={`/help/${article.slug}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              title="View article"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/help/${article.id}/edit`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
        </div>
      )}
    </div>
  );
}
