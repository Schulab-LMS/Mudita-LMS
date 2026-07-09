import { getBundles } from "@/services/bundle.service";
import { Link } from "@/i18n/navigation";
import { BundleGrid } from "@/components/bundle/bundle-grid";
import { CatalogTabs } from "@/components/course/catalog-tabs";
import { AGE_GROUPS } from "@/lib/constants";
import { Layers, Search as SearchIcon } from "lucide-react";

interface BundlesPageProps {
  searchParams: Promise<{
    q?: string;
    ageGroup?: string;
    level?: string;
  }>;
}

export const metadata = {
  title: "Bundles",
  description: "Themed course bundles that guide learners from first steps to a final project.",
};

export default async function BundlesPage({ searchParams }: BundlesPageProps) {
  const params = await searchParams;

  const bundles = await getBundles({
    search: params.q,
    ageGroup: params.ageGroup,
    level: params.level,
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-launch-gradient-soft py-14 sm:py-20">
        <div className="aurora-bg opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
            <Layers className="h-4 w-4 text-accent" aria-hidden />
            <span className="text-launch-gradient">Learning bundles</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Themed Bundles
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Related courses grouped around one theme — each bundle ends with a hands-on final project.
          </p>

          <form action="/bundles" method="get" className="mt-6 flex max-w-2xl items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                name="q"
                type="search"
                defaultValue={params.q ?? ""}
                placeholder="Search bundles…"
                className="input-pretty h-12 w-full rounded-xl border border-border bg-card ps-10 pe-4 text-sm focus-visible:outline-none"
              />
            </div>
            <button
              type="submit"
              className="shine inline-flex h-12 items-center justify-center rounded-xl bg-launch-gradient px-5 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <CatalogTabs />
        </div>

        {/* Age band quick filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/bundles"
            className={`chip ${!params.ageGroup ? "chip-primary" : "chip-neutral"}`}
          >
            All ages
          </Link>
          {AGE_GROUPS.map((ag) => (
            <Link
              key={ag.value}
              href={{ pathname: "/bundles", query: { ageGroup: ag.value } }}
              className={`chip ${params.ageGroup === ag.value ? "chip-primary" : "chip-neutral"}`}
            >
              {ag.label}
            </Link>
          ))}
        </div>

        <div className="mb-5">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{bundles.length}</span>{" "}
            {bundles.length === 1 ? "bundle" : "bundles"}
          </p>
        </div>

        <BundleGrid bundles={bundles} />
      </div>
    </div>
  );
}
