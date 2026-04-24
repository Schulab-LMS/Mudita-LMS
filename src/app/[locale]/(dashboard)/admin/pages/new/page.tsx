import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { PageForm } from "../page-form";
import { PageHeader } from "@/components/ui/page-header";
import { FileText } from "lucide-react";

export const metadata = { title: "New Page | Admin | Schulab" };

export default async function NewPagePage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Create new page"
        description="Author a new CMS page that will render at /pages/[slug] once published."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Pages", href: "/admin/pages" },
          { label: "New" },
        ]}
        icon={<FileText className="h-5 w-5" />}
      />
      <div className="card-premium p-6">
        <PageForm mode="create" />
      </div>
    </div>
  );
}
