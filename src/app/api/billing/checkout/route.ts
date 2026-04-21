import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";
import { assertMinorConsent } from "@/lib/compliance";
import { isSafeInternalPath } from "@/lib/safe-redirect";
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

// successPath/cancelPath must be strict internal paths — "//evil.com" would
// slip past a plain startsWith("/") and send Stripe off-origin after checkout.
const internalPath = z
  .string()
  .refine(isSafeInternalPath, "Must be an internal path starting with /")
  .optional();

const bodySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("course"),
    courseId: z.string().min(1),
    couponCode: couponCodeSchema,
    successPath: internalPath,
    cancelPath: internalPath,
  }),
  z.object({
    kind: z.literal("subscription"),
    planId: z.string().min(1),
    couponCode: couponCodeSchema,
    successPath: internalPath,
    cancelPath: internalPath,
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

  const consent = await assertMinorConsent(session.user.id);
  if (!consent.ok) {
    return NextResponse.json(
      {
        error:
          consent.reason === "consent_withdrawn"
            ? "A parent or guardian has withdrawn consent — please contact support."
            : consent.reason === "dob_missing"
              ? "Please add your date of birth to your profile before purchase."
              : "Parental consent is required before purchase.",
      },
      { status: 403 }
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
