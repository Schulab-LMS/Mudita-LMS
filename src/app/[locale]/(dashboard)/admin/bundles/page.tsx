import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import { BundleRowActions } from "@/components/admin/bundle-row-actions";
import { ageGroupLabels } from "@/components/course/catalog-labels";
import { Plus, Layers } from "lucide-react";

export const metadata = { title: "Bundles | Admin" };

const statusChipTone: Record<string, string> = {
  PUBLISHED: "chip chip-success",
  DRAFT: "chip chip-accent",
  ARCHIVED: "chip chip-neutral",
};

export default async function AdminBundlesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const bundles = await db.bundle
    .findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        ageGroup: true,
        themeCategory: true,
        level: true,
        _count: { select: { courses: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bundles"
        description={`${bundles.length} bundle${bundles.length === 1 ? "" : "s"}`}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Bundles" }]}
        actions={
          <Link
            href="/admin/bundles/new"
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-launch-gradient px-3 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            New bundle
          </Link>
        }
      />

      {bundles.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title="No bundles yet"
          description="Group related courses into a themed bundle that ends in a final project."
          action={{ label: "New bundle", href: "/admin/bundles/new" }}
          tone="first-use"
          size="lg"
        />
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">Theme</th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">Age</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Courses</th>
                  <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bundles.map((bundle) => (
                  <tr key={bundle.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-launch-gradient-soft">
                          <Layers className="h-4 w-4 text-primary" />
                        </span>
                        <div className="min-w-0">
                          <Link href={`/admin/bundles/${bundle.id}/edit`} className="truncate font-medium text-foreground hover:text-primary">
                            {bundle.title}
                          </Link>
                          <p className="truncate font-mono text-[11px] text-muted-foreground">/{bundle.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={statusChipTone[bundle.status] ?? "chip chip-neutral"}>{bundle.status}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{bundle.themeCategory}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{ageGroupLabels[bundle.ageGroup] ?? bundle.ageGroup}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">
                        {bundle._count.courses}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <BundleRowActions bundleId={bundle.id} />
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
