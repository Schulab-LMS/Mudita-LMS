import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { getPages } from "@/services/page.service";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Pencil, ExternalLink } from "lucide-react";
import { DeletePageButton, TogglePublishButton } from "./page-actions";

export async function generateMetadata() {
  const t = await getTranslations("admin.pagesList");
  return { title: `${t("pageTitle")} | Schulab` };
}

export default async function AdminPagesPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  const [t, tCommon, locale, pages] = await Promise.all([
    getTranslations("admin.pagesList"),
    getTranslations("admin.common"),
    getLocale(),
    getPages(true),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{t("pageTitle")}</h1>
          <p className="text-muted-foreground">{t("pageCount", { count: pages.length })}</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t("newPage")}
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16 text-center">
          <FileText className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="font-display text-lg font-semibold text-foreground">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("emptyBody")}</p>
          <Link
            href="/admin/pages/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("createPage")}
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t("titleCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("slugCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("statusCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("updatedCol")}</th>
                <th className="px-4 py-3 text-end font-medium">{tCommon("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{page.title}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    /pages/{page.slug}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={page.isPublished ? "default" : "secondary"}>
                      {page.isPublished ? tCommon("published") : tCommon("draft")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {dateFormatter.format(new Date(page.updatedAt))}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {page.isPublished && (
                        <Link
                          href={`/pages/${page.slug}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title={t("viewPageTooltip")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/pages/${page.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title={t("editPageTooltip")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <TogglePublishButton pageId={page.id} isPublished={page.isPublished} />
                      <DeletePageButton pageId={page.id} title={page.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
