import type { Metadata } from "next";
import Image from "next/image";
import { getProducts } from "@/services/product.service";
import { Link } from "@/i18n/navigation";

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">STEM Kits</h1>
        <p className="mt-1 text-muted-foreground">
          Hands-on science and engineering kits for curious minds.
        </p>
      </div>

      {/* Filters */}
      <form method="get" className="flex flex-wrap gap-3">
        <select
          name="ageGroup"
          defaultValue={ageGroup ?? ""}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All Ages</option>
          {Object.entries(AGE_GROUP_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Filter
        </button>
        {ageGroup && (
          <Link
            href="/stem-kits"
            className="inline-flex h-10 items-center rounded-lg border border-input px-4 text-sm transition-colors hover:bg-muted"
          >
            Clear
          </Link>
        )}
      </form>

      {products.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-5xl">🔬</p>
          <p className="mt-3 text-lg font-medium">No kits available</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back soon for new STEM kits!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <a
              key={product.id}
              href={`/stem-kits/${product.slug}`}
              className="group flex flex-col rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-md"
            >
              <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 text-5xl">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  "🔬"
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 whitespace-nowrap">
                    {AGE_GROUP_LABELS[product.ageGroup] ?? product.ageGroup}
                  </span>
                </div>
                <p className="flex-1 text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-lg font-bold">
                    ${Number(product.price).toFixed(2)}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
