import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { validateCoupon } from "@/services/coupon.service";

// Lets the checkout UI preview the discount before submitting. Returns the
// same error strings that would fire server-side during checkout, so the
// experience is consistent.
const schema = z.object({
  code: z.string().min(1),
  scope: z.enum(["COURSE", "PLAN"]),
  targetId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { valid: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const session = await auth();
  const result = await validateCoupon({
    code: parsed.data.code,
    userId: session?.user?.id ?? null,
    scope: parsed.data.scope,
    targetId: parsed.data.targetId,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
  });

  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error }, { status: 200 });
  }

  return NextResponse.json({
    valid: true,
    code: result.coupon.code,
    type: result.coupon.type,
    value: result.coupon.value,
    amountOff: result.amountOff,
  });
}
