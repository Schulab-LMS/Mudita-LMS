import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Pencil } from "lucide-react";
import { DeleteProductButton } from "./product-actions";

export const metadata = { title: "Products | Admin | Schulab" };

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  OUT_OF_STOCK: "secondary",
  DISCONTINUED: "destructive",
};

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  let products: Awaited<ReturnType<typeof db.product.findMany>> = [];
  try {
    products = await db.product.findMany({ orderBy: { createdAt: "desc" } });
  } catch { /* no db */ }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">STEM Kit Products</h1>
          <p className="text-muted-foreground">{products.length} products</p>
        </div>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Package className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No products yet</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Stock</th>
                <th className="px-4 py-3 text-left font-medium">Age Group</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3">${String(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.ageGroup.replace("AGES_", "").replace("_", "–")}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColors[p.status] ?? "secondary"}>{p.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Edit product"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteProductButton productId={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
