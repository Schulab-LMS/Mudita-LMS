-- Bundle-completion certificates: a Certificate is now for a course OR a bundle.

-- courseId becomes nullable (bundle certs have no course).
ALTER TABLE "Certificate" ALTER COLUMN "courseId" DROP NOT NULL;

-- New bundle reference with a real FK (the column is new → no orphan rows to
-- audit). ON DELETE CASCADE so removing a bundle clears its certificates.
ALTER TABLE "Certificate" ADD COLUMN "bundleId" TEXT;
CREATE INDEX "Certificate_bundleId_idx" ON "Certificate"("bundleId");
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_bundleId_fkey"
  FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- XOR: exactly one of (courseId, bundleId) is set. Existing rows all have
-- courseId set and bundleId null (1 + 0 = 1), so this passes on current data.
ALTER TABLE "Certificate" ADD CONSTRAINT "certificate_subject_xor"
  CHECK ((("courseId" IS NOT NULL)::int + ("bundleId" IS NOT NULL)::int) = 1);

-- One certificate per (user, bundle). NULL bundleId rows (course certs) are
-- distinct under Postgres NULL semantics, so this never constrains the course
-- path. Safe on existing data (all current rows have bundleId NULL).
CREATE UNIQUE INDEX "Certificate_userId_bundleId_key" ON "Certificate"("userId", "bundleId");
