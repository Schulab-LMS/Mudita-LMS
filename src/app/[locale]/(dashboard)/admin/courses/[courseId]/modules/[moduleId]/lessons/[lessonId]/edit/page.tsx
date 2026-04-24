import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { LessonForm } from "../../lesson-form";
import { PageHeader } from "@/components/ui/page-header";
import { Pencil } from "lucide-react";

export const metadata = { title: "Edit Lesson | Admin" };

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string; lessonId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const { courseId, moduleId, lessonId } = await params;

  const [course, lesson] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    }),
    db.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        titleAr: true,
        titleDe: true,
        content: true,
        contentAr: true,
        contentDe: true,
        videoUrl: true,
        videoAssetId: true,
        thumbnail: true,
        duration: true,
        type: true,
        order: true,
        isFree: true,
        module: { select: { id: true, title: true, courseId: true } },
      },
    }),
  ]);

  if (
    !course ||
    !lesson ||
    lesson.module.courseId !== courseId ||
    lesson.module.id !== moduleId
  ) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit lesson"
        description={`Update content and settings for "${lesson.title}".`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Courses", href: "/admin/courses" },
          { label: course.title, href: `/admin/courses/${courseId}` },
          { label: lesson.module.title },
          { label: lesson.title },
        ]}
        icon={<Pencil className="h-5 w-5" />}
      />
      <div className="card-premium p-6">
        <LessonForm
          mode="edit"
          courseId={courseId}
          moduleId={moduleId}
          initialData={{
            id: lesson.id,
            title: lesson.title,
            titleAr: lesson.titleAr ?? "",
            titleDe: lesson.titleDe ?? "",
            content: lesson.content ?? "",
            contentAr: lesson.contentAr ?? "",
            contentDe: lesson.contentDe ?? "",
            videoUrl: lesson.videoUrl ?? "",
            videoAssetId: lesson.videoAssetId,
            thumbnail: lesson.thumbnail ?? null,
            duration: lesson.duration ?? 0,
            type: lesson.type,
            order: lesson.order,
            isFree: lesson.isFree,
          }}
        />
      </div>
    </div>
  );
}
