-- Marks a course as included with an active subscription whose plan tier is
-- >= the value set here. Nullable so existing free / one-time-purchase courses
-- keep working untouched. PlanTier enum already exists (FREE / LEARNER / PRO
-- / LIFETIME), so this migration only adds the column + its index.

ALTER TABLE "Course"
  ADD COLUMN "requiredPlan" "PlanTier";

CREATE INDEX "Course_requiredPlan_idx" ON "Course"("requiredPlan");
