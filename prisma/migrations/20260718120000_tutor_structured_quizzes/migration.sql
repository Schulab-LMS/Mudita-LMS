-- Structured, auto-graded quizzes authored by tutors for an explicitly
-- targeted learner. These tables are separate from curriculum lesson quizzes
-- because a lesson can have only one canonical curriculum quiz.
ALTER TABLE "TutorAssignment" ADD COLUMN "passingScore" INTEGER;

CREATE TABLE "TutorQuizQuestion" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "points" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL,
    "explanation" TEXT,
    CONSTRAINT "TutorQuizQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TutorQuizAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    CONSTRAINT "TutorQuizAnswer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TutorQuizAttempt" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "earnedPoints" INTEGER NOT NULL,
    "totalPoints" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TutorQuizAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TutorQuizQuestion_assignmentId_order_key" ON "TutorQuizQuestion"("assignmentId", "order");
CREATE INDEX "TutorQuizQuestion_assignmentId_idx" ON "TutorQuizQuestion"("assignmentId");
CREATE INDEX "TutorQuizAnswer_questionId_idx" ON "TutorQuizAnswer"("questionId");
CREATE INDEX "TutorQuizAttempt_assignmentId_submittedAt_idx" ON "TutorQuizAttempt"("assignmentId", "submittedAt");
CREATE INDEX "TutorQuizAttempt_studentId_submittedAt_idx" ON "TutorQuizAttempt"("studentId", "submittedAt");

ALTER TABLE "TutorQuizQuestion" ADD CONSTRAINT "TutorQuizQuestion_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "TutorAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TutorQuizAnswer" ADD CONSTRAINT "TutorQuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TutorQuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TutorQuizAttempt" ADD CONSTRAINT "TutorQuizAttempt_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "TutorAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TutorQuizAttempt" ADD CONSTRAINT "TutorQuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
