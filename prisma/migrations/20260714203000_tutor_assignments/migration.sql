CREATE TYPE "TutorAssignmentKind" AS ENUM ('ASSIGNMENT', 'QUIZ', 'PROJECT');
CREATE TYPE "TutorAssignmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');
CREATE TYPE "TutorAssignmentSubmissionStatus" AS ENUM ('SUBMITTED', 'REVIEWED', 'RETURNED');

CREATE TABLE "TutorAssignment" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "kind" "TutorAssignmentKind" NOT NULL DEFAULT 'ASSIGNMENT',
    "status" "TutorAssignmentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "dueAt" TIMESTAMP(3),
    "maxPoints" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TutorAssignment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TutorAssignment_maxPoints_check" CHECK ("maxPoints" > 0)
);

CREATE TABLE "TutorAssignmentSubmission" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "TutorAssignmentSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "points" INTEGER,
    "feedback" TEXT,
    "feedbackById" TEXT,
    "feedbackAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TutorAssignmentSubmission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TutorAssignmentSubmission_points_check" CHECK ("points" IS NULL OR "points" >= 0)
);

CREATE INDEX "TutorAssignment_tutorId_status_idx" ON "TutorAssignment"("tutorId", "status");
CREATE INDEX "TutorAssignment_studentId_status_idx" ON "TutorAssignment"("studentId", "status");
CREATE INDEX "TutorAssignment_courseId_idx" ON "TutorAssignment"("courseId");
CREATE INDEX "TutorAssignment_dueAt_idx" ON "TutorAssignment"("dueAt");
CREATE UNIQUE INDEX "TutorAssignmentSubmission_assignmentId_studentId_key" ON "TutorAssignmentSubmission"("assignmentId", "studentId");
CREATE INDEX "TutorAssignmentSubmission_studentId_status_idx" ON "TutorAssignmentSubmission"("studentId", "status");

ALTER TABLE "TutorAssignment" ADD CONSTRAINT "TutorAssignment_tutorId_fkey"
    FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TutorAssignment" ADD CONSTRAINT "TutorAssignment_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TutorAssignment" ADD CONSTRAINT "TutorAssignment_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TutorAssignment" ADD CONSTRAINT "TutorAssignment_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TutorAssignmentSubmission" ADD CONSTRAINT "TutorAssignmentSubmission_assignmentId_fkey"
    FOREIGN KEY ("assignmentId") REFERENCES "TutorAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TutorAssignmentSubmission" ADD CONSTRAINT "TutorAssignmentSubmission_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
