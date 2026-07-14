import { db } from "@/lib/db";

export async function getTutorTeachingOverview(userId: string) {
  const tutor = await db.tutorProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      courseAssignments: { select: { courseId: true } },
    },
  });
  if (!tutor) return null;

  const bookings = await db.booking.findMany({
    where: { tutorId: tutor.id },
    orderBy: { startTime: "desc" },
    select: {
      id: true,
      studentId: true,
      subject: true,
      startTime: true,
      endTime: true,
      status: true,
      lessonId: true,
      student: { select: { id: true, name: true, email: true, avatar: true } },
      lesson: {
        select: {
          id: true,
          title: true,
          module: { select: { course: { select: { id: true, title: true } } } },
        },
      },
      classroomSession: {
        select: {
          attendance: {
            select: { userId: true, joinedAt: true, leftAt: true, durationSec: true },
          },
        },
      },
    },
  });

  const studentIds = [...new Set(bookings.map((booking) => booking.studentId))];
  const courseIds = tutor.courseAssignments.map((assignment) => assignment.courseId);
  if (studentIds.length === 0) {
    return {
      tutorId: tutor.id,
      learners: [],
      courses: [],
      reviews: [],
      quizAttempts: [],
      attendance: [],
      totals: { learners: 0, courses: 0, awaitingReview: 0, recordedSessions: 0 },
    };
  }

  const [enrollments, lessonProgress, quizAttempts, submissions] = await Promise.all([
    db.enrollment.findMany({
      where: {
        userId: { in: studentIds },
        courseId: { in: courseIds },
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
      orderBy: { enrolledAt: "desc" },
      select: {
        userId: true,
        status: true,
        progress: true,
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    }),
    db.lessonProgress.findMany({
      where: {
        userId: { in: studentIds },
        lesson: { module: { courseId: { in: courseIds } } },
      },
      select: {
        userId: true,
        completed: true,
        lesson: { select: { module: { select: { courseId: true } } } },
      },
    }),
    db.quizAttempt.findMany({
      where: {
        userId: { in: studentIds },
        completedAt: { not: null },
        quiz: { lesson: { module: { courseId: { in: courseIds } } } },
      },
      orderBy: { completedAt: "desc" },
      take: 30,
      select: {
        id: true,
        userId: true,
        score: true,
        passed: true,
        completedAt: true,
        user: { select: { name: true } },
        quiz: {
          select: {
            title: true,
            lesson: {
              select: {
                module: { select: { course: { select: { id: true, title: true } } } },
              },
            },
          },
        },
      },
    }),
    db.activitySubmission.findMany({
      where: {
        studentId: { in: studentIds },
        lessonId: { not: null },
        lesson: { module: { courseId: { in: courseIds } } },
      },
      orderBy: { updatedAt: "desc" },
      take: 30,
      select: {
        id: true,
        studentId: true,
        bookingId: true,
        status: true,
        feedback: true,
        updatedAt: true,
        student: { select: { name: true } },
        lesson: {
          select: {
            id: true,
            title: true,
            module: { select: { course: { select: { id: true, title: true } } } },
          },
        },
      },
    }),
  ]);

  const completedLessons = new Map<string, number>();
  for (const row of lessonProgress) {
    if (!row.completed) continue;
    const key = `${row.userId}:${row.lesson.module.courseId}`;
    completedLessons.set(key, (completedLessons.get(key) ?? 0) + 1);
  }

  const learnerById = new Map(
    bookings.map((booking) => [
      booking.student.id,
      { ...booking.student, courses: [] as Array<{
        id: string;
        title: string;
        slug: string;
        status: string;
        progress: number;
        completedLessons: number;
      }> },
    ])
  );

  for (const enrollment of enrollments) {
    const learner = learnerById.get(enrollment.userId);
    if (!learner) continue;
    learner.courses.push({
      ...enrollment.course,
      status: enrollment.status,
      progress: enrollment.progress,
      completedLessons: completedLessons.get(`${enrollment.userId}:${enrollment.course.id}`) ?? 0,
    });
  }

  const courseMap = new Map<string, { id: string; title: string; slug: string; learners: number }>();
  for (const enrollment of enrollments) {
    const existing = courseMap.get(enrollment.course.id);
    if (existing) existing.learners += 1;
    else courseMap.set(enrollment.course.id, { ...enrollment.course, learners: 1 });
  }

  const bookingByStudentLesson = new Map(
    bookings
      .filter((booking) => booking.lessonId)
      .map((booking) => [`${booking.studentId}:${booking.lessonId}`, booking.id])
  );

  const reviews = submissions.map((submission) => ({
    ...submission,
    reviewSessionId:
      submission.bookingId ??
      (submission.lesson
        ? bookingByStudentLesson.get(`${submission.studentId}:${submission.lesson.id}`) ?? null
        : null),
  }));

  const attendance = bookings.map((booking) => {
    const studentAttendance = booking.classroomSession?.attendance.filter(
      (row) => row.userId === booking.studentId
    ) ?? [];
    return {
      id: booking.id,
      student: booking.student,
      subject: booking.subject,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      lesson: booking.lesson,
      joined: studentAttendance.length > 0,
      durationSec: studentAttendance.reduce((sum, row) => sum + (row.durationSec ?? 0), 0),
    };
  });

  return {
    tutorId: tutor.id,
    learners: [...learnerById.values()].sort((a, b) => a.name.localeCompare(b.name)),
    courses: [...courseMap.values()].sort((a, b) => a.title.localeCompare(b.title)),
    reviews,
    quizAttempts,
    attendance,
    totals: {
      learners: learnerById.size,
      courses: courseMap.size,
      awaitingReview: reviews.filter((review) => review.status === "SUBMITTED").length,
      recordedSessions: attendance.filter(
        (row) => row.joined || row.status === "COMPLETED" || row.status === "NO_SHOW"
      ).length,
    },
  };
}
