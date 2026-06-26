import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import BundleForm from "@/components/admin/bundle-form";
import { PageHeader } from "@/components/ui/page-header";
import { Layers } from "lucide-react";

export const metadata = { title: "New Bundle | Admin" };

export default async function NewBundlePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="New bundle"
        description="Create a themed bundle, then add courses to it."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Bundles", href: "/admin/bundles" },
          { label: "New" },
        ]}
        icon={<Layers className="h-5 w-5" />}
      />
      <BundleForm mode="create" />
    </div>
  );
}
