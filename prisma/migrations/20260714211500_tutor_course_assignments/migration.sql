CREATE TABLE "TutorCourseAssignment" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "assignedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TutorCourseAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TutorCourseAssignment_tutorId_courseId_key"
    ON "TutorCourseAssignment"("tutorId", "courseId");
CREATE INDEX "TutorCourseAssignment_courseId_idx"
    ON "TutorCourseAssignment"("courseId");

ALTER TABLE "TutorCourseAssignment" ADD CONSTRAINT "TutorCourseAssignment_tutorId_fkey"
    FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TutorCourseAssignment" ADD CONSTRAINT "TutorCourseAssignment_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve current teaching access at rollout: every course enrolled by a
-- learner who has booked the tutor becomes an explicit starting assignment.
INSERT INTO "TutorCourseAssignment" ("id", "tutorId", "courseId", "assignedById", "createdAt")
SELECT DISTINCT
    'backfill_' || md5(tp."id" || ':' || e."courseId"),
    tp."id",
    e."courseId",
    'system-backfill',
    CURRENT_TIMESTAMP
FROM "TutorProfile" tp
JOIN "Booking" b ON b."tutorId" = tp."id"
JOIN "Enrollment" e ON e."userId" = b."studentId"
WHERE e."status" IN ('ACTIVE', 'COMPLETED')
ON CONFLICT ("tutorId", "courseId") DO NOTHING;
