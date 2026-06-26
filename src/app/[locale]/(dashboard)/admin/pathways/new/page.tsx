import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import PathwayForm from "@/components/admin/pathway-form";
import { PageHeader } from "@/components/ui/page-header";
import { Map as MapIcon } from "lucide-react";

export const metadata = { title: "New Pathway | Admin" };

export default async function NewPathwayPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="New pathway"
        description="Create an age-based journey, then add bundle and course stages."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Pathways", href: "/admin/pathways" },
          { label: "New" },
        ]}
        icon={<MapIcon className="h-5 w-5" />}
      />
      <PathwayForm mode="create" />
    </div>
  );
}
