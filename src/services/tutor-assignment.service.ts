import { db } from "@/lib/db";

const assignmentInclude = {
  student: { select: { id: true, name: true, email: true } },
  course: { select: { id: true, title: true, slug: true } },
  lesson: { select: { id: true, title: true } },
  tutor: { select: { user: { select: { id: true, name: true } } } },
  submissions: {
    select: {
      id: true,
      studentId: true,
      content: true,
      status: true,
      points: true,
      feedback: true,
      feedbackAt: true,
      submittedAt: true,
      updatedAt: true,
    },
  },
  quizAttempts: {
    orderBy: { submittedAt: "desc" as const },
    take: 1,
    select: {
      id: true,
      score: true,
      earnedPoints: true,
      totalPoints: true,
      passed: true,
      submittedAt: true,
    },
  },
} as const;

const tutorAssignmentInclude = {
  ...assignmentInclude,
  quizAttempts: {
    orderBy: { submittedAt: "desc" as const },
    select: {
      id: true,
      score: true,
      earnedPoints: true,
      totalPoints: true,
      passed: true,
      submittedAt: true,
    },
  },
  quizQuestions: {
    orderBy: { order: "asc" as const },
    include: { answers: { orderBy: { order: "asc" as const } } },
  },
} as const;

export async function getTutorAssignmentOptions(userId: string) {
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
    distinct: ["studentId"],
    select: {
      student: { select: { id: true, name: true, email: true } },
    },
  });
  const studentIds = bookings.map((booking) => booking.student.id);
  if (studentIds.length === 0) return { tutorId: tutor.id, learners: [] };
  const courseIds = tutor.courseAssignments.map((assignment) => assignment.courseId);

  const enrollments = await db.enrollment.findMany({
    where: {
      userId: { in: studentIds },
      courseId: { in: courseIds },
      status: { in: ["ACTIVE", "COMPLETED"] },
    },
    orderBy: { course: { title: "asc" } },
    select: {
      userId: true,
      course: {
        select: {
          id: true,
          title: true,
          modules: {
            where: { syncStatus: "ACTIVE" },
            orderBy: { order: "asc" },
            select: {
              title: true,
              lessons: {
                where: { syncStatus: "ACTIVE" },
                orderBy: { order: "asc" },
                select: { id: true, title: true },
              },
            },
          },
        },
      },
    },
  });

  const coursesByStudent = new Map<string, typeof enrollments[number]["course"][]>();
  for (const enrollment of enrollments) {
    const courses = coursesByStudent.get(enrollment.userId) ?? [];
    courses.push(enrollment.course);
    coursesByStudent.set(enrollment.userId, courses);
  }

  return {
    tutorId: tutor.id,
    learners: bookings
      .map(({ student }) => ({
        ...student,
        courses: coursesByStudent.get(student.id) ?? [],
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export async function getTutorAssignments(userId: string) {
  return db.tutorAssignment.findMany({
    where: {
      tutor: { userId },
      course: { tutorCourseAssignments: { some: { tutor: { userId } } } },
    },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    include: assignmentInclude,
  });
}

export async function getTutorAssignmentForReview(userId: string, assignmentId: string) {
  return db.tutorAssignment.findFirst({
    where: {
      id: assignmentId,
      tutor: { userId },
      course: { tutorCourseAssignments: { some: { tutor: { userId } } } },
    },
    include: tutorAssignmentInclude,
  });
}

export async function getStudentAssignments(studentId: string) {
  return db.tutorAssignment.findMany({
    where: { studentId, status: { in: ["PUBLISHED", "CLOSED"] } },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    include: assignmentInclude,
  });
}

export async function getStudentTutorQuiz(studentId: string, assignmentId: string) {
  return db.tutorAssignment.findFirst({
    where: {
      id: assignmentId,
      studentId,
      kind: "QUIZ",
      status: { in: ["PUBLISHED", "CLOSED"] },
    },
    select: {
      id: true,
      title: true,
      instructions: true,
      status: true,
      passingScore: true,
      dueAt: true,
      course: { select: { title: true } },
      tutor: { select: { user: { select: { name: true } } } },
      quizQuestions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          text: true,
          type: true,
          points: true,
          order: true,
          answers: {
            orderBy: { order: "asc" },
            select: { id: true, text: true, order: true },
          },
        },
      },
      quizAttempts: {
        where: { studentId },
        orderBy: { submittedAt: "desc" },
        select: {
          id: true,
          score: true,
          earnedPoints: true,
          totalPoints: true,
          passed: true,
          submittedAt: true,
        },
      },
    },
  });
}
