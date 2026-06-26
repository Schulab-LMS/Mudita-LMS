import { getPathways } from "@/services/pathway.service";
import { getLocalizedField } from "@/services/course.service";
import { PathwayCard } from "@/components/pathway/pathway-card";
import { CatalogTabs } from "@/components/course/catalog-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import { Map as MapIcon } from "lucide-react";

interface PathwaysPageProps {
  params: Promise<{ locale: string }>;
}

export const metadata = {
  title: "Learning Pathways | Schulab",
  description: "Step-by-step, age-based journeys that take learners from first steps to advanced skills.",
};

export default async function PathwaysPage({ params }: PathwaysPageProps) {
  const { locale } = await params;
  const pathways = await getPathways();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-launch-gradient-soft py-14 sm:py-20">
        <div className="aurora-bg opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-1.5 text-sm font-semibold shadow-sm backdrop-blur">
            <MapIcon className="h-4 w-4 text-accent" aria-hidden />
            <span className="text-launch-gradient">Learning pathways</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Age-Based Pathways
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            A guided journey for every age — follow the roadmap from first steps to advanced skills, one stage at a time.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <CatalogTabs />
        </div>

        {pathways.length === 0 ? (
          <EmptyState
            illustration={<NoCoursesScene />}
            title="No pathways yet"
            description="Age-based learning pathways are on their way. Explore bundles and courses in the meantime."
            action={{ label: "Browse bundles", href: "/bundles" }}
            tone="first-use"
            size="lg"
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pathways.map((pathway) => (
              <PathwayCard
                key={pathway.id}
                pathway={{
                  ...pathway,
                  title: getLocalizedField(pathway, "title", locale),
                  description: getLocalizedField(pathway, "description", locale),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
