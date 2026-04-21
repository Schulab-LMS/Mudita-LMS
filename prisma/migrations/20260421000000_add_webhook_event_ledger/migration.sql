-- Idempotency ledger for webhook events. The provider's event id is the primary
-- key; inserting before processing lets a duplicate delivery short-circuit via
-- a unique-violation instead of re-running downstream effects (double enrolment,
-- double invoice, duplicate coupon redemption, etc.).

CREATE TABLE "WebhookEvent" (
  "id"          TEXT        NOT NULL,
  "provider"    TEXT        NOT NULL DEFAULT 'stripe',
  "type"        TEXT        NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WebhookEvent_provider_processedAt_idx"
  ON "WebhookEvent"("provider", "processedAt");
