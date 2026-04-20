import { db } from "@/lib/db";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import type { CouponScope, CouponType } from "@/generated/prisma/client";

// Coupons are stored locally and mirrored to Stripe when billing is
// configured so the Checkout Session can honour them natively. Local
// validation covers usage-limit + date windows before we hand off to
// Stripe — cheaper than round-tripping every expired coupon.

export type CreateCouponInput = {
  code: string;
  type: CouponType;
  value: number;
  currency?: string | null;
  scope?: CouponScope;
  appliesToId?: string | null;
  maxRedemptions?: number | null;
  perUserLimit?: number;
  minAmount?: number | null;
  validFrom?: Date | null;
  validUntil?: Date | null;
};

export async function createCoupon(input: CreateCouponInput) {
  const code = input.code.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    throw new Error("Coupon code must be 3-32 chars (A-Z, 0-9, -, _)");
  }

  const existing = await db.coupon.findUnique({ where: { code } });
  if (existing) throw new Error("Coupon code already exists");

  if (input.type === "PERCENT" && (input.value <= 0 || input.value > 100)) {
    throw new Error("Percent coupons must be between 1 and 100");
  }
  if (input.type === "FIXED" && input.value <= 0) {
    throw new Error("Fixed coupons must have a positive value");
  }

  let stripeCouponId: string | null = null;
  let stripePromoId: string | null = null;
  if (isStripeConfigured()) {
    try {
      const stripeCoupon = await stripe().coupons.create(
        input.type === "PERCENT"
          ? { percent_off: input.value, duration: "once", name: code }
          : {
              amount_off: Math.round(input.value * 100),
              currency: (input.currency ?? "USD").toLowerCase(),
              duration: "once",
              name: code,
            }
      );
      stripeCouponId = stripeCoupon.id;
      const promo = await stripe().promotionCodes.create({
        promotion: { type: "coupon", coupon: stripeCoupon.id },
        code,
        max_redemptions: input.maxRedemptions ?? undefined,
        expires_at: input.validUntil
          ? Math.floor(input.validUntil.getTime() / 1000)
          : undefined,
      });
      stripePromoId = promo.id;
    } catch (err) {
      console.error("[coupon] stripe mirror failed:", err);
    }
  }

  return db.coupon.create({
    data: {
      code,
      type: input.type,
      value: input.value,
      currency: input.currency ?? null,
      scope: input.scope ?? "ALL",
      appliesToId: input.appliesToId ?? null,
      maxRedemptions: input.maxRedemptions ?? null,
      perUserLimit: input.perUserLimit ?? 1,
      minAmount: input.minAmount ?? null,
      validFrom: input.validFrom ?? null,
      validUntil: input.validUntil ?? null,
      stripeCouponId,
      stripePromoId,
    },
  });
}

export async function deactivateCoupon(couponId: string) {
  return db.coupon.update({
    where: { id: couponId },
    data: { isActive: false },
  });
}

export type ValidateInput = {
  code: string;
  userId?: string | null;
  scope: "COURSE" | "PLAN";
  targetId: string;
  amount: number;
  currency: string;
};

export type ValidationResult =
  | {
      valid: true;
      coupon: { id: string; code: string; type: CouponType; value: number };
      amountOff: number;
      promoCode: string;
      stripePromoId: string | null;
    }
  | { valid: false; error: string };

export async function validateCoupon(input: ValidateInput): Promise<ValidationResult> {
  const code = input.code.trim().toUpperCase();
  const coupon = await db.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.isActive) {
    return { valid: false, error: "Invalid coupon" };
  }

  const now = new Date();
  if (coupon.validFrom && coupon.validFrom > now) {
    return { valid: false, error: "Coupon is not yet active" };
  }
  if (coupon.validUntil && coupon.validUntil < now) {
    return { valid: false, error: "Coupon has expired" };
  }
  if (coupon.maxRedemptions != null && coupon.usedCount >= coupon.maxRedemptions) {
    return { valid: false, error: "Coupon has been fully redeemed" };
  }
  if (coupon.scope !== "ALL") {
    const expectedScope = input.scope === "COURSE" ? "COURSE" : "PLAN";
    if (coupon.scope !== expectedScope) {
      return { valid: false, error: "Coupon does not apply to this purchase" };
    }
    if (coupon.appliesToId && coupon.appliesToId !== input.targetId) {
      return { valid: false, error: "Coupon does not apply to this item" };
    }
  }
  if (coupon.minAmount != null && input.amount < Number(coupon.minAmount)) {
    return { valid: false, error: "Minimum purchase amount not met" };
  }
  if (coupon.currency && coupon.currency.toUpperCase() !== input.currency.toUpperCase()) {
    return { valid: false, error: "Coupon currency does not match" };
  }

  if (input.userId && coupon.perUserLimit > 0) {
    const userUsed = await db.couponRedemption.count({
      where: { couponId: coupon.id, userId: input.userId },
    });
    if (userUsed >= coupon.perUserLimit) {
      return { valid: false, error: "You've already used this coupon" };
    }
  }

  const amountOff =
    coupon.type === "PERCENT"
      ? (input.amount * Number(coupon.value)) / 100
      : Math.min(Number(coupon.value), input.amount);

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
    },
    amountOff: Number(amountOff.toFixed(2)),
    promoCode: coupon.code,
    stripePromoId: coupon.stripePromoId,
  };
}

export async function recordRedemption(params: {
  couponId: string;
  userId: string;
  coursePurchaseId?: string | null;
  subscriptionId?: string | null;
  amountOff: number;
  currency: string;
}) {
  // Idempotent by (coupon, purchase|subscription) — Stripe retries webhooks
  // so we must not double-count usage if the handler runs twice. If either
  // target id is present and a redemption row already exists we bail out
  // before incrementing `usedCount`.
  const existing = await db.couponRedemption.findFirst({
    where: {
      couponId: params.couponId,
      ...(params.coursePurchaseId
        ? { coursePurchaseId: params.coursePurchaseId }
        : params.subscriptionId
          ? { subscriptionId: params.subscriptionId }
          : {}),
    },
    select: { id: true },
  });
  if (existing) return;

  await db.$transaction(async (tx) => {
    try {
      await tx.couponRedemption.create({
        data: {
          couponId: params.couponId,
          userId: params.userId,
          coursePurchaseId: params.coursePurchaseId ?? null,
          subscriptionId: params.subscriptionId ?? null,
          amountOff: params.amountOff,
          currency: params.currency,
        },
      });
    } catch (err) {
      // P2002 = unique constraint violation (the partial unique index on
      // CouponRedemption). Safe to ignore — another concurrent webhook won
      // the race and already recorded the redemption.
      const code = (err as { code?: string } | null)?.code;
      if (code === "P2002") return;
      throw err;
    }
    await tx.coupon.update({
      where: { id: params.couponId },
      data: { usedCount: { increment: 1 } },
    });
  });
}
