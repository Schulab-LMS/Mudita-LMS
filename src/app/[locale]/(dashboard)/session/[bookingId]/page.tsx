import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSessionView, getAssignableLessons } from "@/services/session.service";
import { getLocalizedField } from "@/services/course.service";
import { sanitize } from "@/lib/sanitize";
import { ProtectedContent } from "@/components/shared/protected-content";
import { PageHeader } from "@/components/ui/page-header";
import { TutorControls } from "./tutor-controls";
import {
  Video,
  NotebookPen,
  GraduationCap,
  Clock,
  BookOpen,
  ExternalLink,
} from "lucide-react";

export const metadata = { title: "Live Session | Schulab" };

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

  const { booking, role, tutorNotes } = view;
  const isTutor = role === "TUTOR";

  const courses = isTutor ? await getAssignableLessons() : [];

  const lesson = booking.lesson;
  const lessonTitle = lesson ? getLocalizedField(lesson, "title", locale) : null;
  const content = lesson ? getLocalizedField(lesson, "content", locale) : "";
  const activity = lesson ? getLocalizedField(lesson, "activity", locale) : "";
  const tutorNotesHtml =
    isTutor && tutorNotes ? getLocalizedField(tutorNotes, "tutorNotes", locale) : "";

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
              <div className="card-premium overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                  <BookOpen className="h-4 w-4 text-primary" aria-hidden />
                  <h2 className="text-sm font-semibold text-foreground">{lessonTitle}</h2>
                </div>
                <div className="p-6">
                  {content ? (
                    <ProtectedContent>
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: sanitize(content) }}
                      />
                    </ProtectedContent>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      This lesson has no written content.
                    </p>
                  )}
                </div>
              </div>

              {activity && (
                <div className="card-premium overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                    <NotebookPen className="h-4 w-4 text-primary" aria-hidden />
                    <h2 className="text-sm font-semibold text-foreground">Hands-on activity</h2>
                  </div>
                  <div className="p-6">
                    <ProtectedContent>
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: sanitize(activity) }}
                      />
                    </ProtectedContent>
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
