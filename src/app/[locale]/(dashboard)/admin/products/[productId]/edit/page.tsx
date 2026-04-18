import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import ProductForm from "../../product-form";

export const metadata = { title: "Edit Product | Admin | Schulab" };

export default async function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  const { productId } = await params;
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) notFound();

  return (
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
  );
}
