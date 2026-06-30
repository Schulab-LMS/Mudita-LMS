-- AI-assisted curriculum production: provenance + RAG knowledge base.
-- See docs/curriculum-production. Additive only; safe to apply on top of
-- the current schema. pgvector is required for SourceChunk.embedding.

-- pgvector extension (must exist before the vector(1024) column is created).
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "AiContentStatus" AS ENUM ('SOURCE_COLLECTED', 'AI_GENERATED', 'UNDER_REVIEW', 'REVISION_NEEDED', 'APPROVED');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "aiStatus" "AiContentStatus";

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "aiModel" TEXT,
ADD COLUMN     "aiReviewedById" TEXT,
ADD COLUMN     "aiStatus" "AiContentStatus",
ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "parentGuidanceRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tutorSupportRequired" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "LessonSourceCitation" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "sourceKey" TEXT,
    "sourceUrl" TEXT,
    "extractedNotes" TEXT,
    "confidence" DOUBLE PRECISION,
    "reviewStatus" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonSourceCitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceChunk" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "url" TEXT,
    "license" TEXT,
    "ageRange" TEXT,
    "status" "SourceStatus" NOT NULL DEFAULT 'ACTIVE',
    "tokenCount" INTEGER,
    "embedding" vector(1024),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonSourceCitation_lessonId_idx" ON "LessonSourceCitation"("lessonId");

-- CreateIndex
CREATE INDEX "LessonSourceCitation_sourceKey_idx" ON "LessonSourceCitation"("sourceKey");

-- CreateIndex
CREATE INDEX "SourceChunk_status_idx" ON "SourceChunk"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SourceChunk_sourceId_chunkIndex_key" ON "SourceChunk"("sourceId", "chunkIndex");

-- CreateIndex
CREATE INDEX "Lesson_aiStatus_idx" ON "Lesson"("aiStatus");

-- AddForeignKey
ALTER TABLE "LessonSourceCitation" ADD CONSTRAINT "LessonSourceCitation_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceChunk" ADD CONSTRAINT "SourceChunk_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ReferenceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Approximate-nearest-neighbour index for cosine RAG retrieval over
-- SourceChunk.embedding. HNSW gives fast top-k recall; built empty here.
CREATE INDEX "SourceChunk_embedding_idx" ON "SourceChunk" USING hnsw ("embedding" vector_cosine_ops);
