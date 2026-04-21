import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getCourses } from "@/services/course.service";
import { CourseGrid } from "@/components/course/course-grid";
import { CourseFilters } from "@/components/course/course-filters";
import { Sparkles } from "lucide-react";

interface CoursesPageProps {
  searchParams: Promise<{
    q?: string;
    ageGroup?: string;
    category?: string;
    level?: string;
  }>;
}

export const metadata = {
  title: "Courses | Schulab",
  description: "Browse our STEM courses designed for children ages 3–18.",
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const [courses, t] = await Promise.all([
    getCourses({
      search: params.q,
      ageGroup: params.ageGroup,
      category: params.category,
      level: params.level,
    }),
    getTranslations("courses"),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -end-20 h-56 w-56 rounded-full bg-[#4f3ff0] opacity-[0.05] blur-3xl" />
          <div className="absolute -bottom-20 -start-20 h-56 w-56 rounded-full bg-[#ff8a3d] opacity-[0.05] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-1.5 text-sm font-semibold shadow-sm">
            <Sparkles className="h-4 w-4 text-[var(--stem-rocket)]" />
            <span className="text-launch-gradient">{t("exploreCatalog")}</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {t("catalogHint", { count: courses.length })}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Suspense>
            <CourseFilters />
          </Suspense>
        </div>

        <CourseGrid courses={courses} />
      </div>
    </div>
  );
}
