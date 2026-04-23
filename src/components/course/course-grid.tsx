import { getTranslations } from "next-intl/server";
import { CourseCard } from "@/components/course/course-card";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";

interface CourseGridProps {
  courses: Array<{
    id: string;
    slug: string;
    title: string;
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
  }>;
}

export async function CourseGrid({ courses }: CourseGridProps) {
  if (courses.length === 0) {
    const t = await getTranslations("courses.empty");
    return (
      <EmptyState
        illustration={<NoCoursesScene />}
        title={t("title")}
        description={t("body")}
        action={{ label: t("reset"), href: "/courses" }}
        tone="first-use"
        size="lg"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
