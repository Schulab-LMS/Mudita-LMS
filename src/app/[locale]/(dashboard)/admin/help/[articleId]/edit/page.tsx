import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { getArticleById } from "@/services/help.service";
import { HelpArticleForm } from "../../help-article-form";
import { PageHeader } from "@/components/ui/page-header";
import { Pencil } from "lucide-react";

interface PageProps {
  params: Promise<{ articleId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { articleId } = await params;
  const article = await getArticleById(articleId);
  return {
    title: article
      ? `Edit: ${article.title} | Admin | Schulab`
      : "Edit Article",
  };
}

export default async function EditHelpArticlePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  const { articleId } = await params;
  const article = await getArticleById(articleId);
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Edit help article"
        description={`Update content for "${article.title}".`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Help Articles", href: "/admin/help" },
          { label: article.title },
        ]}
        icon={<Pencil className="h-5 w-5" />}
      />
      <div className="card-premium p-6">
        <HelpArticleForm
          mode="edit"
          initialData={{
            id: article.id,
            title: article.title,
            titleAr: article.titleAr,
            titleDe: article.titleDe,
            category: article.category,
            excerpt: article.excerpt,
            excerptAr: article.excerptAr,
            excerptDe: article.excerptDe,
            content: article.content,
            contentAr: article.contentAr,
            contentDe: article.contentDe,
            tags: article.tags,
            order: article.order,
            isPublished: article.isPublished,
            isFeatured: article.isFeatured,
          }}
        />
      </div>
    </div>
  );
}
