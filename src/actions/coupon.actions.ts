"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { audit } from "@/lib/audit";
import { createCoupon, deactivateCoupon } from "@/services/coupon.service";
import {
  createCouponSchema,
  deactivateCouponSchema,
} from "@/validators/action.schemas";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createCouponAction(
  input: unknown
): Promise<ActionResult<{ id: string; code: string }>> {
  const session = await requireAdmin();
  const parsed = createCouponSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const coupon = await createCoupon({
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      currency: parsed.data.currency ?? null,
      scope: parsed.data.scope,
      appliesToId: parsed.data.appliesToId ?? null,
      maxRedemptions: parsed.data.maxRedemptions ?? null,
      perUserLimit: parsed.data.perUserLimit,
      minAmount: parsed.data.minAmount ?? null,
      validFrom: parsed.data.validFrom ?? null,
      validUntil: parsed.data.validUntil ?? null,
    });
    await audit({
      actorId: session.user!.id,
      action: "coupon.create",
      resource: "Coupon",
      resourceId: coupon.id,
      metadata: {
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        scope: coupon.scope,
      },
    });
    return { success: true, data: { id: coupon.id, code: coupon.code } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create coupon",
    };
  }
}

export async function deactivateCouponAction(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireAdmin();
  const parsed = deactivateCouponSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const coupon = await deactivateCoupon(parsed.data.couponId);
    await audit({
      actorId: session.user!.id,
      action: "coupon.deactivate",
      resource: "Coupon",
      resourceId: coupon.id,
      metadata: { code: coupon.code },
    });
    return { success: true, data: { id: coupon.id } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to deactivate coupon",
    };
  }
}
