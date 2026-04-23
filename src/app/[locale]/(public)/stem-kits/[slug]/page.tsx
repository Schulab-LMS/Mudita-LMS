import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/services/product.service";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CategoryIcon } from "@/components/illustrations/category-icons";
import {
  ShoppingCart,
  Truck,
  Shield,
  Package,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Star,
} from "lucide-react";

interface StemKitDetailPageProps {
  params: Promise<{ slug: string }>;
}

const AGE_GROUP_LABELS: Record<string, string> = {
  AGES_3_5: "Ages 3–5",
  AGES_6_8: "Ages 6–8",
  AGES_9_12: "Ages 9–12",
  AGES_13_15: "Ages 13–15",
  AGES_16_18: "Ages 16–18",
};

export default async function StemKitDetailPage({
  params,
}: StemKitDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const outOfStock = product.stock <= 0;
  const isLow = product.stock > 0 && product.stock <= 10;
  const fmtPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency || "USD",
  }).format(Number(product.price));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        className="mb-5"
        items={[
          { label: "STEM Kits", href: "/stem-kits" },
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Product hero */}
        <div className="space-y-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-launch-gradient-soft shadow-lg">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="rounded-3xl bg-white/70 p-8 shadow-soft ring-1 ring-border backdrop-blur">
                  <CategoryIcon
                    category={product.category}
                    size={128}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail rail for additional images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-lg border border-border"
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 2}`}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info column */}
        <div className="space-y-5">
          {/* Chips row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip chip-primary">
              {AGE_GROUP_LABELS[product.ageGroup] ?? product.ageGroup}
            </span>
            <span className="chip chip-secondary">{product.category}</span>
            {isLow && (
              <span className="chip chip-accent">
                <AlertTriangle className="h-3 w-3" aria-hidden />
                Only {product.stock} left
              </span>
            )}
            {outOfStock && (
              <span className="chip chip-neutral">Sold out</span>
            )}
          </div>

          {/* Title + rating */}
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>
            {/* Placeholder rating — replaces when review data lands */}
            <div className="mt-2 flex items-center gap-1.5 text-sm">
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
                ))}
              </div>
              <span className="font-semibold text-foreground">4.8</span>
              <span className="text-muted-foreground">
                (based on early feedback)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <p className="font-display text-4xl font-bold text-foreground">
              {fmtPrice}
            </p>
            <p className="text-xs text-muted-foreground">Free shipping over $50</p>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Stock + CTA */}
          <div className="space-y-3 border-t border-border pt-5">
            <div className="flex items-center gap-2 text-sm">
              {outOfStock ? (
                <>
                  <AlertTriangle
                    className="h-4 w-4 text-destructive"
                    aria-hidden
                  />
                  <span className="font-semibold text-destructive">
                    Out of stock — we&apos;ll notify you when it&apos;s back
                  </span>
                </>
              ) : isLow ? (
                <>
                  <AlertTriangle
                    className="h-4 w-4 text-amber-600"
                    aria-hidden
                  />
                  <span className="font-semibold text-amber-700 dark:text-amber-300">
                    Only {product.stock} units left
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-600"
                    aria-hidden
                  />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {product.stock} in stock · ships within 48 hours
                  </span>
                </>
              )}
            </div>
            <button
              disabled={outOfStock}
              className="shine inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-launch-gradient text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:grayscale"
            >
              {outOfStock ? (
                "Notify me"
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" aria-hidden />
                  Add to cart
                </>
              )}
            </button>
          </div>

          {/* Guarantees */}
          <ul className="space-y-2 rounded-xl bg-muted/40 p-4 text-sm">
            <GuaranteeRow
              icon={<Truck className="h-4 w-4" />}
              text="Free shipping on orders over $50"
            />
            <GuaranteeRow
              icon={<Shield className="h-4 w-4" />}
              text="Child-safe materials — EN-71 and CPSIA certified"
            />
            <GuaranteeRow
              icon={<Package className="h-4 w-4" />}
              text="30-day returns, no questions asked"
            />
          </ul>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-10">
        <Link
          href="/stem-kits"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
          Back to all kits
        </Link>
      </div>
    </div>
  );
}

function GuaranteeRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <li className="flex items-start gap-2 text-muted-foreground">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="text-sm text-foreground">{text}</span>
    </li>
  );
}
