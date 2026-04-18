import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import ProductForm from "../product-form";

export const metadata = { title: "New Product | Admin | Schulab" };

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  return <ProductForm mode="create" />;
}
