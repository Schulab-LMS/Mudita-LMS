-- ============================================================================
-- Bundles, Pathways & the 6-band AgeGroup migration
-- ============================================================================

-- 1. Migrate the AgeGroup enum from 5 bands to 6. Postgres can't drop enum
--    values in place, so we create a new type, remap every existing column
--    with an explicit CASE (the old bands are NOT a subset of the new ones,
--    so a plain text cast would fail), then swap the types.
--    Only pre-existing tables are altered here; Bundle / LearningPathway are
--    created further down and already use the final "AgeGroup" type.
CREATE TYPE "AgeGroup_new" AS ENUM ('AGES_3_5', 'AGES_5_7', 'AGES_8_10', 'AGES_11_13', 'AGES_14_16', 'AGES_17_18');

ALTER TABLE "Course" ALTER COLUMN "ageGroup" TYPE "AgeGroup_new" USING (
  (CASE "ageGroup"::text
    WHEN 'AGES_6_8' THEN 'AGES_5_7'
    WHEN 'AGES_9_12' THEN 'AGES_8_10'
    WHEN 'AGES_13_15' THEN 'AGES_14_16'
    WHEN 'AGES_16_18' THEN 'AGES_17_18'
    ELSE "ageGroup"::text
  END)::"AgeGroup_new"
);

ALTER TABLE "Product" ALTER COLUMN "ageGroup" TYPE "AgeGroup_new" USING (
  (CASE "ageGroup"::text
    WHEN 'AGES_6_8' THEN 'AGES_5_7'
    WHEN 'AGES_9_12' THEN 'AGES_8_10'
    WHEN 'AGES_13_15' THEN 'AGES_14_16'
    WHEN 'AGES_16_18' THEN 'AGES_17_18'
    ELSE "ageGroup"::text
  END)::"AgeGroup_new"
);

ALTER TABLE "Competition" ALTER COLUMN "ageGroup" TYPE "AgeGroup_new" USING (
  (CASE "ageGroup"::text
    WHEN 'AGES_6_8' THEN 'AGES_5_7'
    WHEN 'AGES_9_12' THEN 'AGES_8_10'
    WHEN 'AGES_13_15' THEN 'AGES_14_16'
    WHEN 'AGES_16_18' THEN 'AGES_17_18'
    ELSE "ageGroup"::text
  END)::"AgeGroup_new"
);

ALTER TYPE "AgeGroup" RENAME TO "AgeGroup_old";
ALTER TYPE "AgeGroup_new" RENAME TO "AgeGroup";
DROP TYPE "public"."AgeGroup_old";

-- 2. New Course columns: catalog metadata, standalone capstone, audience
--    blurbs, and the "next recommended course" self-pointer.
ALTER TABLE "Course" ADD COLUMN     "finalProjectDescription" TEXT,
ADD COLUMN     "finalProjectDescriptionAr" TEXT,
ADD COLUMN     "finalProjectDescriptionDe" TEXT,
ADD COLUMN     "finalProjectTitle" TEXT,
ADD COLUMN     "finalProjectTitleAr" TEXT,
ADD COLUMN     "finalProjectTitleDe" TEXT,
ADD COLUMN     "nextCourseId" TEXT,
ADD COLUMN     "parentSummary" TEXT,
ADD COLUMN     "parentSummaryAr" TEXT,
ADD COLUMN     "parentSummaryDe" TEXT,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "studentSummary" TEXT,
ADD COLUMN     "studentSummaryAr" TEXT,
ADD COLUMN     "studentSummaryDe" TEXT,
ADD COLUMN     "tools" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 3. New tables.
CREATE TABLE "Bundle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleDe" TEXT,
    "description" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionDe" TEXT,
    "thumbnail" TEXT,
    "themeCategory" TEXT NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "level" "CourseLevel" NOT NULL DEFAULT 'BEGINNER',
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "requiredPlan" "PlanTier",
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "finalProjectTitle" TEXT,
    "finalProjectTitleAr" TEXT,
    "finalProjectTitleDe" TEXT,
    "finalProjectDescription" TEXT,
    "finalProjectDescriptionAr" TEXT,
    "finalProjectDescriptionDe" TEXT,
    "learningObjectives" JSONB,
    "recommendedDurationWeeks" INTEGER,
    "organizationId" TEXT,
    "managedByGit" BOOLEAN NOT NULL DEFAULT false,
    "sourcePath" TEXT,
    "sourceCommitSha" TEXT,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BundleCourse" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BundleCourse_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearningPathway" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleDe" TEXT,
    "description" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionDe" TEXT,
    "thumbnail" TEXT,
    "ageGroup" "AgeGroup" NOT NULL,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "order" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPathway_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PathwayStage" (
    "id" TEXT NOT NULL,
    "pathwayId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT,
    "titleAr" TEXT,
    "titleDe" TEXT,
    "bundleId" TEXT,
    "courseId" TEXT,

    CONSTRAINT "PathwayStage_pkey" PRIMARY KEY ("id")
);

