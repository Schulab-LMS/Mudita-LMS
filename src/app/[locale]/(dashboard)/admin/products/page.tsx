import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import { CategoryIcon } from "@/components/illustrations/category-icons";
import { Plus, Pencil, Search, AlertTriangle } from "lucide-react";
import { DeleteProductButton } from "./product-actions";

export const metadata = { title: "Products | Admin | Schulab" };

const AGE_SHORT: Record<string, string> = {
  AGES_3_5: "3–5",
  AGES_6_8: "6–8",
  AGES_9_12: "9–12",
  AGES_13_15: "13–15",
  AGES_16_18: "16–18",
};

const STATUS_TONE: Record<string, string> = {
  ACTIVE: "chip chip-success",
  OUT_OF_STOCK: "chip chip-accent",
  DISCONTINUED: "chip chip-neutral",
};

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  let products: Awaited<ReturnType<typeof db.product.findMany>> = [];
  try {
    products = await db.product.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    /* no db */
  }

  // Aggregates
  const active = products.filter((p) => p.status === "ACTIVE").length;
  const outOfStock = products.filter(
    (p) => p.status === "OUT_OF_STOCK" || p.stock === 0
  ).length;
  const lowStock = products.filter(
    (p) => p.stock > 0 && p.stock <= 10
  ).length;
  const totalValue = products.reduce(
    (s, p) => s + Number(p.price) * p.stock,
    0
  );
  const currency = products[0]?.currency || "USD";
  const fmtMoney = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(totalValue);

  return (
    <div className="space-y-6">
      <PageHeader
        title="STEM Kit Products"
        description={`${products.length} product${
          products.length === 1 ? "" : "s"
        } in catalog`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products" },
        ]}
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-launch-gradient px-3 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            New Product
          </Link>
        }
      />

      {/* Mini stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Active" value={active} tone="success" />
        <MiniStat label="Low stock" value={lowStock} tone="accent" />
        <MiniStat label="Out of stock" value={outOfStock} tone="neutral" />
        <MiniStat label="Inventory value" value={fmtMoney} tone="primary" />
      </div>

      {/* Search / filter */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search by product name or category…"
            className="input-pretty h-10 w-full rounded-lg border border-input bg-background ps-9 pe-3 text-sm focus-visible:outline-none"
          />
        </div>
        <select
          aria-label="Filter by status"
          className="input-pretty h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
          <option value="DISCONTINUED">Discontinued</option>
        </select>
        <select
          aria-label="Filter by age group"
          className="input-pretty h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
        >
          <option value="">All ages</option>
          {Object.entries(AGE_SHORT).map(([k, v]) => (
            <option key={k} value={k}>
              Ages {v}
            </option>
          ))}
        </select>
      </div>

      {products.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title="No products yet"
          description="Publish your first STEM kit so students can order it from the catalog."
          action={{ label: "New Product", href: "/admin/products/new" }}
          tone="first-use"
          size="lg"
        />
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Product
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Category
                  </th>
                  <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Price
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Stock
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Age
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= 10;
                  const isOut = p.stock <= 0;
                  return (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-launch-gradient-soft ring-1 ring-border">
                            {p.images?.[0] ? (
                              <Image
                                src={p.images[0]}
                                alt={p.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <CategoryIcon category={p.category} size={28} />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {p.name}
                            </p>
                            <p className="truncate font-mono text-[11px] text-muted-foreground">
                              /{p.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {p.category}
                      </td>
                      <td className="px-5 py-3 text-end font-semibold text-foreground">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: p.currency || "USD",
                        }).format(Number(p.price))}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                            isOut
                              ? "bg-red-500/15 text-red-700 dark:text-red-300"
                              : isLow
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                : "bg-muted text-foreground"
                          }`}
                        >
                          {isLow && (
                            <AlertTriangle
                              className="h-3 w-3"
                              aria-hidden
                            />
                          )}
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {AGE_SHORT[p.ageGroup] ?? p.ageGroup}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={STATUS_TONE[p.status] ?? "chip chip-neutral"}
                        >
                          {p.status.replace("_", " ").toLowerCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            title="Edit product"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <DeleteProductButton productId={p.id} name={p.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
            <span>
              Showing <span className="font-semibold text-foreground">{products.length}</span> of{" "}
              <span className="font-semibold text-foreground">{products.length}</span> products
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "primary" | "success" | "accent" | "neutral";
}) {
  const toneBg: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    neutral: "bg-muted text-muted-foreground",
  };
  return (
    <div className="card-premium p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-2xl font-bold text-foreground">
          {value}
        </span>
      </p>
      <span
        className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${toneBg[tone]}`}
      >
        {tone === "success"
          ? "healthy"
          : tone === "accent"
            ? "attention"
            : tone === "neutral"
              ? "review"
              : "total"}
      </span>
    </div>
  );
}
