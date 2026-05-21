-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('ACTIVE', 'REMOVED');

-- CreateEnum
CREATE TYPE "SyncRunStatus" AS ENUM ('RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "SyncTrigger" AS ENUM ('WEBHOOK', 'MANUAL', 'CRON');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "managedByGit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceCommitSha" TEXT,
ADD COLUMN     "sourcePath" TEXT,
ADD COLUMN     "syncStatus" "SyncStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "activity" TEXT,
ADD COLUMN     "activityAr" TEXT,
ADD COLUMN     "activityDe" TEXT,
ADD COLUMN     "sourcePath" TEXT,
ADD COLUMN     "syncStatus" "SyncStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "tutorNotes" TEXT,
ADD COLUMN     "tutorNotesAr" TEXT,
ADD COLUMN     "tutorNotesDe" TEXT;

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "sourcePath" TEXT,
ADD COLUMN     "syncStatus" "SyncStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "CurriculumSyncRun" (
    "id" TEXT NOT NULL,
    "commitSha" TEXT,
    "status" "SyncRunStatus" NOT NULL DEFAULT 'RUNNING',
    "trigger" "SyncTrigger" NOT NULL,
    "coursesUpserted" INTEGER NOT NULL DEFAULT 0,
    "lessonsUpserted" INTEGER NOT NULL DEFAULT 0,
    "coursesArchived" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "CurriculumSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CurriculumSyncRun_startedAt_idx" ON "CurriculumSyncRun"("startedAt");

-- CreateIndex
CREATE INDEX "Course_managedByGit_idx" ON "Course"("managedByGit");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_moduleId_sourcePath_key" ON "Lesson"("moduleId", "sourcePath");

-- CreateIndex
CREATE UNIQUE INDEX "Module_courseId_sourcePath_key" ON "Module"("courseId", "sourcePath");
