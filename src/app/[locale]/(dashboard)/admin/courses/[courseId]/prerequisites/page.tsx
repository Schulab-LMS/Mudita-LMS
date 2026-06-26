import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { CoursePrerequisiteManager } from "@/components/admin/course-prerequisite-manager";
import { GitBranch } from "lucide-react";

export const metadata = { title: "Course Prerequisites | Admin" };

interface PrerequisitesPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePrerequisitesPage({ params }: PrerequisitesPageProps) {
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
        prerequisites: {
          select: {
            id: true,
            prerequisiteId: true,
            prerequisite: { select: { title: true } },
          },
        },
      },
    })
    .catch(() => null);

  if (!course) notFound();

  // Candidates: every other course not already a prerequisite (the self-ref
  // CHECK + cycle guard in the action backstop bad picks).
  const usedIds = new Set([course.id, ...course.prerequisites.map((p) => p.prerequisiteId)]);
  const availableCourses = await db.course
    .findMany({
      where: { id: { notIn: [...usedIds] } },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Prerequisites"
        description={`Courses a learner must complete before enrolling in "${course.title}".`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Courses", href: "/admin/courses" },
          { label: course.title, href: `/admin/courses/${course.id}` },
          { label: "Prerequisites" },
        ]}
        icon={<GitBranch className="h-5 w-5" />}
      />
      <CoursePrerequisiteManager
        courseId={course.id}
        prerequisites={course.prerequisites.map((p) => ({
          id: p.id,
          prerequisiteId: p.prerequisiteId,
          title: p.prerequisite.title,
        }))}
        availableCourses={availableCourses}
      />
    </div>
  );
}
