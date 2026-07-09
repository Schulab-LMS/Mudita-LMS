import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { getPageById } from "@/services/page.service";
import { PageForm } from "../../page-form";
import { PageHeader } from "@/components/ui/page-header";
import { Pencil } from "lucide-react";

export const metadata = { title: "Edit Page | Admin" };

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  const { pageId } = await params;
  const page = await getPageById(pageId);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Edit page"
        description={`Update content for "${page.title}".`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Pages", href: "/admin/pages" },
          { label: page.title },
        ]}
        icon={<Pencil className="h-5 w-5" />}
      />
      <div className="card-premium p-6">
        <PageForm
          mode="edit"
          initialData={{
            id: page.id,
            title: page.title,
            titleAr: page.titleAr,
            titleDe: page.titleDe,
            slug: page.slug,
            content: page.content,
            contentAr: page.contentAr,
            contentDe: page.contentDe,
            isPublished: page.isPublished,
          }}
        />
      </div>
    </div>
  );
}
