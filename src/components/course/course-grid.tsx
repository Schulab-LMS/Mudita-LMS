import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CourseCard } from "@/components/course/course-card";

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
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <div className="mb-4 text-5xl">📚</div>
        <h3 className="mb-2 text-lg font-semibold text-muted-foreground">
          {t("title")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("body")}</p>
        <Link
          href="/courses"
          className="mt-5 inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          {t("reset")}
        </Link>
      </div>
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
