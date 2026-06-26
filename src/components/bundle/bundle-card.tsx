import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Layers, BookOpen } from "lucide-react";
import { CategoryIllustration } from "@/components/course/category-illustration";
import {
  categoryGradients,
  ageGroupLabels,
  ageGroupColors,
  levelLabels,
  levelColors,
} from "@/components/course/catalog-labels";

interface BundleCardProps {
  bundle: {
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
  };
}

export function BundleCard({ bundle }: BundleCardProps) {
  const categoryKey = bundle.themeCategory.toLowerCase();
  const gradient = categoryGradients[categoryKey] ?? "from-gray-400 to-gray-600";
  const ageColor = ageGroupColors[bundle.ageGroup] ?? "bg-gray-100 text-gray-700";
  const lvlColor = levelColors[bundle.level] ?? "bg-gray-100 text-gray-700";

  return (
    <Link href={`/bundles/${bundle.slug}`}>
      <Card className="card-stem group h-full overflow-hidden hover-lift">
        <div className="relative h-44 overflow-hidden">
          {bundle.thumbnail ? (
            <Image
              src={bundle.thumbnail}
              alt={bundle.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <CategoryIllustration category={bundle.themeCategory} gradient={gradient} />
          )}

          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
              <Layers className="h-3.5 w-3.5" />
              Bundle
            </span>
          </div>
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
              {bundle.themeCategory}
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
            {bundle.title}
          </h3>
          {bundle.description && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
              {bundle.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ageColor}`}>
              {ageGroupLabels[bundle.ageGroup] ?? bundle.ageGroup}
            </span>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${lvlColor}`}>
              {levelLabels[bundle.level] ?? bundle.level}
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex items-center gap-4 border-t border-border/50 px-5 py-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {bundle.courseCount} {bundle.courseCount === 1 ? "course" : "courses"}
          </span>
          {bundle.recommendedDurationWeeks != null && (
            <span>{bundle.recommendedDurationWeeks} wks</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
