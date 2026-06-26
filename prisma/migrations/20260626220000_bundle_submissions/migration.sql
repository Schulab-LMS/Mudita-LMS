-- Portfolio/capstone: an ActivitySubmission can target a lesson OR a bundle.

-- lessonId becomes nullable (bundle capstone submissions have no lesson).
ALTER TABLE "ActivitySubmission" ALTER COLUMN "lessonId" DROP NOT NULL;

-- New bundle reference (new column → no orphan rows). Cascade so removing a
-- bundle clears its capstone submissions.
ALTER TABLE "ActivitySubmission" ADD COLUMN "bundleId" TEXT;
CREATE INDEX "ActivitySubmission_bundleId_idx" ON "ActivitySubmission"("bundleId");
ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_bundleId_fkey"
  FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- One capstone submission per (student, bundle). NULL bundleId rows (lesson
-- submissions) stay distinct under Postgres NULL semantics, so this never
-- constrains the lesson path. Safe on existing data (all rows have bundleId NULL).
CREATE UNIQUE INDEX "ActivitySubmission_studentId_bundleId_key" ON "ActivitySubmission"("studentId", "bundleId");

-- XOR: a submission targets exactly one of a lesson or a bundle. Existing rows
-- all have lessonId set and bundleId null (1 + 0 = 1), so this passes.
ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "activity_submission_target_xor"
  CHECK ((("lessonId" IS NOT NULL)::int + ("bundleId" IS NOT NULL)::int) = 1);
