import { Suspense } from "react";
import { getCourses } from "@/services/course.service";
import { CourseGrid } from "@/components/course/course-grid";
import { CourseFilters } from "@/components/course/course-filters";

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
  const courses = await getCourses({
    search: params.q,
    ageGroup: params.ageGroup,
    category: params.category,
    level: params.level,
  });

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
          <p className="mt-2 text-muted-foreground">
            Explore {courses.length > 0 ? `${courses.length} ` : ""}STEM courses tailored for young learners.
          </p>
        </div>

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
