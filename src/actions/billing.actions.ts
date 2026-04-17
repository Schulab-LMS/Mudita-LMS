"use server";

import { auth } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";
import {
  createBillingPortalSession,
  createCourseCheckoutSession,
  createSubscriptionCheckoutSession,
} from "@/services/billing.service";
import {
  buyCourseSchema,
  startSubscriptionSchema,
} from "@/validators/action.schemas";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

function guard<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  return fn()
    .then((data) => ({ success: true as const, data }))
    .catch((err: unknown) => ({
      success: false as const,
      error: err instanceof Error ? err.message : "Unexpected error",
    }));
}

export async function buyCourse(input: { courseId: string; couponCode?: string }) {
  if (!isStripeConfigured()) {
    return { success: false, error: "Billing is not configured yet" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = buyCourseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  return guard(() =>
    createCourseCheckoutSession({
      userId: session.user!.id!,
      courseId: parsed.data.courseId,
      couponCode: parsed.data.couponCode,
    })
  );
}

export async function startSubscription(input: { planId: string; couponCode?: string }) {
  if (!isStripeConfigured()) {
    return { success: false, error: "Billing is not configured yet" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = startSubscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  return guard(() =>
    createSubscriptionCheckoutSession({
      userId: session.user!.id!,
      planId: parsed.data.planId,
      couponCode: parsed.data.couponCode,
    })
  );
}

export async function openBillingPortal() {
  if (!isStripeConfigured()) {
    return { success: false, error: "Billing is not configured yet" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  return guard(() => createBillingPortalSession({ userId: session.user!.id! }));
}
