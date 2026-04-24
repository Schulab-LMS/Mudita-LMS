import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { LessonForm } from "../lesson-form";
import { PageHeader } from "@/components/ui/page-header";
import { Plus } from "lucide-react";

export const metadata = { title: "New Lesson | Admin" };

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const { courseId, moduleId } = await params;

  const [course, mod] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    }),
    db.module.findUnique({
      where: { id: moduleId },
      select: {
        id: true,
        title: true,
        courseId: true,
        _count: { select: { lessons: true } },
      },
    }),
  ]);

  if (!course || !mod || mod.courseId !== courseId) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="New lesson"
        description={`Add a lesson to "${mod.title}". You can attach a video, text, quiz, interactive, or assignment.`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Courses", href: "/admin/courses" },
          { label: course.title, href: `/admin/courses/${courseId}` },
          { label: mod.title },
          { label: "New lesson" },
        ]}
        icon={<Plus className="h-5 w-5" />}
      />
      <div className="card-premium p-6">
        <LessonForm
          mode="create"
          courseId={courseId}
          moduleId={moduleId}
          nextOrder={mod._count.lessons}
        />
      </div>
    </div>
  );
}
