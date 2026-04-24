import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import ProductForm from "../product-form";
import { PageHeader } from "@/components/ui/page-header";
import { Package } from "lucide-react";

export const metadata = { title: "New Product | Admin | Schulab" };

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="New product"
        description="Add a new STEM kit to the catalog."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "New" },
        ]}
        icon={<Package className="h-5 w-5" />}
      />
      <div className="card-premium p-6">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
