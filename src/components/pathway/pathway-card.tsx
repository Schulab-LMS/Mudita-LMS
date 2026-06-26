import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Map, Milestone } from "lucide-react";
import { CategoryIllustration } from "@/components/course/category-illustration";
import { ageGroupLabels, ageGroupColors } from "@/components/course/catalog-labels";

interface PathwayCardProps {
  pathway: {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    thumbnail: string | null;
    ageGroup: string;
    stageCount: number;
  };
}

export function PathwayCard({ pathway }: PathwayCardProps) {
  const ageColor = ageGroupColors[pathway.ageGroup] ?? "bg-gray-100 text-gray-700";

  return (
    <Link href={`/pathways/${pathway.slug}`}>
      <Card className="card-stem group h-full overflow-hidden hover-lift">
        <div className="relative h-44 overflow-hidden">
          {pathway.thumbnail ? (
            <Image
              src={pathway.thumbnail}
              alt={pathway.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <CategoryIllustration category="stem" gradient="from-indigo-400 to-purple-600" />
          )}

          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
              <Map className="h-3.5 w-3.5" />
              Pathway
            </span>
          </div>
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold shadow-sm ${ageColor}`}>
              {ageGroupLabels[pathway.ageGroup] ?? pathway.ageGroup}
            </span>
          </div>

          <div className="absolute -bottom-1 left-0 right-0">
            <svg viewBox="0 0 400 20" className="w-full" preserveAspectRatio="none">
              <path d="M0 20 Q200 0 400 20 L400 20 L0 20Z" fill="white" />
            </svg>
          </div>
        </div>

        <CardContent className="p-5">
          <h3 className="mb-2 line-clamp-2 font-display text-lg font-bold text-card-foreground transition-colors group-hover:text-primary">
            {pathway.title}
          </h3>
          {pathway.description && (
            <p className="line-clamp-3 text-sm text-muted-foreground leading-relaxed">
              {pathway.description}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex items-center gap-4 border-t border-border/50 px-5 py-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Milestone className="h-4 w-4" />
            {pathway.stageCount} {pathway.stageCount === 1 ? "stage" : "stages"}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
