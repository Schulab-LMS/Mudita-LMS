import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import ProductForm from "../../product-form";
import { PageHeader } from "@/components/ui/page-header";
import { Pencil } from "lucide-react";

export const metadata = { title: "Edit Product | Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  const { productId } = await params;
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit product"
        description={`Update details for "${product.name}".`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: product.name },
        ]}
        icon={<Pencil className="h-5 w-5" />}
      />
      <div className="card-premium p-6">
        <ProductForm
          mode="edit"
          initialData={{
            id: product.id,
            name: product.name,
            nameAr: product.nameAr,
            nameDe: product.nameDe,
            slug: product.slug,
            description: product.description,
            descriptionAr: product.descriptionAr,
            descriptionDe: product.descriptionDe,
            price: Number(product.price),
            ageGroup: product.ageGroup,
            category: product.category,
            stock: product.stock,
            status: product.status,
          }}
        />
      </div>
    </div>
  );
}
