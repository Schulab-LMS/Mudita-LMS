import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { BookOpen, Users, Clock } from "lucide-react";
import { CategoryIllustration } from "./category-illustration";
import {
  categoryGradients,
  ageGroupLabels,
  ageGroupColors,
  levelLabels,
  levelColors,
} from "./catalog-labels";

interface CourseCardProps {
  course: {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    thumbnail: string | null;
    level: string;
    ageGroup: string;
    category: string;
    duration: number | null;
    lessonCount: number;
    enrollmentCount: number;
    isFree?: boolean;
    price?: unknown;
    currency?: string;
    requiredPlan?: string | null;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const categoryKey = course.category.toLowerCase();
  const gradient = categoryGradients[categoryKey] ?? "from-gray-400 to-gray-600";
  const ageColor = ageGroupColors[course.ageGroup] ?? "bg-gray-100 text-gray-700";
  const lvlColor = levelColors[course.level] ?? "bg-gray-100 text-gray-700";

  const priceNum = course.price ? Number(course.price) : 0;
  // A zero price alone no longer means free — subscription courses are priced
  // at 0 and gated by requiredPlan. Free iff flagged free, or no plan + no price.
  const isFree = course.isFree || (priceNum === 0 && !course.requiredPlan);
  // Paid courses are subscription-only — never surface a raw price on cards.
  const priceLabel = isFree ? "Free" : "Subscribers Only";

  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="card-stem group h-full overflow-hidden hover-lift">
        {/* Thumbnail or gradient header */}
        <div className="relative h-44 overflow-hidden">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <CategoryIllustration category={course.category} gradient={gradient} />
          )}

          {/* Overlay badges */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
              {course.category}
            </span>
          </div>
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${isFree ? "bg-green-500 text-white" : "bg-white/90 text-gray-900 backdrop-blur-sm"}`}>
              {priceLabel}
            </span>
          </div>

          {/* Bottom wave */}
          <div className="absolute -bottom-1 left-0 right-0">
            <svg viewBox="0 0 400 20" className="w-full" preserveAspectRatio="none">
              <path d="M0 20 Q200 0 400 20 L400 20 L0 20Z" fill="white" />
            </svg>
          </div>
        </div>

        <CardContent className="p-5">
          <h3 className="mb-2 line-clamp-2 font-display text-lg font-bold text-card-foreground transition-colors group-hover:text-primary">
            {course.title}
          </h3>
          {course.description && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ageColor}`}>
              {ageGroupLabels[course.ageGroup] ?? course.ageGroup}
            </span>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${lvlColor}`}>
              {levelLabels[course.level] ?? course.level}
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex items-center gap-4 border-t border-border/50 px-5 py-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {course.lessonCount} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {course.enrollmentCount}
          </span>
          {course.duration != null && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {course.duration}m
            </span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
