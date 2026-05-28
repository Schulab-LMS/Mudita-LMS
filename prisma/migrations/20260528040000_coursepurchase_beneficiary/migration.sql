-- AlterTable
ALTER TABLE "CoursePurchase" ADD COLUMN "beneficiaryUserId" TEXT;

-- DropIndex
DROP INDEX "CoursePurchase_userId_courseId_status_key";

-- CreateIndex
CREATE UNIQUE INDEX "CoursePurchase_userId_courseId_beneficiaryUserId_status_key" ON "CoursePurchase"("userId", "courseId", "beneficiaryUserId", "status");

-- CreateIndex
CREATE INDEX "CoursePurchase_beneficiaryUserId_idx" ON "CoursePurchase"("beneficiaryUserId");

-- AddForeignKey
ALTER TABLE "CoursePurchase" ADD CONSTRAINT "CoursePurchase_beneficiaryUserId_fkey" FOREIGN KEY ("beneficiaryUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
