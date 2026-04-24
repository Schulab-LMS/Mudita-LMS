import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { HelpArticleForm } from "../help-article-form";
import { PageHeader } from "@/components/ui/page-header";
import { HelpCircle } from "lucide-react";

export const metadata = { title: "New Help Article | Admin | Schulab" };

export default async function NewHelpArticlePage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="New help article"
        description="Create a new article for the Help Center."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Help Articles", href: "/admin/help" },
          { label: "New" },
        ]}
        icon={<HelpCircle className="h-5 w-5" />}
      />
      <div className="card-premium p-6">
        <HelpArticleForm mode="create" />
      </div>
    </div>
  );
}
