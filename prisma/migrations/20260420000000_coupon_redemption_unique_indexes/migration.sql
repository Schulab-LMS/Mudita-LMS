-- Enforce single-redemption-per-purchase / single-redemption-per-subscription so
-- Stripe webhook retries (or concurrent handlers) cannot double-increment a coupon's
-- usedCount. Postgres treats NULL values as distinct in a unique index, so rows
-- where the "other" target is NULL do not collide with each other -- giving us
-- partial-unique semantics without needing a WHERE clause.

-- Pre-clean any accidental duplicates that pre-date this constraint. Keeps the
-- earliest redemption for each (couponId, parent) pair.
DELETE FROM "CouponRedemption" a
USING "CouponRedemption" b
WHERE a."coursePurchaseId" IS NOT NULL
  AND a."couponId" = b."couponId"
  AND a."coursePurchaseId" = b."coursePurchaseId"
  AND a."redeemedAt" > b."redeemedAt";

DELETE FROM "CouponRedemption" a
USING "CouponRedemption" b
WHERE a."subscriptionId" IS NOT NULL
  AND a."couponId" = b."couponId"
  AND a."subscriptionId" = b."subscriptionId"
  AND a."redeemedAt" > b."redeemedAt";

CREATE UNIQUE INDEX "CouponRedemption_couponId_coursePurchaseId_key"
  ON "CouponRedemption"("couponId", "coursePurchaseId");

CREATE UNIQUE INDEX "CouponRedemption_couponId_subscriptionId_key"
  ON "CouponRedemption"("couponId", "subscriptionId");
