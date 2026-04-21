import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Pencil } from "lucide-react";
import { DeleteProductButton } from "./product-actions";

export async function generateMetadata() {
  const t = await getTranslations("admin.products");
  return { title: `${t("pageTitle")} | Schulab` };
}

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  OUT_OF_STOCK: "secondary",
  DISCONTINUED: "destructive",
};

const KNOWN_STATUSES = new Set(Object.keys(statusColors));

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  const [t, tCommon, tStatus, locale] = await Promise.all([
    getTranslations("admin.products"),
    getTranslations("admin.common"),
    getTranslations("admin.products.status"),
    getLocale(),
  ]);

  const priceFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  });

  let products: Awaited<ReturnType<typeof db.product.findMany>> = [];
  try {
    products = await db.product.findMany({ orderBy: { createdAt: "desc" } });
  } catch { /* no db */ }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("pageTitle")}</h1>
          <p className="text-muted-foreground">{t("productCount", { count: products.length })}</p>
        </div>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> {t("newProduct")}
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Package className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{t("emptyMessage")}</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t("nameCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("categoryCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("priceCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("stockCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("ageGroupCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("statusCol")}</th>
                <th className="px-4 py-3 text-end font-medium">{tCommon("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3">{priceFormatter.format(Number(p.price))}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.ageGroup.replace("AGES_", "").replace("_", "–")}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColors[p.status] ?? "secondary"}>
                      {KNOWN_STATUSES.has(p.status) ? tStatus(p.status) : p.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title={t("editProductTooltip")}
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
