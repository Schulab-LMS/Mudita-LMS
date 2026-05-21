import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getCourseBySlug, getLocalizedField } from "@/services/course.service";
import { getLessonProgress } from "@/services/progress.service";
import { LessonSidebar } from "@/components/course/lesson-sidebar";
import { VideoPlayer } from "@/components/course/video-player";
import { MarkCompleteButton } from "@/components/course/mark-complete-button";
import { ProtectedContent } from "@/components/shared/protected-content";
import { ActivitySubmission } from "@/components/course/activity-submission";
import { getActivitySubmission } from "@/services/activity.service";
import { sanitize } from "@/lib/sanitize";
import { db } from "@/lib/db";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  BookOpen,
  Clock,
  ArrowRight,
  MessageSquare,
  FileText,
  NotebookPen,
  ChevronLeft,
  ClipboardList,
  PenLine,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

interface LessonPageProps {
  params: Promise<{ courseSlug: string; lessonId: string; locale: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonId, locale } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const course = await getCourseBySlug(courseSlug);
  if (!course) notFound();

  // Verify user is enrolled (or course is free)
  if (!course.isFree) {
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
    });
    if (!enrollment) redirect(`/courses/${courseSlug}`);
  }

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const lesson = allLessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  const progressRecords = await getLessonProgress(
    session.user.id,
    course.id
  );
  const completedLessonIds = progressRecords
    .filter((p) => p.completed)
    .map((p) => p.lessonId);

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = allLessons[currentIndex - 1];
  const nextLesson = allLessons[currentIndex + 1];
  const isCompleted = completedLessonIds.includes(lessonId);
  const courseProgress =
    allLessons.length > 0
      ? Math.round((completedLessonIds.length / allLessons.length) * 100)
      : 0;
  const durationMin = lesson.duration
    ? Math.round(lesson.duration / 60)
    : null;

  const lessonContent = getLocalizedField(lesson, "content", locale);
  const lessonActivity = getLocalizedField(lesson, "activity", locale);
  const watermark = session.user.email ?? session.user.name ?? undefined;
  const submission = lessonActivity
    ? await getActivitySubmission(lesson.id, session.user.id)
    : null;

  const t = await getTranslations("lesson");

  return (
    <div className="space-y-4">
      {/* Breadcrumbs + back link */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: "Courses", href: "/courses" },
            { label: course.title, href: `/courses/${courseSlug}` },
            { label: lesson.title },
          ]}
        />
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
          Course overview
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        {/* Main content */}
        <div className="min-w-0 space-y-5">
          {/* Lesson header */}
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" aria-hidden />
                Lesson {currentIndex + 1} of {allLessons.length}
              </span>
              {durationMin && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {durationMin} min
                </span>
              )}
              {isCompleted && (
                <span className="chip chip-success">Completed</span>
              )}
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {lesson.title}
            </h1>
          </div>

          {/* Video / placeholder */}
          {lesson.videoAssetId || lesson.videoUrl ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
              <VideoPlayer
                assetId={lesson.videoAssetId}
                url={lesson.videoUrl}
                title={lesson.title}
                poster={lesson.thumbnail}
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
              {t("noVideo")}
            </div>
          )}

          {/* Content tabs — Overview is the live surface; Notes / Resources /
              Discussion are placeholders until the backing data lands. */}
          <div className="card-premium overflow-hidden">
            <div className="flex items-center gap-1 border-b border-border px-2">
              <TabPill label="Overview" icon={<FileText className="h-3.5 w-3.5" />} active />
              <TabPill
                label="Notes"
                icon={<NotebookPen className="h-3.5 w-3.5" />}
                soon
              />
              <TabPill
                label="Resources"
                icon={<BookOpen className="h-3.5 w-3.5" />}
                soon
              />
              <TabPill
                label="Q&A"
                icon={<MessageSquare className="h-3.5 w-3.5" />}
                soon
              />
            </div>

            <div className="p-6">
              {lessonContent ? (
                <ProtectedContent watermark={watermark}>
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{
                      __html: sanitize(lessonContent),
                    }}
                  />
                </ProtectedContent>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No written notes for this lesson. Watch the video above or
                  jump ahead to the next lesson.
                </p>
              )}
            </div>
          </div>

          {/* Hands-on activity (synced from the curriculum's activity.md) */}
          {lessonActivity && (
            <div className="card-premium overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-6 py-3">
                <NotebookPen className="h-4 w-4 text-primary" aria-hidden />
                <h2 className="text-sm font-semibold text-foreground">
                  Hands-on activity
                </h2>
              </div>
              <div className="p-6">
                <ProtectedContent watermark={watermark}>
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: sanitize(lessonActivity) }}
                  />
                </ProtectedContent>
              </div>
            </div>
          )}

          {/* Quiz */}
          {lesson.quiz && lesson.quiz._count.questions > 0 && (
            <div className="card-premium flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" aria-hidden />
                <span className="text-sm font-semibold text-foreground">
                  {lesson.quiz.title} · {lesson.quiz._count.questions} questions
                </span>
              </div>
              <Link
                href={`/student/quizzes/${lesson.quiz.id}`}
                className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Take quiz
              </Link>
            </div>
          )}

          {/* Activity submission */}
          {lessonActivity && (
            <div className="card-premium overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-6 py-3">
                <PenLine className="h-4 w-4 text-primary" aria-hidden />
                <h2 className="text-sm font-semibold text-foreground">Submit your work</h2>
              </div>
              <div className="p-6">
                <ActivitySubmission lessonId={lesson.id} existing={submission} />
              </div>
            </div>
          )}

          {/* Completion + next-lesson footer */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {prevLesson && (
                <Link
                  href={`/student/learn/${courseSlug}/${prevLesson.id}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
                  Previous
                </Link>
              )}
              <MarkCompleteButton
                lessonId={lessonId}
                courseId={course.id}
                isCompleted={isCompleted}
                nextLessonId={nextLesson?.id}
                courseSlug={courseSlug}
              />
            </div>

            {nextLesson && (
              <Link
                href={`/student/learn/${courseSlug}/${nextLesson.id}`}
                className="card-premium group flex items-center gap-3 p-3 sm:min-w-[18rem]"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-launch-gradient-soft">
                  <ArrowRight
                    className="h-4 w-4 text-primary rtl:rotate-180"
                    aria-hidden
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Up next
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                    {nextLesson.title}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <LessonSidebar
          lessons={allLessons.map((l) => ({
            id: l.id,
            title: l.title,
            duration: l.duration,
            order: l.order,
            type: l.type,
          }))}
          currentLessonId={lessonId}
          completedLessonIds={completedLessonIds}
          courseSlug={courseSlug}
          courseTitle={course.title}
          progressPercent={courseProgress}
        />
      </div>
    </div>
  );
}

function TabPill({
  label,
  icon,
  active,
  soon,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  soon?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={soon}
      className={`relative inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      } ${soon ? "cursor-not-allowed opacity-60" : ""}`}
    >
      {icon}
      {label}
      {soon && (
        <span className="chip chip-neutral ms-1 px-1.5 py-0 text-[9px]">
          Soon
        </span>
      )}
    </button>
  );
}
