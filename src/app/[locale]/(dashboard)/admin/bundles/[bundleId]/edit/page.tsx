import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import BundleForm from "@/components/admin/bundle-form";
import { PageHeader } from "@/components/ui/page-header";
import { Layers, ListOrdered } from "lucide-react";

export const metadata = { title: "Edit Bundle | Admin" };

interface EditBundlePageProps {
  params: Promise<{ bundleId: string }>;
}

export default async function EditBundlePage({ params }: EditBundlePageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const { bundleId } = await params;
  const bundle = await db.bundle
    .findUnique({
      where: { id: bundleId },
      select: {
        id: true,
        title: true,
        description: true,
        themeCategory: true,
        ageGroup: true,
        level: true,
        requiredPlan: true,
        status: true,
        finalProjectTitle: true,
        finalProjectDescription: true,
        recommendedDurationWeeks: true,
        thumbnail: true,
      },
    })
    .catch(() => null);

  if (!bundle) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit bundle"
        description={`Update "${bundle.title}".`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Bundles", href: "/admin/bundles" },
          { label: bundle.title },
        ]}
        icon={<Layers className="h-5 w-5" />}
        actions={
          <Link
            href={`/admin/bundles/${bundle.id}/courses`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input px-3 text-xs font-semibold transition-colors hover:bg-muted"
          >
            <ListOrdered className="h-3.5 w-3.5" /> Manage courses
          </Link>
        }
      />
      <BundleForm
        mode="edit"
        initialData={{
          id: bundle.id,
          title: bundle.title,
          description: bundle.description,
          themeCategory: bundle.themeCategory,
          ageGroup: bundle.ageGroup,
          level: bundle.level,
          requiredPlan: bundle.requiredPlan,
          status: bundle.status,
          finalProjectTitle: bundle.finalProjectTitle,
          finalProjectDescription: bundle.finalProjectDescription,
          recommendedDurationWeeks: bundle.recommendedDurationWeeks,
          thumbnail: bundle.thumbnail,
        }}
      />
    </div>
  );
}
