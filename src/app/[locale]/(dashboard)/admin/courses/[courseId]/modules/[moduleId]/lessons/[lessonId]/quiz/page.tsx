import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { QuizBuilder } from "./quiz-builder";
import { PageHeader } from "@/components/ui/page-header";
import { ClipboardList } from "lucide-react";

export const metadata = { title: "Quiz Builder | Admin" };

export default async function QuizBuilderPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string; lessonId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const { courseId, moduleId, lessonId } = await params;

  const lesson = await db.lesson
    .findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: { select: { id: true, title: true } },
          },
        },
        quiz: {
          include: {
            questions: {
              orderBy: { order: "asc" },
              include: { answers: { orderBy: { order: "asc" } } },
            },
            _count: { select: { attempts: true } },
          },
        },
      },
    })
    .catch(() => null);

  if (
    !lesson ||
    lesson.module.courseId !== courseId ||
    lesson.module.id !== moduleId
  )
    notFound();

  const attemptCount = lesson.quiz?._count.attempts ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quiz builder"
        description={`Manage the quiz for "${lesson.title}"${
          lesson.quiz
            ? ` · ${attemptCount} attempt${attemptCount === 1 ? "" : "s"}`
            : ""
        }`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Courses", href: "/admin/courses" },
          { label: lesson.module.course.title, href: `/admin/courses/${courseId}` },
          { label: lesson.module.title },
          { label: lesson.title },
          { label: "Quiz" },
        ]}
        icon={<ClipboardList className="h-5 w-5" />}
      />

      <QuizBuilder
        lessonId={lessonId}
        courseId={courseId}
        quiz={
          lesson.quiz
            ? {
                id: lesson.quiz.id,
                title: lesson.quiz.title,
                passingScore: lesson.quiz.passingScore,
                timeLimit: lesson.quiz.timeLimit,
                questions: lesson.quiz.questions.map((q) => ({
                  id: q.id,
                  text: q.text,
                  textAr: q.textAr ?? "",
                  textDe: q.textDe ?? "",
                  type: q.type,
                  points: q.points,
                  order: q.order,
                  explanation: q.explanation ?? "",
                  answers: q.answers.map((a) => ({
                    id: a.id,
                    text: a.text,
                    textAr: a.textAr ?? "",
                    textDe: a.textDe ?? "",
                    isCorrect: a.isCorrect,
                  })),
                })),
              }
            : null
        }
      />
    </div>
  );
}
