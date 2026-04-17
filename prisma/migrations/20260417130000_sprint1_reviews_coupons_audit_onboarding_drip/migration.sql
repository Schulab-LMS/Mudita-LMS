-- Sprint 1: reviews, coupons, audit log, onboarding, lifecycle drip.

-- ========== ENUMS ==========

CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "CouponType" AS ENUM ('PERCENT', 'FIXED');
CREATE TYPE "CouponScope" AS ENUM ('ALL', 'COURSE', 'PLAN');
CREATE TYPE "DripJourney" AS ENUM ('ACTIVATION', 'PARENT_DIGEST', 'CART_ABANDONMENT', 'WIN_BACK');
CREATE TYPE "DripStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- ========== COURSE: DENORMALISED RATING FIELDS ==========

ALTER TABLE "Course"
  ADD COLUMN "averageRating" DECIMAL(3, 2) NOT NULL DEFAULT 0,
  ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- ========== COURSE REVIEWS ==========

CREATE TABLE "CourseReview" (
  "id"           TEXT PRIMARY KEY,
  "courseId"     TEXT NOT NULL,
  "userId"       TEXT NOT NULL,
  "rating"       INTEGER NOT NULL,
  "title"        TEXT,
  "body"         TEXT,
  "status"       "ReviewStatus" NOT NULL DEFAULT 'PENDING',
  "helpfulCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "CourseReview_courseId_userId_key" ON "CourseReview"("courseId", "userId");
CREATE INDEX "CourseReview_courseId_status_idx" ON "CourseReview"("courseId", "status");
CREATE INDEX "CourseReview_userId_idx" ON "CourseReview"("userId");

ALTER TABLE "CourseReview"
  ADD CONSTRAINT "CourseReview_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseReview"
  ADD CONSTRAINT "CourseReview_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========== COUPONS ==========

CREATE TABLE "Coupon" (
  "id"             TEXT PRIMARY KEY,
  "code"           TEXT NOT NULL,
  "type"           "CouponType" NOT NULL,
  "value"          DECIMAL(10, 2) NOT NULL,
  "currency"       TEXT,
  "scope"          "CouponScope" NOT NULL DEFAULT 'ALL',
  "appliesToId"    TEXT,
  "maxRedemptions" INTEGER,
  "usedCount"      INTEGER NOT NULL DEFAULT 0,
  "perUserLimit"   INTEGER NOT NULL DEFAULT 1,
  "minAmount"      DECIMAL(10, 2),
  "validFrom"      TIMESTAMP(3),
  "validUntil"     TIMESTAMP(3),
  "isActive"       BOOLEAN NOT NULL DEFAULT true,
  "stripeCouponId" TEXT,
  "stripePromoId"  TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
CREATE UNIQUE INDEX "Coupon_stripeCouponId_key" ON "Coupon"("stripeCouponId");
CREATE UNIQUE INDEX "Coupon_stripePromoId_key" ON "Coupon"("stripePromoId");
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");
CREATE INDEX "Coupon_isActive_idx" ON "Coupon"("isActive");

CREATE TABLE "CouponRedemption" (
  "id"               TEXT PRIMARY KEY,
  "couponId"         TEXT NOT NULL,
  "userId"           TEXT NOT NULL,
  "coursePurchaseId" TEXT,
  "subscriptionId"   TEXT,
  "amountOff"        DECIMAL(10, 2) NOT NULL,
  "currency"         TEXT NOT NULL DEFAULT 'USD',
  "redeemedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "CouponRedemption_couponId_idx" ON "CouponRedemption"("couponId");
CREATE INDEX "CouponRedemption_userId_idx" ON "CouponRedemption"("userId");

ALTER TABLE "CouponRedemption"
  ADD CONSTRAINT "CouponRedemption_couponId_fkey"
  FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CouponRedemption"
  ADD CONSTRAINT "CouponRedemption_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========== AUDIT LOG ==========

CREATE TABLE "AuditLog" (
  "id"         TEXT PRIMARY KEY,
  "actorId"    TEXT,
  "action"     TEXT NOT NULL,
  "resource"   TEXT NOT NULL,
  "resourceId" TEXT,
  "metadata"   JSONB,
  "ipAddress"  TEXT,
  "userAgent"  TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_resource_resourceId_idx" ON "AuditLog"("resource", "resourceId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ========== ONBOARDING ==========

CREATE TABLE "OnboardingProfile" (
  "id"                TEXT PRIMARY KEY,
  "userId"            TEXT NOT NULL,
  "goals"             TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "interests"         TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "preferredSubjects" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "availableHours"    INTEGER,
  "experience"        TEXT,
  "completedAt"       TIMESTAMP(3),
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "OnboardingProfile_userId_key" ON "OnboardingProfile"("userId");

ALTER TABLE "OnboardingProfile"
  ADD CONSTRAINT "OnboardingProfile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========== LIFECYCLE DRIP ==========

CREATE TABLE "DripState" (
  "id"         TEXT PRIMARY KEY,
  "userId"     TEXT NOT NULL,
  "journey"    "DripJourney" NOT NULL,
  "step"       INTEGER NOT NULL DEFAULT 0,
  "status"     "DripStatus" NOT NULL DEFAULT 'ACTIVE',
  "nextSendAt" TIMESTAMP(3),
  "lastSentAt" TIMESTAMP(3),
  "metadata"   JSONB,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "DripState_userId_journey_key" ON "DripState"("userId", "journey");
CREATE INDEX "DripState_journey_status_nextSendAt_idx" ON "DripState"("journey", "status", "nextSendAt");

ALTER TABLE "DripState"
  ADD CONSTRAINT "DripState_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
