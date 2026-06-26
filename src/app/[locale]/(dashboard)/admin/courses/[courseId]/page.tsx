import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { ModuleList } from "./module-list";
import { EnrollmentList } from "./enrollment-list";
import { PreviewCourseButton } from "@/components/admin/preview-course-button";
import { PageHeader } from "@/components/ui/page-header";
import { CategoryIcon } from "@/components/illustrations/category-icons";
import {
  Pencil,
  Users,
  GraduationCap,
  BookOpen,
  Tag,
  DollarSign,
  ExternalLink,
  GitBranch,
} from "lucide-react";

export const metadata = { title: "Course Content | Admin" };

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const { courseId } = await params;

  const course = await db.course
    .findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        ageGroup: true,
        level: true,
        category: true,
        isFree: true,
        price: true,
        currency: true,
        managedByGit: true,
        sourcePath: true,
        _count: { select: { enrollments: true } },
        enrollments: {
          orderBy: { enrolledAt: "desc" as const },
          select: {
            id: true,
            userId: true,
            status: true,
            progress: true,
            enrolledAt: true,
            user: { select: { name: true, email: true } },
          },
        },
        modules: {
          // Show only live content. Git-removed modules/lessons are
          // soft-archived (syncStatus REMOVED), not deleted; a layout/path
          // refactor in the repo can leave a stale REMOVED copy alongside the
          // live one, which would otherwise render here as a duplicate. Mirrors
          // getCourseBySlug and session.service. Sync status is surfaced
          // separately on the Curriculum (Git) admin page.
          where: { syncStatus: "ACTIVE" },
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
            lessons: {
              where: { syncStatus: "ACTIVE" },
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                type: true,
                order: true,
                isFree: true,
                duration: true,
                videoUrl: true,
                quiz: { select: { id: true } },
              },
            },
          },
        },
      },
    })
    .catch(() => null);

  if (!course) notFound();

  // First lesson for the "Preview as student" deep-link (null when the course
  // has no lessons yet).
  const firstLessonId =
    course.modules.find((m) => m.lessons.length > 0)?.lessons[0]?.id ?? null;

  const totalLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );
  const totalDuration = course.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.duration ?? 0), 0),
    0
  );
  const totalMinutes = Math.round(totalDuration / 60);

  const statusChip: Record<string, string> = {
    PUBLISHED: "chip chip-success",
    DRAFT: "chip chip-accent",
    ARCHIVED: "chip chip-neutral",
  };

  const ageLabel = course.ageGroup.replace("AGES_", "").replace("_", "–");
  const levelLabel =
    course.level.charAt(0) + course.level.slice(1).toLowerCase();
  const priceLabel = course.isFree
    ? "Free"
    : `${course.currency || "USD"} ${Number(course.price).toFixed(2)}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={course.title}
        description={`${course.modules.length} module${
          course.modules.length === 1 ? "" : "s"
        } · ${totalLessons} lesson${totalLessons === 1 ? "" : "s"} · ${
          course._count.enrollments
        } enrollment${course._count.enrollments === 1 ? "" : "s"}${
          totalMinutes > 0 ? ` · ${totalMinutes} min total` : ""
        }`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Courses", href: "/admin/courses" },
          { label: course.title },
        ]}
        icon={<CategoryIcon category={course.category} size={32} />}
        actions={
          <>
            <span className={statusChip[course.status] ?? "chip chip-neutral"}>
              {course.status.charAt(0) +
                course.status.slice(1).toLowerCase()}
            </span>
            {firstLessonId && (
              <PreviewCourseButton
                courseSlug={course.slug}
                firstLessonId={firstLessonId}
              />
            )}
            {course.status === "PUBLISHED" && (
              <Link
                href={`/courses/${course.slug}`}
                target="_blank"
                className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                View live
              </Link>
            )}
            <Link
              href={`/admin/courses/${course.id}/prerequisites`}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-input px-3 text-xs font-semibold transition-colors hover:bg-muted"
            >
              <GitBranch className="h-3.5 w-3.5" aria-hidden />
              Prerequisites
            </Link>
            <Link
              href={`/admin/courses/${course.id}/edit`}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Edit course
            </Link>
          </>
        }
      />

      {course.managedByGit && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <GitBranch className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">Content managed in Git.</p>
            <p className="mt-1">
              The lessons below are synced from the STEM-Curricula repository
              {course.sourcePath ? (
                <>
                  {" "}
                  (<code className="font-mono">{course.sourcePath}</code>)
                </>
              ) : null}{" "}
              and are read-only here — edit the content in Git. Course settings
              (name, age group, level, category, status, pathways &amp; bundles)
              are platform-owned and stay editable here; the sync never
              overwrites them.{" "}
              <Link href="/admin/curriculum" className="font-semibold underline">
                Curriculum sync
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Course quick info — premium tiles with icons + tones */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoTile
          icon={<Users className="h-4 w-4" />}
          label="Age group"
          value={ageLabel}
          tone="primary"
        />
        <InfoTile
          icon={<GraduationCap className="h-4 w-4" />}
          label="Level"
          value={levelLabel}
          tone="secondary"
        />
        <InfoTile
          icon={<Tag className="h-4 w-4" />}
          label="Category"
          value={course.category}
          tone="accent"
        />
        <InfoTile
          icon={
            course.isFree ? (
              <BookOpen className="h-4 w-4" />
            ) : (
              <DollarSign className="h-4 w-4" />
            )
          }
          label="Price"
          value={priceLabel}
          tone={course.isFree ? "success" : "primary"}
        />
      </div>

      {/* Enrollments */}
      <EnrollmentList
        courseId={course.id}
        enrollments={course.enrollments}
      />

      {/* Module + lesson management */}
      <ModuleList courseId={course.id} modules={course.modules} />
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "secondary" | "accent" | "success";
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };
  return (
    <div className="card-premium p-4">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="truncate font-display text-sm font-bold leading-tight text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
