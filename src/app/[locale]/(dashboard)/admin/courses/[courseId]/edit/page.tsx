import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import CourseForm from "@/components/admin/course-form";

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
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Edit Course</h1>
        <p className="text-muted-foreground">
          Update the details for this course.
        </p>
      </div>

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
  );
}
