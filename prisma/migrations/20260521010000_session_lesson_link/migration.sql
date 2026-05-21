-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "lessonId" TEXT;

-- CreateIndex
CREATE INDEX "Booking_lessonId_idx" ON "Booking"("lessonId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
