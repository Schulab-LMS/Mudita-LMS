import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { LessonForm } from "../../lesson-form";

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
    db.course.findUnique({ where: { id: courseId }, select: { id: true, title: true } }),
    db.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true, title: true, titleAr: true, titleDe: true,
        content: true, contentAr: true, contentDe: true,
        videoUrl: true, videoAssetId: true, thumbnail: true, duration: true, type: true, order: true, isFree: true,
        module: { select: { id: true, title: true, courseId: true } },
      },
    }),
  ]);

  if (!course || !lesson || lesson.module.courseId !== courseId || lesson.module.id !== moduleId) {
    notFound();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/courses" className="hover:text-foreground">Courses</Link>
        <span>/</span>
        <Link href={`/admin/courses/${courseId}`} className="hover:text-foreground">{course.title}</Link>
        <span>/</span>
        <span>{lesson.module.title}</span>
        <span>/</span>
        <span className="text-foreground font-medium">Edit Lesson</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Edit Lesson</h1>
        <p className="text-muted-foreground">Update lesson content and settings.</p>
      </div>

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
  );
}
