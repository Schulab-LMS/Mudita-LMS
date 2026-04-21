import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { CourseActions } from "./course-actions";

export async function generateMetadata() {
  const t = await getTranslations("admin.courses");
  return { title: t("pageTitle") };
}

const ageGroupShort: Record<string, string> = {
  AGES_3_5: "3–5",
  AGES_6_8: "6–8",
  AGES_9_12: "9–12",
  AGES_13_15: "13–15",
  AGES_16_18: "16–18",
};

function formatPrice(locale: string, price: number, currency: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

export default async function AdminCoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const [t, tCommon, tLevels, locale, courses] = await Promise.all([
    getTranslations("admin.courses"),
    getTranslations("admin.common"),
    getTranslations("courses.levels"),
    getLocale(),
    db.course
      .findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          ageGroup: true,
          level: true,
          isFree: true,
          price: true,
          currency: true,
          category: true,
          _count: { select: { enrollments: true, modules: true } },
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      })
      .catch(() => []),
  ]);

  const statusColors: Record<string, string> = {
    PUBLISHED: "bg-green-100 text-green-800",
    DRAFT: "bg-yellow-100 text-yellow-800",
    ARCHIVED: "bg-gray-100 text-gray-600",
  };

  const statusLabel: Record<string, string> = {
    PUBLISHED: tCommon("published"),
    DRAFT: tCommon("draft"),
    ARCHIVED: tCommon("archived"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("totalCount", { count: courses.length })}
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          + {t("newCourse")}
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("titleCol")}</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{tCommon("status")}</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("ageCol")}</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("levelCol")}</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("categoryCol")}</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("priceCol")}</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("modulesCol")}</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("enrollmentsCol")}</th>
              <th className="px-4 py-3 text-end font-medium text-muted-foreground">{tCommon("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  {t("noCoursesFound")}
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/courses/${course.id}`} className="group">
                      <div className="font-medium text-primary group-hover:underline">{course.title}</div>
                      <div className="text-xs text-muted-foreground">/{course.slug}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[course.status] ?? "bg-gray-100"}`}>
                      {statusLabel[course.status] ?? course.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {ageGroupShort[course.ageGroup] ?? course.ageGroup}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs">{tLevels(course.level)}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{course.category}</td>
                  <td className="px-4 py-3">
                    {course.isFree ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {tCommon("free")}
                      </span>
                    ) : (
                      <span className="font-medium">
                        {formatPrice(locale, Number(course.price), course.currency)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{course._count.modules}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{course._count.enrollments}</td>
                  <td className="px-4 py-3">
                    <CourseActions courseId={course.id} status={course.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
