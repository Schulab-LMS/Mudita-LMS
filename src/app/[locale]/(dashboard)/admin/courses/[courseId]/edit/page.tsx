import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import CourseForm from "@/components/admin/course-form";
import { PageHeader } from "@/components/ui/page-header";
import { Pencil } from "lucide-react";

export const metadata = { title: "Edit Course | Admin" };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string; locale: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    redirect("/");
  }

  const { courseId } = await params;

  let course;
  try {
    course = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        ageGroup: true,
        level: true,
        category: true,
        isFree: true,
        price: true,
        currency: true,
        status: true,
        thumbnail: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch course:", error);
    notFound();
  }

  if (!course) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit course"
        description={`Update details for "${course.title}".`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Courses", href: "/admin/courses" },
          { label: course.title, href: `/admin/courses/${course.id}` },
          { label: "Edit" },
        ]}
        icon={<Pencil className="h-5 w-5" />}
      />
      <div className="card-premium p-6">
        <CourseForm
          mode="edit"
          initialData={{
            id: course.id,
            title: course.title,
            description: course.description,
            ageGroup: course.ageGroup,
            level: course.level,
            category: course.category,
            isFree: course.isFree,
            price: Number(course.price),
            currency: course.currency,
            status: course.status,
            thumbnail: course.thumbnail,
          }}
        />
      </div>
    </div>
  );
}
