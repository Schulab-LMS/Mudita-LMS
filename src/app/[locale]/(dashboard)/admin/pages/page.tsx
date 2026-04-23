import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { getPages } from "@/services/page.service";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import { FileText, Plus, Pencil, ExternalLink } from "lucide-react";
import { DeletePageButton, TogglePublishButton } from "./page-actions";

export const metadata = { title: "CMS Pages | Admin | Schulab" };

export default async function AdminPagesPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role))
    redirect("/dashboard");

  const pages = await getPages(true);
  const published = pages.filter((p) => p.isPublished).length;
  const drafts = pages.length - published;
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="CMS Pages"
        description={`${pages.length} page${
          pages.length === 1 ? "" : "s"
        } · ${published} published · ${drafts} draft${
          drafts === 1 ? "" : "s"
        }`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "CMS Pages" },
        ]}
        actions={
          <Link
            href="/admin/pages/new"
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-launch-gradient px-3 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            New Page
          </Link>
        }
      />

      {pages.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title="No CMS pages yet"
          description="Create your first custom landing or info page — content editors will be able to update it without touching code."
          action={{ label: "Create Page", href: "/admin/pages/new" }}
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
                    Slug
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Last Updated
                  </th>
                  <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pages.map((page) => (
                  <tr
                    key={page.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" aria-hidden />
                        </span>
                        <p className="truncate font-medium text-foreground">
                          {page.title}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">
                      /pages/{page.slug}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          page.isPublished
                            ? "chip chip-success"
                            : "chip chip-accent"
                        }
                      >
                        {page.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {dateFmt.format(new Date(page.updatedAt))}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {page.isPublished && (
                          <Link
                            href={`/pages/${page.slug}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            title="View page"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/pages/${page.id}/edit`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Edit page"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <TogglePublishButton
                          pageId={page.id}
                          isPublished={page.isPublished}
                        />
                        <DeletePageButton
                          pageId={page.id}
                          title={page.title}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
