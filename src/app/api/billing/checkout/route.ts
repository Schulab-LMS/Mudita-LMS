import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";
import {
  createCourseCheckoutSession,
  createSubscriptionCheckoutSession,
} from "@/services/billing.service";

export const dynamic = "force-dynamic";

const couponCodeSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[A-Za-z0-9_-]+$/)
  .optional();

const bodySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("course"),
    courseId: z.string().min(1),
    couponCode: couponCodeSchema,
    successPath: z.string().startsWith("/").optional(),
    cancelPath: z.string().startsWith("/").optional(),
  }),
  z.object({
    kind: z.literal("subscription"),
    planId: z.string().min(1),
    couponCode: couponCodeSchema,
    successPath: z.string().startsWith("/").optional(),
    cancelPath: z.string().startsWith("/").optional(),
  }),
]);

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Billing is not configured on this environment." },
      { status: 503 }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  try {
    const result =
      parsed.data.kind === "course"
        ? await createCourseCheckoutSession({
            userId: session.user.id,
            courseId: parsed.data.courseId,
            couponCode: parsed.data.couponCode,
            successPath: parsed.data.successPath,
            cancelPath: parsed.data.cancelPath,
          })
        : await createSubscriptionCheckoutSession({
            userId: session.user.id,
            planId: parsed.data.planId,
            couponCode: parsed.data.couponCode,
            successPath: parsed.data.successPath,
            cancelPath: parsed.data.cancelPath,
          });

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not create checkout";
    console.error("[billing/checkout] error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
