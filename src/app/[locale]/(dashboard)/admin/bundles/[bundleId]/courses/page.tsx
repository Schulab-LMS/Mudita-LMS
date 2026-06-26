import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { BundleCourseManager } from "@/components/admin/bundle-course-manager";
import { ListOrdered } from "lucide-react";

export const metadata = { title: "Manage Bundle Courses | Admin" };

interface BundleCoursesPageProps {
  params: Promise<{ bundleId: string }>;
}

export default async function BundleCoursesPage({ params }: BundleCoursesPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const { bundleId } = await params;
  const bundle = await db.bundle
    .findUnique({
      where: { id: bundleId },
      select: {
        id: true,
        title: true,
        courses: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            courseId: true,
            isRequired: true,
            course: { select: { title: true } },
          },
        },
      },
    })
    .catch(() => null);

  if (!bundle) notFound();

  const usedCourseIds = new Set(bundle.courses.map((c) => c.courseId));
  const availableCourses = await db.course
    .findMany({
      where: { id: { notIn: [...usedCourseIds] } },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Manage courses"
        description={`Courses in "${bundle.title}" — order, mark optional, add or remove.`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Bundles", href: "/admin/bundles" },
          { label: bundle.title, href: `/admin/bundles/${bundle.id}/edit` },
          { label: "Courses" },
        ]}
        icon={<ListOrdered className="h-5 w-5" />}
      />
      <BundleCourseManager
        bundleId={bundle.id}
        links={bundle.courses.map((c) => ({
          id: c.id,
          courseId: c.courseId,
          courseTitle: c.course.title,
          isRequired: c.isRequired,
        }))}
        availableCourses={availableCourses}
      />
    </div>
  );
}
