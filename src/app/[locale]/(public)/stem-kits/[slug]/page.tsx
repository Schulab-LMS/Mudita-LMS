import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/services/product.service";
import { Link } from "@/i18n/navigation";

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

export default async function StemKitDetailPage({ params }: StemKitDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const outOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <Link
        href="/stem-kits"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to STEM Kits
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 text-7xl lg:h-80">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            "🔬"
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                {AGE_GROUP_LABELS[product.ageGroup] ?? product.ageGroup}
              </span>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                {product.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
          </div>

          <p className="text-2xl font-bold">${Number(product.price).toFixed(2)}</p>

          <p className="text-muted-foreground">{product.description}</p>

          <div className="rounded-lg bg-muted px-4 py-3 text-sm">
            {outOfStock ? (
              <span className="text-red-600 font-medium">Out of stock</span>
            ) : (
              <span className="text-green-700 font-medium">
                ✓ {product.stock} units available
              </span>
            )}
          </div>

          <button
            disabled={outOfStock}
            className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {outOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
