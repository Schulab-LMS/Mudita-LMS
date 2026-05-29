"use server";

import { auth } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";
import { assertMinorConsent } from "@/lib/compliance";
import { assertEmailVerified } from "@/lib/auth-helpers";
import {
  createBillingPortalSession,
  createSubscriptionCheckoutSession,
} from "@/services/billing.service";
import { startSubscriptionSchema } from "@/validators/action.schemas";

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

// Individual course purchases were retired in favour of a subscription-only
// access model (Solo / Family / Custom). The action is kept so older clients
// that still POST to it get a deterministic, surface-able error instead of a
// 500 — but it never reaches Stripe and never validates input deeply.
export const INDIVIDUAL_COURSE_PURCHASE_DISABLED_ERROR =
  "Individual course purchases are not available — subscribe to Solo, Family, or Custom to access this course.";

export async function buyCourse(_input: { courseId: string; couponCode?: string }) {
  return {
    success: false as const,
    error: INDIVIDUAL_COURSE_PURCHASE_DISABLED_ERROR,
  };
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

  const emailCheck = await assertEmailVerified(session.user.id);
  if (!emailCheck.ok) return { success: false as const, error: emailCheck.error };

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
