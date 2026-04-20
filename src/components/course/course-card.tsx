import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { BookOpen, Users, Clock } from "lucide-react";
import { CategoryIllustration } from "./category-illustration";

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
  };
}

const categoryGradients: Record<string, string> = {
  math: "from-amber-400 to-orange-500",
  coding: "from-emerald-400 to-green-600",
  science: "from-cyan-400 to-blue-500",
  robotics: "from-violet-400 to-purple-600",
  engineering: "from-orange-400 to-red-500",
  ai: "from-blue-400 to-indigo-600",
  electronics: "from-teal-400 to-cyan-600",
  biology: "from-lime-400 to-emerald-600",
  chemistry: "from-pink-400 to-rose-600",
  physics: "from-slate-400 to-indigo-500",
  mathematics: "from-amber-400 to-orange-500",
  technology: "from-blue-400 to-indigo-600",
  stem: "from-violet-400 to-purple-600",
  arts: "from-pink-400 to-rose-500",
  language: "from-teal-400 to-green-500",
  // real DB categories
  digital_literacy: "from-sky-400 to-cyan-600",
  data_science: "from-purple-500 to-violet-700",
  cybersecurity: "from-slate-600 to-gray-900",
  design: "from-fuchsia-400 to-pink-600",
  entrepreneurship: "from-yellow-400 to-amber-500",
  career: "from-blue-500 to-indigo-700",
};


const ageGroupLabels: Record<string, string> = {
  AGES_3_5: "Ages 3-5",
  AGES_6_8: "Ages 6-8",
  AGES_9_12: "Ages 9-12",
  AGES_13_15: "Ages 13-15",
  AGES_16_18: "Ages 16-18",
};

const ageGroupColors: Record<string, string> = {
  AGES_3_5: "bg-pink-100 text-pink-700 border-pink-200",
  AGES_6_8: "bg-blue-100 text-blue-700 border-blue-200",
  AGES_9_12: "bg-emerald-100 text-emerald-700 border-emerald-200",
  AGES_13_15: "bg-purple-100 text-purple-700 border-purple-200",
  AGES_16_18: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const levelColors: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700 border-green-200",
  INTERMEDIATE: "bg-amber-100 text-amber-700 border-amber-200",
  ADVANCED: "bg-red-100 text-red-700 border-red-200",
};

export function CourseCard({ course }: CourseCardProps) {
  const categoryKey = course.category.toLowerCase();
  const gradient = categoryGradients[categoryKey] ?? "from-gray-400 to-gray-600";
  const ageColor = ageGroupColors[course.ageGroup] ?? "bg-gray-100 text-gray-700";
  const lvlColor = levelColors[course.level] ?? "bg-gray-100 text-gray-700";

  const priceNum = course.price ? Number(course.price) : 0;
  const isFree = course.isFree || priceNum === 0;
  const priceLabel = isFree
    ? "Free"
    : `${course.currency ?? "USD"} ${priceNum.toFixed(2)}`;

  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="card-stem group h-full overflow-hidden hover-lift">
        {/* Thumbnail or gradient header */}
        <div className="relative h-44 overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
