"use server";

import { auth } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";
import { assertMinorConsent } from "@/lib/compliance";
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

// Mirror the /api/billing/checkout route: minors with missing or withdrawn
// parental consent must never reach Stripe, regardless of which entry point
// the client used.
async function guardMinorConsent(userId: string) {
  const consent = await assertMinorConsent(userId);
  if (consent.ok) return null;
  return {
    success: false as const,
    error:
      consent.reason === "consent_withdrawn"
        ? "A parent or guardian has withdrawn consent — please contact support"
        : consent.reason === "dob_missing"
          ? "Please add your date of birth to your profile before purchase"
          : "Parental consent is required before purchase",
  };
}

export async function buyCourse(input: { courseId: string; couponCode?: string }) {
  if (!isStripeConfigured()) {
    return { success: false as const, error: "Billing is not configured yet" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  const parsed = buyCourseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const consentFail = await guardMinorConsent(session.user.id);
  if (consentFail) return consentFail;

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
    return { success: false as const, error: "Billing is not configured yet" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  const parsed = startSubscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const consentFail = await guardMinorConsent(session.user.id);
  if (consentFail) return consentFail;

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
    return { success: false as const, error: "Billing is not configured yet" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  return guard(() => createBillingPortalSession({ userId: session.user!.id! }));
}
