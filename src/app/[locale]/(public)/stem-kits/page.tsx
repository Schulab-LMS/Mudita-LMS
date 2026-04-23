import type { Metadata } from "next";
import Image from "next/image";
import { getProducts } from "@/services/product.service";
import { Link } from "@/i18n/navigation";
import { CategoryIcon } from "@/components/illustrations/category-icons";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import {
  Package,
  ShoppingCart,
  Sparkles,
  Truck,
  Shield,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "STEM Kits | Schulab",
  description:
    "Browse hands-on STEM kits for children ages 3-18. Science, engineering, and technology kits delivered to your door.",
};

interface StemKitsPageProps {
  searchParams: Promise<{ ageGroup?: string }>;
}

const AGE_GROUP_LABELS: Record<string, string> = {
  AGES_3_5: "Ages 3–5",
  AGES_6_8: "Ages 6–8",
  AGES_9_12: "Ages 9–12",
  AGES_13_15: "Ages 13–15",
  AGES_16_18: "Ages 16–18",
};

export default async function StemKitsPage({ searchParams }: StemKitsPageProps) {
  const params = await searchParams;
  const ageGroup = params.ageGroup || undefined;

  const products = await getProducts({ ageGroup });
  const activeFilters = ageGroup ? 1 : 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-launch-gradient-soft py-14 sm:py-20">
        <div className="aurora-bg opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden />
            <span className="text-launch-gradient">Hands-on STEM at home</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            STEM Kits
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Hands-on science and engineering kits delivered to your door. Paired with online lessons so curiosity never stops at the book cover.
          </p>

          {/* Trust row */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-primary" />
              Free shipping on orders over $50
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-500" />
              Child-safe materials (EN-71 / CPSIA)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Package className="h-4 w-4 text-accent" />
              Pairs with online courses
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Filter bar */}
        <form
          method="get"
          className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft"
        >
          <select
            name="ageGroup"
            defaultValue={ageGroup ?? ""}
            aria-label="Age group"
            className="input-pretty h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
          >
            <option value="">All Ages</option>
            {Object.entries(AGE_GROUP_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>

          <select
            name="sort"
            defaultValue=""
            aria-label="Sort"
            className="input-pretty h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
          >
            <option value="">Sort: Featured</option>
            <option value="priceAsc">Price ↑</option>
            <option value="priceDesc">Price ↓</option>
            <option value="newest">Newest</option>
          </select>

          <label className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <input type="checkbox" name="inStock" className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring" />
            In stock only
          </label>

          <button
            type="submit"
            className="ms-auto inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Apply
          </button>
        </form>

        {/* Results summary */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{products.length}</span>{" "}
            {products.length === 1 ? "kit" : "kits"}
            {activeFilters > 0 && (
              <span>
                {" "}
                · {activeFilters} filter applied
              </span>
            )}
          </p>
          {activeFilters > 0 && (
            <Link
              href="/stem-kits"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear all
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <EmptyState
            illustration={<NoCoursesScene />}
            title="No kits available yet"
            description="New kits are being curated. Meanwhile, browse our online courses or subscribe for kit launch alerts."
            action={{ label: "Browse courses", href: "/courses" }}
            secondaryAction={{ label: "Contact us", href: "/contact" }}
            tone="first-use"
            size="lg"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const isLow = product.stock > 0 && product.stock <= 10;
              const isOut = product.stock <= 0;
              const fmtPrice = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: product.currency || "USD",
              }).format(Number(product.price));

              return (
                <Link
                  key={product.id}
                  href={`/stem-kits/${product.slug}`}
                  className="card-premium group relative flex flex-col overflow-hidden"
                >
                  {/* Image / icon hero */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-launch-gradient-soft">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="rounded-2xl bg-white/70 p-4 shadow-soft ring-1 ring-border backdrop-blur">
                          <CategoryIcon
                            category={product.category}
                            size={72}
                          />
                        </div>
                      </div>
                    )}

                    {/* Age chip (top start) */}
                    <span className="absolute top-3 start-3 inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm">
                      {AGE_GROUP_LABELS[product.ageGroup] ?? product.ageGroup}
                    </span>

                    {/* Stock urgency chip (top end) */}
                    {isOut ? (
                      <span className="absolute top-3 end-3 inline-flex items-center gap-1 rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                        Sold out
                      </span>
                    ) : isLow ? (
                      <span className="absolute top-3 end-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                        <AlertTriangle className="h-3 w-3" aria-hidden />
                        Only {product.stock} left
                      </span>
                    ) : null}
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                      {product.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>

                    {/* Footer row */}
                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-4">
                      <div>
                        <p className="font-display text-2xl font-bold leading-none text-foreground">
                          {fmtPrice}
                        </p>
                        {!isOut && (
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {product.stock.toLocaleString()} in stock
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold shadow-sm transition-transform group-hover:-translate-y-0.5 ${
                          isOut
                            ? "cursor-not-allowed bg-muted text-muted-foreground"
                            : "bg-launch-gradient text-white"
                        }`}
                      >
                        {isOut ? (
                          "Notify me"
                        ) : (
                          <>
                            <ShoppingCart className="h-3.5 w-3.5" aria-hidden />
                            View kit
                            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
