import { BundleCard } from "@/components/bundle/bundle-card";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";

interface BundleGridProps {
  bundles: Array<{
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    thumbnail: string | null;
    level: string;
    ageGroup: string;
    themeCategory: string;
    courseCount: number;
    recommendedDurationWeeks?: number | null;
  }>;
}

export function BundleGrid({ bundles }: BundleGridProps) {
  if (bundles.length === 0) {
    return (
      <EmptyState
        illustration={<NoCoursesScene />}
        title="No bundles yet"
        description="Themed learning bundles are on their way. Browse single courses in the meantime."
        action={{ label: "Browse courses", href: "/courses" }}
        tone="first-use"
        size="lg"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {bundles.map((bundle) => (
        <BundleCard key={bundle.id} bundle={bundle} />
      ))}
    </div>
  );
}
