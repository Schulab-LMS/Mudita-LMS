import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSessionView, getAssignableLessons } from "@/services/session.service";
import { getLocalizedField } from "@/services/course.service";
import {
  joinClassroom,
  loadChatHistory,
} from "@/services/live-classroom.service";
import { listPolls } from "@/services/classroom-poll.service";
import { isLiveKitConfigured } from "@/lib/livekit";
import { sanitize } from "@/lib/sanitize";
import { siteConfig } from "@/config/site";
import { ProtectedContent } from "@/components/shared/protected-content";
import { PageHeader } from "@/components/ui/page-header";
import { Link } from "@/i18n/navigation";
import { TutorControls } from "./tutor-controls";
import { ActivitySubmission } from "@/components/course/activity-submission";
import { ActivityFeedback } from "@/components/course/activity-feedback";
import { LiveClassroom } from "@/components/session/live-classroom";
import type { PresentationConfig } from "@/lib/presentation";
import {
  Video,
  NotebookPen,
  GraduationCap,
  Clock,
  BookOpen,
  ExternalLink,
  ClipboardList,
  PenLine,
} from "lucide-react";

export const metadata = { title: "Live Session" };

const statusChip: Record<string, string> = {
  PENDING: "chip chip-accent",
  CONFIRMED: "chip chip-success",
  COMPLETED: "chip chip-primary",
  CANCELLED: "chip chip-neutral",
  NO_SHOW: "chip chip-neutral",
};

