-- AlterTable
ALTER TABLE "ClassroomSession" ADD COLUMN "recordingUrl" TEXT;

-- CreateTable
CREATE TABLE "ClassroomPoll" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "openedBy" TEXT NOT NULL,

    CONSTRAINT "ClassroomPoll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassroomPoll_sessionId_openedAt_idx" ON "ClassroomPoll"("sessionId", "openedAt");

-- AddForeignKey
ALTER TABLE "ClassroomPoll" ADD CONSTRAINT "ClassroomPoll_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassroomSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ClassroomPollVote" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "optionIndex" INTEGER NOT NULL,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassroomPollVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomPollVote_pollId_userId_key" ON "ClassroomPollVote"("pollId", "userId");

-- CreateIndex
CREATE INDEX "ClassroomPollVote_pollId_idx" ON "ClassroomPollVote"("pollId");

-- AddForeignKey
ALTER TABLE "ClassroomPollVote" ADD CONSTRAINT "ClassroomPollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "ClassroomPoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
