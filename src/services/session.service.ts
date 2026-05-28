import { db } from "@/lib/db";

export type SessionRole = "STUDENT" | "TUTOR";

// Load a live session (a Booking) for a participant, role-split. Tutor-only
// notes are fetched ONLY when the viewer is the tutor — never for students.
export async function getSessionView(bookingId: string, userId: string) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      subject: true,
      startTime: true,
      endTime: true,
      status: true,
      meetingUrl: true,
      notes: true,
      lessonId: true,
      studentId: true,
      student: { select: { name: true, avatar: true } },
      tutor: {
        select: { userId: true, user: { select: { name: true, avatar: true } } },
      },
      lesson: {
        // Student-safe lesson fields only. tutorNotes is fetched separately
        // below, guarded by the tutor check.
        select: {
          id: true,
          title: true,
          titleAr: true,
          titleDe: true,
          content: true,
          contentAr: true,
          contentDe: true,
          activity: true,
          activityAr: true,
          activityDe: true,
          type: true,
          presentationFormat: true,
          presentationContent: true,
          presentationContentAr: true,
          presentationContentDe: true,
          presentationConfig: true,
          quiz: { select: { id: true, _count: { select: { questions: true } } } },
          module: {
            select: {
              id: true,
              title: true,
              course: { select: { id: true, slug: true, title: true } },
            },
          },
        },
      },
    },
  });
  if (!booking) return null;

  const isStudent = booking.studentId === userId;
  const isTutor = booking.tutor.userId === userId;
  if (!isStudent && !isTutor) return null;

  const role: SessionRole = isTutor ? "TUTOR" : "STUDENT";

  let tutorNotes:
    | { tutorNotes: string | null; tutorNotesAr: string | null; tutorNotesDe: string | null }
    | null = null;
  if (isTutor && booking.lessonId) {
    tutorNotes = await db.lesson.findUnique({
      where: { id: booking.lessonId },
      select: { tutorNotes: true, tutorNotesAr: true, tutorNotesDe: true },
    });
  }

  // The student's activity submission for this lesson (their own if STUDENT,
  // the booking's student's if TUTOR — so the tutor can review + give feedback).
  let submission = null;
  if (booking.lessonId) {
    submission = await db.activitySubmission.findUnique({
      where: {
        studentId_lessonId: { studentId: booking.studentId, lessonId: booking.lessonId },
      },
      select: {
        id: true,
        content: true,
        status: true,
        feedback: true,
        feedbackAt: true,
        updatedAt: true,
      },
    });
  }

  return { booking, role, tutorNotes, submission };
}

// Courses/modules/lessons a tutor can assign to a session. Includes
// non-archived courses (DRAFT curriculum is teachable in a private session
// even before it's published to the public catalog).
export async function getAssignableLessons() {
  return db.course.findMany({
    where: { status: { not: "ARCHIVED" } },
    select: {
      id: true,
      title: true,
      modules: {
        where: { syncStatus: "ACTIVE" },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          lessons: {
            where: { syncStatus: "ACTIVE" },
            orderBy: { order: "asc" },
            select: { id: true, title: true },
          },
        },
      },
    },
    orderBy: { title: "asc" },
  });
}
