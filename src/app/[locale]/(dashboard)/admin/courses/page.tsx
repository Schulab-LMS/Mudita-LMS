import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { CourseActions } from "./course-actions";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import { CategoryIcon } from "@/components/illustrations/category-icons";
import { Plus, Search, BookOpen } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("admin.courses");
  return { title: t("pageTitle") };
}

const ageGroupShort: Record<string, string> = {
  AGES_3_5: "3–5",
  AGES_5_7: "5–7",
  AGES_8_10: "8–10",
  AGES_11_13: "11–13",
  AGES_14_16: "14–16",
  AGES_17_18: "17–18",
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

  const statusChipTone: Record<string, string> = {
    PUBLISHED: "chip chip-success",
    DRAFT: "chip chip-accent",
    ARCHIVED: "chip chip-neutral",
  };

  const statusLabel: Record<string, string> = {
    PUBLISHED: tCommon("published"),
    DRAFT: tCommon("draft"),
    ARCHIVED: tCommon("archived"),
  };

  // Tab counts
  const counts = {
    all: courses.length,
    published: courses.filter((c) => c.status === "PUBLISHED").length,
    draft: courses.filter((c) => c.status === "DRAFT").length,
    archived: courses.filter((c) => c.status === "ARCHIVED").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("totalCount", { count: courses.length })}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Courses" }]}
        actions={
          <Link
            href="/admin/courses/new"
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-launch-gradient px-3 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            {t("newCourse")}
          </Link>
        }
      />

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        <StatusTab label={`All · ${counts.all}`} active />
        <StatusTab label={`Published · ${counts.published}`} />
        <StatusTab label={`Drafts · ${counts.draft}`} />
        <StatusTab label={`Archived · ${counts.archived}`} />
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search courses by title or slug…"
            className="input-pretty h-10 w-full rounded-lg border border-input bg-background ps-9 pe-3 text-sm focus-visible:outline-none"
          />
        </div>
        <select
          aria-label="Filter by age group"
          className="input-pretty h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
        >
          <option value="">All ages</option>
          {Object.entries(ageGroupShort).map(([val, label]) => (
            <option key={val} value={val}>
              Ages {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by level"
          className="input-pretty h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
        >
          <option value="">All levels</option>
          <option value="BEGINNER">{tLevels("BEGINNER")}</option>
          <option value="INTERMEDIATE">{tLevels("INTERMEDIATE")}</option>
          <option value="ADVANCED">{tLevels("ADVANCED")}</option>
        </select>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title={t("noCoursesFound")}
          description="Publish your first course to start building the catalog."
          action={{ label: t("newCourse"), href: "/admin/courses/new" }}
          tone="first-use"
          size="lg"
        />
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("titleCol")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {tCommon("status")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("ageCol")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("levelCol")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("categoryCol")}
                  </th>
                  <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("priceCol")}
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("modulesCol")}
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("enrollmentsCol")}
                  </th>
                  <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {tCommon("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {courses.map((course) => (
                  <tr
                    key={course.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-launch-gradient-soft">
                          <CategoryIcon
                            category={course.category}
                            size={28}
                          />
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/courses/${course.id}`}
                            className="truncate font-medium text-foreground hover:text-primary"
                          >
                            {course.title}
                          </Link>
                          <p className="truncate font-mono text-[11px] text-muted-foreground">
                            /{course.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          statusChipTone[course.status] ??
                          "chip chip-neutral"
                        }
                      >
                        {statusLabel[course.status] ?? course.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {ageGroupShort[course.ageGroup] ?? course.ageGroup}
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {tLevels(course.level)}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {course.category}
                    </td>
                    <td className="px-5 py-3 text-end">
                      {course.isFree ? (
                        <span className="chip chip-success">
                          {tCommon("free")}
                        </span>
                      ) : (
                        <span className="font-semibold text-foreground">
                          {formatPrice(
                            locale,
                            Number(course.price),
                            course.currency
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">
                        {course._count.modules}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">
                        {course._count.enrollments}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <CourseActions
                        courseId={course.id}
                        status={course.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
            <span>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {courses.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {courses.length}
              </span>{" "}
              courses
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              {counts.published} published
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusTab({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`relative -mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
