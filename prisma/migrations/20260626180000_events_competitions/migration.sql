-- Events & Competitions migration.
-- Extends the Competition model to double as the "Events & Competitions" catalog
-- of reputable EXTERNAL programs (FIRST LEGO League, WRO, Astro Pi…). External
-- entries (isExternal = true) carry provider/URL/region/season/track metadata,
-- precise age spans and a link to an in-DB preparation pathway, plus two join
-- tables mapping prep courses/bundles to each event. Hosted competitions
-- (isExternal = false) keep working; their date fields are now nullable so
-- external events (no SchuLab-run registration) can omit them.

-- CreateEnum
CREATE TYPE "EventRegion" AS ENUM ('GLOBAL', 'EUROPE', 'GERMANY', 'US', 'UK');

-- CreateEnum
CREATE TYPE "EventListingStatus" AS ENUM ('ACTIVE', 'OPTIONAL', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EventRecommendationType" AS ENUM ('PREREQUISITE', 'RECOMMENDED', 'ADVANCED_PREPARATION');

-- AlterTable: relax hosted-competition date fields to nullable
ALTER TABLE "Competition" ALTER COLUMN "registrationStart" DROP NOT NULL,
ALTER COLUMN "registrationEnd" DROP NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL;

-- AlterTable: external-event catalog metadata
ALTER TABLE "Competition" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isExternal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "eventType" TEXT,
ADD COLUMN     "officialProvider" TEXT,
ADD COLUMN     "officialUrl" TEXT,
ADD COLUMN     "region" "EventRegion",
ADD COLUMN     "tracks" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "seasonMonths" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "ageMin" INTEGER,
ADD COLUMN     "ageMax" INTEGER,
ADD COLUMN     "levelMin" "CourseLevel",
ADD COLUMN     "levelMax" "CourseLevel",
ADD COLUMN     "listingStatus" "EventListingStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "eligibilityRules" JSONB,
ADD COLUMN     "preparationPathId" TEXT;

-- CreateTable
CREATE TABLE "EventCourseRecommendation" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "recommendationType" "EventRecommendationType" NOT NULL DEFAULT 'RECOMMENDED',
    "reason" TEXT NOT NULL,
    "minimumCompletionPercentage" INTEGER NOT NULL DEFAULT 100,
    "requiredAssessmentScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventCourseRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventBundleRecommendation" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "recommendationType" "EventRecommendationType" NOT NULL DEFAULT 'RECOMMENDED',
    "reason" TEXT NOT NULL,
    "minimumCompletionPercentage" INTEGER NOT NULL DEFAULT 100,
    "requiredAssessmentScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventBundleRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Competition_isExternal_listingStatus_idx" ON "Competition"("isExternal", "listingStatus");

-- CreateIndex
CREATE INDEX "EventCourseRecommendation_courseId_idx" ON "EventCourseRecommendation"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "EventCourseRecommendation_competitionId_courseId_key" ON "EventCourseRecommendation"("competitionId", "courseId");

-- CreateIndex
CREATE INDEX "EventBundleRecommendation_bundleId_idx" ON "EventBundleRecommendation"("bundleId");

-- CreateIndex
CREATE UNIQUE INDEX "EventBundleRecommendation_competitionId_bundleId_key" ON "EventBundleRecommendation"("competitionId", "bundleId");

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_preparationPathId_fkey" FOREIGN KEY ("preparationPathId") REFERENCES "LearningPathway"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCourseRecommendation" ADD CONSTRAINT "EventCourseRecommendation_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCourseRecommendation" ADD CONSTRAINT "EventCourseRecommendation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBundleRecommendation" ADD CONSTRAINT "EventBundleRecommendation_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBundleRecommendation" ADD CONSTRAINT "EventBundleRecommendation_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
