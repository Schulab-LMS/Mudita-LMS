-- Baseline (squashed) migration. Idempotent so it is a safe no-op on an
-- already-provisioned database (e.g. the existing production DB, which was
-- bootstrapped via 'prisma db push' before migrations were tracked). On such a
-- database, mark it applied once with:
--   npx prisma migrate resolve --applied 0_init
-- On a fresh/empty database 'prisma migrate deploy' runs it to build the full schema.

-- pgvector: required before the SourceChunk.embedding vector(1024) column.
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "Role" AS ENUM ('STUDENT', 'PARENT', 'TUTOR', 'ADMIN', 'SUPER_ADMIN', 'B2B_PARTNER', 'ORG_ADMIN'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "CourseLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "SyncStatus" AS ENUM ('ACTIVE', 'REMOVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "AgeGroup" AS ENUM ('AGES_3_5', 'AGES_5_7', 'AGES_8_10', 'AGES_11_13', 'AGES_14_16', 'AGES_17_18'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "ContentStatus" AS ENUM ('SEED_NOW', 'NEEDS_REVIEW', 'OPTIONAL_ENRICHMENT', 'IMPORTED_EXISTING'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "SourceStatus" AS ENUM ('ACTIVE', 'HISTORICAL', 'OPTIONAL', 'ENRICHMENT'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "AiContentStatus" AS ENUM ('SOURCE_COLLECTED', 'AI_GENERATED', 'UNDER_REVIEW', 'REVISION_NEEDED', 'APPROVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "LessonType" AS ENUM ('VIDEO', 'TEXT', 'QUIZ', 'INTERACTIVE', 'ASSIGNMENT', 'PRESENTATION'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "PresentationFormat" AS ENUM ('MARKDOWN', 'HTML'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "ActivitySubmissionStatus" AS ENUM ('SUBMITTED', 'REVIEWED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "TutorAssignmentKind" AS ENUM ('ASSIGNMENT', 'QUIZ', 'PROJECT'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "TutorAssignmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "TutorAssignmentSubmissionStatus" AS ENUM ('SUBMITTED', 'REVIEWED', 'RETURNED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "SyncRunStatus" AS ENUM ('RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "SyncTrigger" AS ENUM ('WEBHOOK', 'MANUAL', 'CRON'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "ClassroomSessionStatus" AS ENUM ('PENDING', 'LIVE', 'ENDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "ClassroomEventType" AS ENUM ('SLIDE_SET', 'CHAT_MSG', 'HAND_RAISE', 'HAND_LOWER', 'POLL_OPEN', 'POLL_VOTE', 'REACTION', 'PERMISSION_GRANT'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "CompetitionStatus" AS ENUM ('UPCOMING', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'JUDGING', 'COMPLETED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "EventRegion" AS ENUM ('GLOBAL', 'EUROPE', 'GERMANY', 'US', 'UK'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "EventListingStatus" AS ENUM ('ACTIVE', 'OPTIONAL', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "EventRecommendationType" AS ENUM ('PREREQUISITE', 'RECOMMENDED', 'ADVANCED_PREPARATION'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "PointAction" AS ENUM ('LESSON_COMPLETED', 'QUIZ_PASSED', 'COURSE_COMPLETED', 'BADGE_EARNED', 'COMPETITION_PARTICIPATED', 'DAILY_LOGIN'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "HelpCategory" AS ENUM ('GETTING_STARTED', 'FEATURES_OVERVIEW', 'GUIDES', 'FAQ', 'TROUBLESHOOTING', 'WHATS_COMING'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "PlanInterval" AS ENUM ('MONTHLY', 'YEARLY'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "PlanTier" AS ENUM ('FREE', 'LEARNER', 'PRO', 'LIFETIME'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "SubscriptionStatus" AS ENUM ('INCOMPLETE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'EXPIRED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "CoursePurchaseStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE', 'REFUNDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "InvoiceKind" AS ENUM ('SUBSCRIPTION', 'COURSE', 'ORDER'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "ConsentType" AS ENUM ('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'PARENTAL_COPPA', 'PARENTAL_GDPR_K', 'MARKETING_EMAIL', 'MARKETING_SMS', 'COOKIES_ANALYTICS', 'COOKIES_MARKETING'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "VideoProvider" AS ENUM ('MUX', 'CLOUDFLARE_STREAM', 'VIMEO', 'YOUTUBE', 'EXTERNAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "VideoStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'ERROR'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "CouponType" AS ENUM ('PERCENT', 'FIXED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "CouponScope" AS ENUM ('ALL', 'COURSE', 'PLAN'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "DripJourney" AS ENUM ('ACTIVATION', 'PARENT_DIGEST', 'CART_ABANDONMENT', 'WIN_BACK'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateEnum
DO $mig$ BEGIN CREATE TYPE "DripStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "dateOfBirth" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "grade" TEXT,
    "school" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "interests" TEXT[],

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ParentChild" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentChild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Course" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleDe" TEXT,
    "description" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionDe" TEXT,
    "thumbnail" TEXT,
    "previewVideo" TEXT,
    "level" "CourseLevel" NOT NULL DEFAULT 'BEGINNER',
    "ageGroup" "AgeGroup" NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "finalProjectTitle" TEXT,
    "finalProjectTitleAr" TEXT,
    "finalProjectTitleDe" TEXT,
    "finalProjectDescription" TEXT,
    "finalProjectDescriptionAr" TEXT,
    "finalProjectDescriptionDe" TEXT,
    "parentSummary" TEXT,
    "parentSummaryAr" TEXT,
    "parentSummaryDe" TEXT,
    "studentSummary" TEXT,
    "studentSummaryAr" TEXT,
    "studentSummaryDe" TEXT,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "requiredPlan" "PlanTier",
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "duration" INTEGER,
    "averageRating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "managedByGit" BOOLEAN NOT NULL DEFAULT false,
    "sourcePath" TEXT,
    "sourceCommitSha" TEXT,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'ACTIVE',
    "organizationId" TEXT,
    "nextCourseId" TEXT,
    "contentStatus" "ContentStatus" NOT NULL DEFAULT 'SEED_NOW',
    "adminNotes" TEXT,
    "aiStatus" "AiContentStatus",

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CoursePrerequisite" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,

    CONSTRAINT "CoursePrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Module" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleDe" TEXT,
    "order" INTEGER NOT NULL,
    "sourcePath" TEXT,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Lesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleDe" TEXT,
    "content" TEXT,
    "contentAr" TEXT,
    "contentDe" TEXT,
    "activity" TEXT,
    "activityAr" TEXT,
    "activityDe" TEXT,
    "tutorNotes" TEXT,
    "tutorNotesAr" TEXT,
    "tutorNotesDe" TEXT,
    "presentationFormat" "PresentationFormat",
    "presentationContent" TEXT,
    "presentationContentAr" TEXT,
    "presentationContentDe" TEXT,
    "presentationConfig" JSONB,
    "resources" JSONB,
    "videoUrl" TEXT,
    "videoAssetId" TEXT,
    "thumbnail" TEXT,
    "duration" INTEGER,
    "type" "LessonType" NOT NULL DEFAULT 'VIDEO',
    "order" INTEGER NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "sourcePath" TEXT,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'ACTIVE',
    "aiStatus" "AiContentStatus",
    "aiModel" TEXT,
    "aiReviewedById" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "tutorSupportRequired" BOOLEAN NOT NULL DEFAULT false,
    "parentGuidanceRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Bundle" (
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
    "adminNotes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "BundleCourse" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BundleCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LearningPathway" (
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
    "adminNotes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPathway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PathwayStage" (
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

-- CreateTable
CREATE TABLE IF NOT EXISTS "ReferenceSource" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "relatedTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendedAgeRange" TEXT,
    "usageInSchulab" TEXT NOT NULL,
    "status" "SourceStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferenceSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CourseReferenceSource" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CourseReferenceSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "BundleReferenceSource" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BundleReferenceSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PathwayReferenceSource" (
    "id" TEXT NOT NULL,
    "pathwayId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PathwayReferenceSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LessonSourceCitation" (
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
CREATE TABLE IF NOT EXISTS "SourceChunk" (
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

-- CreateTable
CREATE TABLE IF NOT EXISTS "Quiz" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "timeLimit" INTEGER,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Question" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "textAr" TEXT,
    "textDe" TEXT,
    "type" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "points" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Answer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "textAr" TEXT,
    "textDe" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "QuizAttempt" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Enrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "lastAccess" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Certificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "bundleId" TEXT,
    "code" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ActivitySubmission" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT,
    "bundleId" TEXT,
    "studentId" TEXT NOT NULL,
    "bookingId" TEXT,
    "content" TEXT NOT NULL,
    "status" "ActivitySubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "feedback" TEXT,
    "feedbackById" TEXT,
    "feedbackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivitySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TutorAssignment" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "kind" "TutorAssignmentKind" NOT NULL DEFAULT 'ASSIGNMENT',
    "status" "TutorAssignmentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "dueAt" TIMESTAMP(3),
    "maxPoints" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TutorAssignmentSubmission" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "TutorAssignmentSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "points" INTEGER,
    "feedback" TEXT,
    "feedbackById" TEXT,
    "feedbackAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorAssignmentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LessonNote" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LessonQuestion" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LessonAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CurriculumSyncRun" (
    "id" TEXT NOT NULL,
    "commitSha" TEXT,
    "status" "SyncRunStatus" NOT NULL DEFAULT 'RUNNING',
    "trigger" "SyncTrigger" NOT NULL,
    "coursesUpserted" INTEGER NOT NULL DEFAULT 0,
    "lessonsUpserted" INTEGER NOT NULL DEFAULT 0,
    "coursesArchived" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "CurriculumSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TutorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "subjects" TEXT[],
    "languages" TEXT[],
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TutorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TutorCourseAssignment" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "assignedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorCourseAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TutorAvailability" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',

    CONSTRAINT "TutorAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "StudentAvailability" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',

    CONSTRAINT "StudentAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Booking" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "meetingUrl" TEXT,
    "meetingId" TEXT,
    "notes" TEXT,
    "rating" INTEGER,
    "review" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lessonId" TEXT,
    "organizationId" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ClassroomSession" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "livekitRoom" TEXT NOT NULL,
    "status" "ClassroomSessionStatus" NOT NULL DEFAULT 'PENDING',
    "currentSlide" JSONB,
    "recordingUrl" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassroomSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ClassroomAttendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "durationSec" INTEGER,

    CONSTRAINT "ClassroomAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ClassroomEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "ClassroomEventType" NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassroomEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ClassroomPoll" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "openedBy" TEXT NOT NULL,

    CONSTRAINT "ClassroomPoll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ClassroomPollVote" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "optionIndex" INTEGER NOT NULL,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassroomPollVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "nameDe" TEXT,
    "description" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionDe" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "images" TEXT[],
    "ageGroup" "AgeGroup" NOT NULL,
    "category" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "shipping" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "shippingAddress" JSONB,
    "stripePaymentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Competition" (
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
    "category" TEXT NOT NULL,
    "status" "CompetitionStatus" NOT NULL DEFAULT 'UPCOMING',
    "registrationStart" TIMESTAMP(3),
    "registrationEnd" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "maxParticipants" INTEGER,
    "prizes" JSONB,
    "rules" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "eventType" TEXT,
    "officialProvider" TEXT,
    "officialUrl" TEXT,
    "region" "EventRegion",
    "tracks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "seasonMonths" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "levelMin" "CourseLevel",
    "levelMax" "CourseLevel",
    "listingStatus" "EventListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "eligibilityRules" JSONB,
    "preparationPathId" TEXT,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "EventCourseRecommendation" (
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
CREATE TABLE IF NOT EXISTS "EventBundleRecommendation" (
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

-- CreateTable
CREATE TABLE IF NOT EXISTS "CompetitionRegistration" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamName" TEXT,
    "submissionUrl" TEXT,
    "score" INTEGER,
    "rank" INTEGER,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitionRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Badge" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "nameDe" TEXT,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PointTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "PointAction" NOT NULL,
    "points" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Page" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleDe" TEXT,
    "content" TEXT NOT NULL,
    "contentAr" TEXT,
    "contentDe" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "HelpArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "HelpCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "titleDe" TEXT,
    "excerpt" TEXT NOT NULL,
    "excerptAr" TEXT,
    "excerptDe" TEXT,
    "content" TEXT NOT NULL,
    "contentAr" TEXT,
    "contentDe" TEXT,
    "tags" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "HelpFeedback" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "helpful" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "HelpSearchLog" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "resultsCount" INTEGER NOT NULL DEFAULT 0,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpSearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "RolePermission" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "category" TEXT NOT NULL DEFAULT 'general',
    "label" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Plan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "interval" "PlanInterval",
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "nameDe" TEXT,
    "description" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionDe" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripePriceId" TEXT,
    "stripeProductId" TEXT,
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CoursePurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "beneficiaryUserId" TEXT,
    "courseId" TEXT NOT NULL,
    "status" "CoursePurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripeCheckoutId" TEXT,
    "stripePaymentIntentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoursePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "coursePurchaseId" TEXT,
    "orderId" TEXT,
    "kind" "InvoiceKind" NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'OPEN',
    "number" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripeInvoiceId" TEXT,
    "hostedUrl" TEXT,
    "pdfUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantedById" TEXT,
    "type" "ConsentType" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "version" TEXT NOT NULL,
    "documentUrl" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "VideoAsset" (
    "id" TEXT NOT NULL,
    "provider" "VideoProvider" NOT NULL,
    "providerId" TEXT NOT NULL,
    "playbackId" TEXT,
    "uploadUrl" TEXT,
    "thumbnail" TEXT,
    "duration" INTEGER,
    "status" "VideoStatus" NOT NULL DEFAULT 'UPLOADING',
    "hasCaptions" BOOLEAN NOT NULL DEFAULT false,
    "drmProtected" BOOLEAN NOT NULL DEFAULT false,
    "languages" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "anonymousId" TEXT,
    "name" TEXT NOT NULL,
    "properties" JSONB,
    "context" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CourseReview" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CouponType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "currency" TEXT,
    "scope" "CouponScope" NOT NULL DEFAULT 'ALL',
    "appliesToId" TEXT,
    "maxRedemptions" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "perUserLimit" INTEGER NOT NULL DEFAULT 1,
    "minAmount" DECIMAL(10,2),
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripeCouponId" TEXT,
    "stripePromoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CouponRedemption" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coursePurchaseId" TEXT,
    "subscriptionId" TEXT,
    "amountOff" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "OnboardingProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goals" TEXT[],
    "interests" TEXT[],
    "preferredSubjects" TEXT[],
    "availableHours" INTEGER,
    "experience" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DripState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journey" "DripJourney" NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 0,
    "status" "DripStatus" NOT NULL DEFAULT 'ACTIVE',
    "nextSendAt" TIMESTAMP(3),
    "lastSentAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DripState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ParentChild_parentId_idx" ON "ParentChild"("parentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ParentChild_childId_idx" ON "ParentChild"("childId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ParentChild_parentId_childId_key" ON "ParentChild"("parentId", "childId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Course_slug_idx" ON "Course"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Course_category_idx" ON "Course"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Course_ageGroup_idx" ON "Course"("ageGroup");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Course_status_idx" ON "Course"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Course_requiredPlan_idx" ON "Course"("requiredPlan");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Course_managedByGit_idx" ON "Course"("managedByGit");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Course_organizationId_idx" ON "Course"("organizationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Course_nextCourseId_idx" ON "Course"("nextCourseId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Course_contentStatus_idx" ON "Course"("contentStatus");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CoursePrerequisite_courseId_idx" ON "CoursePrerequisite"("courseId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CoursePrerequisite_prerequisiteId_idx" ON "CoursePrerequisite"("prerequisiteId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CoursePrerequisite_courseId_prerequisiteId_key" ON "CoursePrerequisite"("courseId", "prerequisiteId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Module_courseId_idx" ON "Module"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Module_courseId_sourcePath_key" ON "Module"("courseId", "sourcePath");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lesson_moduleId_idx" ON "Lesson"("moduleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lesson_videoAssetId_idx" ON "Lesson"("videoAssetId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lesson_aiStatus_idx" ON "Lesson"("aiStatus");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Lesson_moduleId_sourcePath_key" ON "Lesson"("moduleId", "sourcePath");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Bundle_slug_key" ON "Bundle"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Bundle_slug_idx" ON "Bundle"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Bundle_themeCategory_idx" ON "Bundle"("themeCategory");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Bundle_ageGroup_idx" ON "Bundle"("ageGroup");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Bundle_status_idx" ON "Bundle"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Bundle_requiredPlan_idx" ON "Bundle"("requiredPlan");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Bundle_organizationId_idx" ON "Bundle"("organizationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BundleCourse_bundleId_order_idx" ON "BundleCourse"("bundleId", "order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BundleCourse_courseId_idx" ON "BundleCourse"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BundleCourse_bundleId_courseId_key" ON "BundleCourse"("bundleId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "LearningPathway_slug_key" ON "LearningPathway"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LearningPathway_slug_idx" ON "LearningPathway"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LearningPathway_ageGroup_idx" ON "LearningPathway"("ageGroup");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LearningPathway_status_idx" ON "LearningPathway"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LearningPathway_organizationId_idx" ON "LearningPathway"("organizationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PathwayStage_pathwayId_order_idx" ON "PathwayStage"("pathwayId", "order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PathwayStage_bundleId_idx" ON "PathwayStage"("bundleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PathwayStage_courseId_idx" ON "PathwayStage"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PathwayStage_pathwayId_order_key" ON "PathwayStage"("pathwayId", "order");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ReferenceSource_key_key" ON "ReferenceSource"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ReferenceSource_key_idx" ON "ReferenceSource"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ReferenceSource_status_idx" ON "ReferenceSource"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CourseReferenceSource_courseId_order_idx" ON "CourseReferenceSource"("courseId", "order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CourseReferenceSource_sourceId_idx" ON "CourseReferenceSource"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CourseReferenceSource_courseId_sourceId_key" ON "CourseReferenceSource"("courseId", "sourceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BundleReferenceSource_bundleId_order_idx" ON "BundleReferenceSource"("bundleId", "order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BundleReferenceSource_sourceId_idx" ON "BundleReferenceSource"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BundleReferenceSource_bundleId_sourceId_key" ON "BundleReferenceSource"("bundleId", "sourceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PathwayReferenceSource_pathwayId_order_idx" ON "PathwayReferenceSource"("pathwayId", "order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PathwayReferenceSource_sourceId_idx" ON "PathwayReferenceSource"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PathwayReferenceSource_pathwayId_sourceId_key" ON "PathwayReferenceSource"("pathwayId", "sourceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LessonSourceCitation_lessonId_idx" ON "LessonSourceCitation"("lessonId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LessonSourceCitation_sourceKey_idx" ON "LessonSourceCitation"("sourceKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SourceChunk_status_idx" ON "SourceChunk"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SourceChunk_sourceId_chunkIndex_key" ON "SourceChunk"("sourceId", "chunkIndex");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Quiz_lessonId_key" ON "Quiz"("lessonId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Question_quizId_idx" ON "Question"("quizId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Answer_questionId_idx" ON "Answer"("questionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "QuizAttempt_quizId_idx" ON "QuizAttempt"("quizId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Enrollment_userId_idx" ON "Enrollment"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Enrollment_courseId_idx" ON "Enrollment"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Enrollment_userId_courseId_key" ON "Enrollment"("userId", "courseId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LessonProgress_userId_idx" ON "LessonProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "LessonProgress_userId_lessonId_key" ON "LessonProgress"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Certificate_code_key" ON "Certificate"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Certificate_code_idx" ON "Certificate"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Certificate_bundleId_idx" ON "Certificate"("bundleId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Certificate_userId_bundleId_key" ON "Certificate"("userId", "bundleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ActivitySubmission_lessonId_idx" ON "ActivitySubmission"("lessonId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ActivitySubmission_bundleId_idx" ON "ActivitySubmission"("bundleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ActivitySubmission_bookingId_idx" ON "ActivitySubmission"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ActivitySubmission_studentId_lessonId_key" ON "ActivitySubmission"("studentId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ActivitySubmission_studentId_bundleId_key" ON "ActivitySubmission"("studentId", "bundleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TutorAssignment_tutorId_status_idx" ON "TutorAssignment"("tutorId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TutorAssignment_studentId_status_idx" ON "TutorAssignment"("studentId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TutorAssignment_courseId_idx" ON "TutorAssignment"("courseId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TutorAssignment_dueAt_idx" ON "TutorAssignment"("dueAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TutorAssignmentSubmission_studentId_status_idx" ON "TutorAssignmentSubmission"("studentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TutorAssignmentSubmission_assignmentId_studentId_key" ON "TutorAssignmentSubmission"("assignmentId", "studentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LessonNote_lessonId_idx" ON "LessonNote"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "LessonNote_userId_lessonId_key" ON "LessonNote"("userId", "lessonId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LessonQuestion_lessonId_createdAt_idx" ON "LessonQuestion"("lessonId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LessonQuestion_authorId_idx" ON "LessonQuestion"("authorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LessonAnswer_questionId_createdAt_idx" ON "LessonAnswer"("questionId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LessonAnswer_authorId_idx" ON "LessonAnswer"("authorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CurriculumSyncRun_startedAt_idx" ON "CurriculumSyncRun"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TutorProfile_userId_key" ON "TutorProfile"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TutorCourseAssignment_courseId_idx" ON "TutorCourseAssignment"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TutorCourseAssignment_tutorId_courseId_key" ON "TutorCourseAssignment"("tutorId", "courseId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TutorAvailability_tutorId_idx" ON "TutorAvailability"("tutorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StudentAvailability_userId_idx" ON "StudentAvailability"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_studentId_idx" ON "Booking"("studentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_tutorId_idx" ON "Booking"("tutorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_startTime_idx" ON "Booking"("startTime");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_lessonId_idx" ON "Booking"("lessonId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_organizationId_idx" ON "Booking"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ClassroomSession_bookingId_key" ON "ClassroomSession"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ClassroomSession_livekitRoom_key" ON "ClassroomSession"("livekitRoom");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ClassroomSession_status_idx" ON "ClassroomSession"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ClassroomAttendance_sessionId_idx" ON "ClassroomAttendance"("sessionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ClassroomAttendance_userId_idx" ON "ClassroomAttendance"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ClassroomEvent_sessionId_createdAt_idx" ON "ClassroomEvent"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ClassroomEvent_sessionId_type_idx" ON "ClassroomEvent"("sessionId", "type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ClassroomPoll_sessionId_openedAt_idx" ON "ClassroomPoll"("sessionId", "openedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ClassroomPollVote_pollId_idx" ON "ClassroomPollVote"("pollId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ClassroomPollVote_pollId_userId_key" ON "ClassroomPollVote"("pollId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_orderNumber_idx" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Competition_slug_key" ON "Competition"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Competition_slug_idx" ON "Competition"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Competition_status_idx" ON "Competition"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Competition_isExternal_listingStatus_idx" ON "Competition"("isExternal", "listingStatus");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EventCourseRecommendation_courseId_idx" ON "EventCourseRecommendation"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EventCourseRecommendation_competitionId_courseId_key" ON "EventCourseRecommendation"("competitionId", "courseId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EventBundleRecommendation_bundleId_idx" ON "EventBundleRecommendation"("bundleId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EventBundleRecommendation_competitionId_bundleId_key" ON "EventBundleRecommendation"("competitionId", "bundleId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CompetitionRegistration_competitionId_userId_key" ON "CompetitionRegistration"("competitionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Badge_slug_key" ON "Badge"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserBadge_userId_idx" ON "UserBadge"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PointTransaction_userId_idx" ON "PointTransaction"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Message_receiverId_isRead_idx" ON "Message"("receiverId", "isRead");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Page_slug_idx" ON "Page"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "HelpArticle_slug_key" ON "HelpArticle"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HelpArticle_slug_idx" ON "HelpArticle"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HelpArticle_category_idx" ON "HelpArticle"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HelpArticle_isPublished_idx" ON "HelpArticle"("isPublished");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HelpFeedback_articleId_idx" ON "HelpFeedback"("articleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HelpSearchLog_query_idx" ON "HelpSearchLog"("query");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HelpSearchLog_locale_idx" ON "HelpSearchLog"("locale");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Permission_resource_idx" ON "Permission"("resource");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Permission_resource_action_key" ON "Permission"("resource", "action");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RolePermission_role_idx" ON "RolePermission"("role");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "RolePermission_role_permissionId_key" ON "RolePermission"("role", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SystemSetting_category_idx" ON "SystemSetting"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SystemSetting_key_idx" ON "SystemSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Plan_slug_key" ON "Plan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Plan_stripePriceId_key" ON "Plan"("stripePriceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Plan_tier_idx" ON "Plan"("tier");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Plan_isActive_idx" ON "Plan"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CoursePurchase_stripeCheckoutId_key" ON "CoursePurchase"("stripeCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CoursePurchase_stripePaymentIntentId_key" ON "CoursePurchase"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CoursePurchase_userId_idx" ON "CoursePurchase"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CoursePurchase_beneficiaryUserId_idx" ON "CoursePurchase"("beneficiaryUserId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CoursePurchase_courseId_idx" ON "CoursePurchase"("courseId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CoursePurchase_status_idx" ON "CoursePurchase"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CoursePurchase_userId_courseId_beneficiaryUserId_status_key" ON "CoursePurchase"("userId", "courseId", "beneficiaryUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_coursePurchaseId_key" ON "Invoice"("coursePurchaseId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_orderId_key" ON "Invoice"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_number_key" ON "Invoice"("number");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_stripeInvoiceId_key" ON "Invoice"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Invoice_userId_idx" ON "Invoice"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Invoice_subscriptionId_idx" ON "Invoice"("subscriptionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ConsentRecord_userId_type_idx" ON "ConsentRecord"("userId", "type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ConsentRecord_type_idx" ON "ConsentRecord"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VideoAsset_status_idx" ON "VideoAsset"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "VideoAsset_provider_providerId_key" ON "VideoAsset"("provider", "providerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_name_idx" ON "AnalyticsEvent"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_occurredAt_idx" ON "AnalyticsEvent"("occurredAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CourseReview_courseId_status_idx" ON "CourseReview"("courseId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CourseReview_userId_idx" ON "CourseReview"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CourseReview_courseId_userId_key" ON "CourseReview"("courseId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_stripeCouponId_key" ON "Coupon"("stripeCouponId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_stripePromoId_key" ON "Coupon"("stripePromoId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Coupon_code_idx" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Coupon_isActive_idx" ON "Coupon"("isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CouponRedemption_couponId_idx" ON "CouponRedemption"("couponId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CouponRedemption_userId_idx" ON "CouponRedemption"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CouponRedemption_couponId_coursePurchaseId_key" ON "CouponRedemption"("couponId", "coursePurchaseId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CouponRedemption_couponId_subscriptionId_key" ON "CouponRedemption"("couponId", "subscriptionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_resource_resourceId_idx" ON "AuditLog"("resource", "resourceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "OnboardingProfile_userId_key" ON "OnboardingProfile"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DripState_journey_status_nextSendAt_idx" ON "DripState"("journey", "status", "nextSendAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DripState_userId_journey_key" ON "DripState"("userId", "journey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WebhookEvent_provider_processedAt_idx" ON "WebhookEvent"("provider", "processedAt");

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "ParentChild" ADD CONSTRAINT "ParentChild_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "ParentChild" ADD CONSTRAINT "ParentChild_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Course" ADD CONSTRAINT "Course_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Course" ADD CONSTRAINT "Course_nextCourseId_fkey" FOREIGN KEY ("nextCourseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Bundle" ADD CONSTRAINT "Bundle_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "BundleCourse" ADD CONSTRAINT "BundleCourse_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "BundleCourse" ADD CONSTRAINT "BundleCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "LearningPathway" ADD CONSTRAINT "LearningPathway_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "PathwayStage" ADD CONSTRAINT "PathwayStage_pathwayId_fkey" FOREIGN KEY ("pathwayId") REFERENCES "LearningPathway"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "PathwayStage" ADD CONSTRAINT "PathwayStage_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "PathwayStage" ADD CONSTRAINT "PathwayStage_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "CourseReferenceSource" ADD CONSTRAINT "CourseReferenceSource_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "CourseReferenceSource" ADD CONSTRAINT "CourseReferenceSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ReferenceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "BundleReferenceSource" ADD CONSTRAINT "BundleReferenceSource_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "BundleReferenceSource" ADD CONSTRAINT "BundleReferenceSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ReferenceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "PathwayReferenceSource" ADD CONSTRAINT "PathwayReferenceSource_pathwayId_fkey" FOREIGN KEY ("pathwayId") REFERENCES "LearningPathway"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "PathwayReferenceSource" ADD CONSTRAINT "PathwayReferenceSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ReferenceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "LessonSourceCitation" ADD CONSTRAINT "LessonSourceCitation_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "SourceChunk" ADD CONSTRAINT "SourceChunk_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ReferenceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "TutorAssignment" ADD CONSTRAINT "TutorAssignment_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "TutorAssignment" ADD CONSTRAINT "TutorAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "TutorAssignment" ADD CONSTRAINT "TutorAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "TutorAssignment" ADD CONSTRAINT "TutorAssignment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "TutorAssignmentSubmission" ADD CONSTRAINT "TutorAssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "TutorAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "TutorAssignmentSubmission" ADD CONSTRAINT "TutorAssignmentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "LessonNote" ADD CONSTRAINT "LessonNote_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "LessonNote" ADD CONSTRAINT "LessonNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "LessonQuestion" ADD CONSTRAINT "LessonQuestion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "LessonQuestion" ADD CONSTRAINT "LessonQuestion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "LessonAnswer" ADD CONSTRAINT "LessonAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "LessonQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "LessonAnswer" ADD CONSTRAINT "LessonAnswer_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "TutorProfile" ADD CONSTRAINT "TutorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "TutorCourseAssignment" ADD CONSTRAINT "TutorCourseAssignment_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "TutorCourseAssignment" ADD CONSTRAINT "TutorCourseAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "TutorAvailability" ADD CONSTRAINT "TutorAvailability_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "StudentAvailability" ADD CONSTRAINT "StudentAvailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Booking" ADD CONSTRAINT "Booking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "TutorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Booking" ADD CONSTRAINT "Booking_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Booking" ADD CONSTRAINT "Booking_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "ClassroomSession" ADD CONSTRAINT "ClassroomSession_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "ClassroomAttendance" ADD CONSTRAINT "ClassroomAttendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassroomSession"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "ClassroomEvent" ADD CONSTRAINT "ClassroomEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassroomSession"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "ClassroomPoll" ADD CONSTRAINT "ClassroomPoll_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassroomSession"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "ClassroomPollVote" ADD CONSTRAINT "ClassroomPollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "ClassroomPoll"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Competition" ADD CONSTRAINT "Competition_preparationPathId_fkey" FOREIGN KEY ("preparationPathId") REFERENCES "LearningPathway"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "EventCourseRecommendation" ADD CONSTRAINT "EventCourseRecommendation_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "EventCourseRecommendation" ADD CONSTRAINT "EventCourseRecommendation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "EventBundleRecommendation" ADD CONSTRAINT "EventBundleRecommendation_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "EventBundleRecommendation" ADD CONSTRAINT "EventBundleRecommendation_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "CompetitionRegistration" ADD CONSTRAINT "CompetitionRegistration_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "CompetitionRegistration" ADD CONSTRAINT "CompetitionRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "HelpFeedback" ADD CONSTRAINT "HelpFeedback_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "HelpArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "CoursePurchase" ADD CONSTRAINT "CoursePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "CoursePurchase" ADD CONSTRAINT "CoursePurchase_beneficiaryUserId_fkey" FOREIGN KEY ("beneficiaryUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_coursePurchaseId_fkey" FOREIGN KEY ("coursePurchaseId") REFERENCES "CoursePurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "OnboardingProfile" ADD CONSTRAINT "OnboardingProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;

-- AddForeignKey
DO $mig$ BEGIN ALTER TABLE "DripState" ADD CONSTRAINT "DripState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;



-- HNSW index for cosine similarity over SourceChunk.embedding (pgvector).
CREATE INDEX IF NOT EXISTS "SourceChunk_embedding_idx" ON "SourceChunk" USING hnsw ("embedding" vector_cosine_ops);

-- CHECK constraints (committed raw SQL — Prisma schema cannot express these).
DO $mig$ BEGIN ALTER TABLE "PathwayStage" ADD CONSTRAINT "pathway_stage_target_xor" CHECK ((("bundleId" IS NOT NULL)::int + ("courseId" IS NOT NULL)::int) = 1); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;
DO $mig$ BEGIN ALTER TABLE "Certificate" ADD CONSTRAINT "certificate_subject_xor" CHECK ((("courseId" IS NOT NULL)::int + ("bundleId" IS NOT NULL)::int) = 1); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;
DO $mig$ BEGIN ALTER TABLE "CoursePrerequisite" ADD CONSTRAINT "course_prerequisite_not_self" CHECK ("courseId" <> "prerequisiteId"); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;
DO $mig$ BEGIN ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "activity_submission_target_xor" CHECK ((("lessonId" IS NOT NULL)::int + ("bundleId" IS NOT NULL)::int) = 1); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;
DO $mig$ BEGIN ALTER TABLE "TutorAssignment" ADD CONSTRAINT "TutorAssignment_maxPoints_check" CHECK ("maxPoints" > 0); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;
DO $mig$ BEGIN ALTER TABLE "TutorAssignmentSubmission" ADD CONSTRAINT "TutorAssignmentSubmission_points_check" CHECK ("points" IS NULL OR "points" >= 0); EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;