-- 4. Indexes.
CREATE INDEX "Course_nextCourseId_idx" ON "Course"("nextCourseId");
CREATE UNIQUE INDEX "Bundle_slug_key" ON "Bundle"("slug");
CREATE INDEX "Bundle_slug_idx" ON "Bundle"("slug");
CREATE INDEX "Bundle_themeCategory_idx" ON "Bundle"("themeCategory");
CREATE INDEX "Bundle_ageGroup_idx" ON "Bundle"("ageGroup");
CREATE INDEX "Bundle_status_idx" ON "Bundle"("status");
CREATE INDEX "Bundle_requiredPlan_idx" ON "Bundle"("requiredPlan");
CREATE INDEX "Bundle_organizationId_idx" ON "Bundle"("organizationId");
CREATE INDEX "BundleCourse_bundleId_order_idx" ON "BundleCourse"("bundleId", "order");
CREATE INDEX "BundleCourse_courseId_idx" ON "BundleCourse"("courseId");
CREATE UNIQUE INDEX "BundleCourse_bundleId_courseId_key" ON "BundleCourse"("bundleId", "courseId");
CREATE UNIQUE INDEX "LearningPathway_slug_key" ON "LearningPathway"("slug");
CREATE INDEX "LearningPathway_slug_idx" ON "LearningPathway"("slug");
CREATE INDEX "LearningPathway_ageGroup_idx" ON "LearningPathway"("ageGroup");
CREATE INDEX "LearningPathway_status_idx" ON "LearningPathway"("status");
CREATE INDEX "LearningPathway_organizationId_idx" ON "LearningPathway"("organizationId");
CREATE INDEX "PathwayStage_pathwayId_order_idx" ON "PathwayStage"("pathwayId", "order");
CREATE INDEX "PathwayStage_bundleId_idx" ON "PathwayStage"("bundleId");
CREATE INDEX "PathwayStage_courseId_idx" ON "PathwayStage"("courseId");
CREATE UNIQUE INDEX "PathwayStage_pathwayId_order_key" ON "PathwayStage"("pathwayId", "order");

-- 5. Foreign keys.
ALTER TABLE "Course" ADD CONSTRAINT "Course_nextCourseId_fkey" FOREIGN KEY ("nextCourseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Bundle" ADD CONSTRAINT "Bundle_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BundleCourse" ADD CONSTRAINT "BundleCourse_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BundleCourse" ADD CONSTRAINT "BundleCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningPathway" ADD CONSTRAINT "LearningPathway_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PathwayStage" ADD CONSTRAINT "PathwayStage_pathwayId_fkey" FOREIGN KEY ("pathwayId") REFERENCES "LearningPathway"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PathwayStage" ADD CONSTRAINT "PathwayStage_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PathwayStage" ADD CONSTRAINT "PathwayStage_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. XOR: a pathway stage points at EXACTLY ONE of a bundle or a course.
--    Prisma can't express this, so it lives here in committed SQL (survives
--    `migrate reset`). Mirrored at the app layer by addPathwayStageSchema.
ALTER TABLE "PathwayStage" ADD CONSTRAINT "pathway_stage_target_xor"
  CHECK ((("bundleId" IS NOT NULL)::int + ("courseId" IS NOT NULL)::int) = 1);
