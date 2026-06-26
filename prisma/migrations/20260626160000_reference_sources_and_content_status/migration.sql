-- Reference sources + content-status migration.
-- Adds the ReferenceSource catalog (real external providers: ScratchJr, Scratch,
-- Code.org, NASA Space Place, PhET…) and the three ordered join tables that
-- credit a source on a course / bundle / pathway. Also adds the ContentStatus
-- workflow marker + free-form adminNotes to Course/Bundle/LearningPathway.

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('SEED_NOW', 'NEEDS_REVIEW', 'OPTIONAL_ENRICHMENT', 'IMPORTED_EXISTING');

-- CreateEnum
CREATE TYPE "SourceStatus" AS ENUM ('ACTIVE', 'HISTORICAL', 'OPTIONAL', 'ENRICHMENT');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "contentStatus" "ContentStatus" NOT NULL DEFAULT 'SEED_NOW';

-- AlterTable
ALTER TABLE "Bundle" ADD COLUMN     "adminNotes" TEXT;

-- AlterTable
ALTER TABLE "LearningPathway" ADD COLUMN     "adminNotes" TEXT;

-- CreateTable
CREATE TABLE "ReferenceSource" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "relatedTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendedAgeRange" TEXT,
    "usageInSchulab" TEXT NOT NULL,
    "status" "SourceStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferenceSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseReferenceSource" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CourseReferenceSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleReferenceSource" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BundleReferenceSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PathwayReferenceSource" (
    "id" TEXT NOT NULL,
    "pathwayId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PathwayReferenceSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceSource_key_key" ON "ReferenceSource"("key");

-- CreateIndex
CREATE INDEX "ReferenceSource_key_idx" ON "ReferenceSource"("key");

-- CreateIndex
CREATE INDEX "ReferenceSource_status_idx" ON "ReferenceSource"("status");

-- CreateIndex
CREATE INDEX "CourseReferenceSource_courseId_order_idx" ON "CourseReferenceSource"("courseId", "order");

-- CreateIndex
CREATE INDEX "CourseReferenceSource_sourceId_idx" ON "CourseReferenceSource"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseReferenceSource_courseId_sourceId_key" ON "CourseReferenceSource"("courseId", "sourceId");

-- CreateIndex
CREATE INDEX "BundleReferenceSource_bundleId_order_idx" ON "BundleReferenceSource"("bundleId", "order");

-- CreateIndex
CREATE INDEX "BundleReferenceSource_sourceId_idx" ON "BundleReferenceSource"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "BundleReferenceSource_bundleId_sourceId_key" ON "BundleReferenceSource"("bundleId", "sourceId");

-- CreateIndex
CREATE INDEX "PathwayReferenceSource_pathwayId_order_idx" ON "PathwayReferenceSource"("pathwayId", "order");

-- CreateIndex
CREATE INDEX "PathwayReferenceSource_sourceId_idx" ON "PathwayReferenceSource"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "PathwayReferenceSource_pathwayId_sourceId_key" ON "PathwayReferenceSource"("pathwayId", "sourceId");

-- CreateIndex
CREATE INDEX "Course_contentStatus_idx" ON "Course"("contentStatus");

-- AddForeignKey
ALTER TABLE "CourseReferenceSource" ADD CONSTRAINT "CourseReferenceSource_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReferenceSource" ADD CONSTRAINT "CourseReferenceSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ReferenceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleReferenceSource" ADD CONSTRAINT "BundleReferenceSource_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleReferenceSource" ADD CONSTRAINT "BundleReferenceSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ReferenceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PathwayReferenceSource" ADD CONSTRAINT "PathwayReferenceSource_pathwayId_fkey" FOREIGN KEY ("pathwayId") REFERENCES "LearningPathway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PathwayReferenceSource" ADD CONSTRAINT "PathwayReferenceSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ReferenceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
