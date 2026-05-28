-- CreateEnum
CREATE TYPE "ClassroomSessionStatus" AS ENUM ('PENDING', 'LIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "ClassroomEventType" AS ENUM ('SLIDE_SET', 'CHAT_MSG', 'HAND_RAISE', 'HAND_LOWER', 'POLL_OPEN', 'POLL_VOTE', 'REACTION', 'PERMISSION_GRANT');

-- CreateTable
CREATE TABLE "ClassroomSession" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "livekitRoom" TEXT NOT NULL,
    "status" "ClassroomSessionStatus" NOT NULL DEFAULT 'PENDING',
    "currentSlide" JSONB,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassroomSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomSession_bookingId_key" ON "ClassroomSession"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomSession_livekitRoom_key" ON "ClassroomSession"("livekitRoom");

-- CreateIndex
CREATE INDEX "ClassroomSession_status_idx" ON "ClassroomSession"("status");

-- AddForeignKey
ALTER TABLE "ClassroomSession" ADD CONSTRAINT "ClassroomSession_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ClassroomAttendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "durationSec" INTEGER,

    CONSTRAINT "ClassroomAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassroomAttendance_sessionId_idx" ON "ClassroomAttendance"("sessionId");

-- CreateIndex
CREATE INDEX "ClassroomAttendance_userId_idx" ON "ClassroomAttendance"("userId");

-- AddForeignKey
ALTER TABLE "ClassroomAttendance" ADD CONSTRAINT "ClassroomAttendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassroomSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ClassroomEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "ClassroomEventType" NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassroomEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassroomEvent_sessionId_createdAt_idx" ON "ClassroomEvent"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "ClassroomEvent_sessionId_type_idx" ON "ClassroomEvent"("sessionId", "type");

-- AddForeignKey
ALTER TABLE "ClassroomEvent" ADD CONSTRAINT "ClassroomEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassroomSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