export default async function SessionPage({
  params,
}: {
  params: Promise<{ bookingId: string; locale: string }>;
}) {
  const { bookingId, locale } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const view = await getSessionView(bookingId, session.user.id);
  if (!view) notFound();

  const { booking, role, tutorNotes, submission } = view;
  const isTutor = role === "TUTOR";
  const watermark = siteConfig.domain;

  const courses = isTutor ? await getAssignableLessons(booking.studentId) : [];

  const lesson = booking.lesson;
  const lessonTitle = lesson ? getLocalizedField(lesson, "title", locale) : null;
  const content = lesson ? getLocalizedField(lesson, "content", locale) : "";
  const activity = lesson ? getLocalizedField(lesson, "activity", locale) : "";
  const tutorNotesHtml =
    isTutor && tutorNotes ? getLocalizedField(tutorNotes, "tutorNotes", locale) : "";
  const presentationMarkdown =
    lesson && lesson.type === "PRESENTATION"
      ? getLocalizedField(lesson, "presentationContent", locale)
      : "";
  const hasPresentation = Boolean(presentationMarkdown);

  // Live classroom is offered when LiveKit is configured AND the lesson has
  // a deck to project. Without one of those, we fall back to the static
  // role-split view that already exists (handout + optional external
  // meetingUrl). The token + chat history fetch is server-side so the
  // browser only sees the LiveKit URL + JWT it actually needs.
  const liveClassroom =
    isLiveKitConfigured() && hasPresentation
      ? await joinClassroom(booking.id, session.user.id)
      : null;
  const initialChat = liveClassroom
    ? await loadChatHistory(liveClassroom.sessionId)
    : [];
  const initialPolls = liveClassroom
    ? await listPolls(liveClassroom.sessionId, session.user.id)
    : [];

  const counterpart = isTutor ? booking.student.name : booking.tutor.user.name;
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title={booking.subject}
        description={`${isTutor ? "Student" : "Tutor"}: ${counterpart} · ${timeFmt.format(
          new Date(booking.startTime)
        )}`}
        breadcrumbs={[
          { label: isTutor ? "Tutor" : "Student", href: isTutor ? "/tutor" : "/student" },
          { label: "Bookings", href: isTutor ? "/tutor/bookings" : "/student/bookings" },
          { label: "Session" },
        ]}
        icon={<Video className="h-5 w-5" />}
        actions={
          <>
            <span className={statusChip[booking.status] ?? "chip chip-neutral"}>
              {booking.status.toLowerCase()}
            </span>
            {booking.meetingUrl && (
              <a
                href={booking.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Join video <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            )}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        {/* Main: learning content */}
        <div className="min-w-0 space-y-5">
          {/* Tutor-only guidance — never rendered for students */}
          {isTutor && tutorNotesHtml && (
            <div className="overflow-hidden rounded-2xl border border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-center gap-2 border-b border-amber-300 px-5 py-3 dark:border-amber-800">
                <NotebookPen className="h-4 w-4 text-amber-700 dark:text-amber-300" aria-hidden />
                <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  Tutor notes &amp; learning objectives (hidden from student)
                </h2>
              </div>
              <div
                className="prose prose-sm max-w-none p-5 dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: sanitize(tutorNotesHtml) }}
              />
            </div>
          )}

          {lesson ? (
            <>
              {liveClassroom ? (
                <LiveClassroom
                  bookingId={booking.id}
                  token={liveClassroom.token}
                  livekitUrl={liveClassroom.livekitUrl}
                  role={liveClassroom.role}
                  selfId={session.user.id}
                  selfName={session.user.name ?? session.user.email ?? "Student"}
                  studentIdentity={booking.studentId}
                  initialSlide={liveClassroom.currentSlide}
                  initialChat={initialChat}
                  initialPolls={initialPolls}
                  presentationMarkdown={presentationMarkdown}
                  presentationConfig={
                    lesson.presentationConfig as PresentationConfig | null
                  }
                  watermark={watermark}
                  rtl={locale === "ar"}
                />
              ) : (
                <div className="card-premium overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                    <BookOpen className="h-4 w-4 text-primary" aria-hidden />
                    <h2 className="text-sm font-semibold text-foreground">{lessonTitle}</h2>
                  </div>
                  <div className="p-6">
                    {content ? (
                      <ProtectedContent watermark={watermark}>
                        <div
                          className="prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: sanitize(content) }}
                        />
                      </ProtectedContent>
                    ) : hasPresentation ? (
                      <p className="text-sm text-muted-foreground">
                        This lesson has a Reveal.js deck. Configure LIVEKIT_URL
                        / LIVEKIT_API_KEY / LIVEKIT_API_SECRET to open the live
                        classroom; otherwise students see the deck via the
                        self-paced lesson page.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        This lesson has no written content.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activity && (
                <div className="card-premium overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                    <NotebookPen className="h-4 w-4 text-primary" aria-hidden />
                    <h2 className="text-sm font-semibold text-foreground">Hands-on activity</h2>
                  </div>
                  <div className="p-6">
                    <ProtectedContent watermark={watermark}>
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: sanitize(activity) }}
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
                      Quiz · {lesson.quiz._count.questions} questions
                    </span>
                  </div>
                  <Link
                    href={`/student/quizzes/${lesson.quiz.id}`}
                    className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    {isTutor ? "Preview quiz" : "Take quiz"}
                  </Link>
                </div>
              )}

              {/* Activity submission / feedback */}
              {activity && (
                <div className="card-premium overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                    <PenLine className="h-4 w-4 text-primary" aria-hidden />
                    <h2 className="text-sm font-semibold text-foreground">
                      {isTutor ? "Review student's work" : "Submit your work"}
                    </h2>
                  </div>
                  <div className="p-5">
                    {isTutor ? (
                      <ActivityFeedback submission={submission} />
                    ) : (
                      <ActivitySubmission
                        lessonId={lesson.id}
                        bookingId={booking.id}
                        existing={submission}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card-premium flex flex-col items-center justify-center gap-2 p-12 text-center">
              <GraduationCap className="h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="text-sm font-medium text-foreground">
                {isTutor ? "No lesson selected yet" : "Waiting for your tutor"}
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                {isTutor
                  ? "Pick the lesson you'll teach from the controls panel — it appears here for both of you."
                  : "Your tutor will share the lesson content here when the session begins."}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card-premium space-y-2 p-5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" aria-hidden />
              {timeFmt.format(new Date(booking.startTime))}
            </div>
            <p className="text-muted-foreground">
              {isTutor ? "Student" : "Tutor"}:{" "}
              <span className="font-medium text-foreground">{counterpart}</span>
            </p>
            {booking.notes && (
              <p className="rounded-md bg-muted/50 px-3 py-2 text-xs italic text-muted-foreground">
                &ldquo;{booking.notes}&rdquo;
              </p>
            )}
          </div>

          {isTutor && (
            <TutorControls
              bookingId={booking.id}
              currentLessonId={booking.lessonId}
              meetingUrl={booking.meetingUrl}
              status={booking.status}
              courses={courses}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
