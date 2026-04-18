import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { getPageById } from "@/services/page.service";
import { PageForm } from "../../page-form";

export const metadata = { title: "Edit Page | Admin | Schulab" };

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
      <h1 className="font-display text-2xl font-bold">Edit Page</h1>
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
  );
}
