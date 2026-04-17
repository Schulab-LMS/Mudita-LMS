import type Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe, DEFAULT_CURRENCY } from "@/lib/stripe";
import { enrollUser } from "@/services/enrollment.service";
import { EVENTS, track } from "@/lib/analytics";
import { recordRedemption, validateCoupon } from "@/services/coupon.service";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function absoluteUrl(path: string): string {
  return `${APP_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, stripeCustomerId: true },
  });
  if (!user) throw new Error("User not found");
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe().customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id },
  });
  await db.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

export type CheckoutSessionResult = {
  url: string;
  sessionId: string;
};

export async function createCourseCheckoutSession(params: {
  userId: string;
  courseId: string;
  couponCode?: string | null;
  successPath?: string;
  cancelPath?: string;
}): Promise<CheckoutSessionResult> {
  const { userId, courseId } = params;

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      slug: true,
      title: true,
      thumbnail: true,
      price: true,
      currency: true,
      isFree: true,
      status: true,
    },
  });
  if (!course) throw new Error("Course not found");
  if (course.status !== "PUBLISHED") {
    throw new Error("Course is not available for purchase");
  }
  if (course.isFree || Number(course.price) <= 0) {
    throw new Error("Course is free — enroll directly instead of buying");
  }

  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });
  if (existing) throw new Error("Already enrolled in this course");

  const customerId = await getOrCreateStripeCustomer(userId);
  const currency = (course.currency || DEFAULT_CURRENCY).toLowerCase();
  const amountMinor = Math.round(Number(course.price) * 100);

  let couponPromoId: string | null = null;
  let couponId: string | null = null;
  let couponAmountOff = 0;
  if (params.couponCode) {
    const result = await validateCoupon({
      code: params.couponCode,
      userId,
      scope: "COURSE",
      targetId: courseId,
      amount: Number(course.price),
      currency: currency.toUpperCase(),
    });
    if (!result.valid) throw new Error(result.error);
    couponPromoId = result.stripePromoId;
    couponId = result.coupon.id;
    couponAmountOff = result.amountOff;
  }

  const purchase = await db.coursePurchase.create({
    data: {
      userId,
      courseId,
      status: "PENDING",
      amount: course.price,
      currency: currency.toUpperCase(),
    },
  });

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amountMinor,
          product_data: {
            name: course.title,
            images: course.thumbnail ? [course.thumbnail] : undefined,
            metadata: { courseId: course.id },
          },
        },
      },
    ],
    discounts: couponPromoId ? [{ promotion_code: couponPromoId }] : undefined,
    success_url: absoluteUrl(
      params.successPath ?? `/courses/${course.slug}?purchase=success`
    ),
    cancel_url: absoluteUrl(
      params.cancelPath ?? `/courses/${course.slug}?purchase=cancelled`
    ),
    client_reference_id: purchase.id,
    metadata: {
      kind: "course",
      userId,
      courseId,
      purchaseId: purchase.id,
      ...(couponId
        ? { couponId, couponAmountOff: couponAmountOff.toFixed(2) }
        : {}),
    },
    payment_intent_data: {
      metadata: {
        kind: "course",
        userId,
        courseId,
        purchaseId: purchase.id,
      },
    },
  });

  await db.coursePurchase.update({
    where: { id: purchase.id },
    data: { stripeCheckoutId: session.id },
  });

  track({
    name: EVENTS.COURSE_PURCHASE_STARTED,
    userId,
    properties: {
      courseId,
      purchaseId: purchase.id,
      amount: Number(course.price),
      currency: currency.toUpperCase(),
    },
  }).catch(() => null);

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return { url: session.url, sessionId: session.id };
}

export async function createSubscriptionCheckoutSession(params: {
  userId: string;
  planId: string;
  couponCode?: string | null;
  successPath?: string;
  cancelPath?: string;
}): Promise<CheckoutSessionResult> {
  const { userId, planId } = params;

  const plan = await db.plan.findUnique({
    where: { id: planId },
    select: {
      id: true,
      tier: true,
      amount: true,
      currency: true,
      stripePriceId: true,
      trialDays: true,
      isActive: true,
    },
  });
  if (!plan) throw new Error("Plan not found");
  if (!plan.isActive) throw new Error("Plan is not active");
  if (!plan.stripePriceId) {
    throw new Error(
      "Plan has no Stripe price configured. Seed the catalog first."
    );
  }

  const activeSub = await db.subscription.findFirst({
    where: { userId, status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] } },
    select: { id: true },
  });
  if (activeSub) {
    throw new Error(
      "You already have an active subscription. Manage it in the billing portal."
    );
  }

  const customerId = await getOrCreateStripeCustomer(userId);

  let couponPromoId: string | null = null;
  let couponMeta: Record<string, string> = {};
  if (params.couponCode) {
    const result = await validateCoupon({
      code: params.couponCode,
      userId,
      scope: "PLAN",
      targetId: planId,
      amount: Number(plan.amount),
      currency: plan.currency,
    });
    if (!result.valid) throw new Error(result.error);
    couponPromoId = result.stripePromoId;
    couponMeta = {
      couponId: result.coupon.id,
      couponAmountOff: result.amountOff.toFixed(2),
    };
  }

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    discounts: couponPromoId ? [{ promotion_code: couponPromoId }] : undefined,
    success_url: absoluteUrl(params.successPath ?? "/student?billing=success"),
    cancel_url: absoluteUrl(params.cancelPath ?? "/pricing?billing=cancelled"),
    subscription_data:
      plan.trialDays > 0
        ? {
            trial_period_days: plan.trialDays,
            metadata: { userId, planId, ...couponMeta },
          }
        : { metadata: { userId, planId, ...couponMeta } },
    metadata: { kind: "subscription", userId, planId, ...couponMeta },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return { url: session.url, sessionId: session.id };
}

export async function createBillingPortalSession(params: {
  userId: string;
  returnPath?: string;
}): Promise<{ url: string }> {
  const user = await db.user.findUnique({
    where: { id: params.userId },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) {
    throw new Error("No billing history yet. Buy a course or subscribe first.");
  }

  const session = await stripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: absoluteUrl(params.returnPath ?? "/student"),
  });
  return { url: session.url };
}

// ─── Webhook handlers ────────────────────────────────────────────────────

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const kind = session.metadata?.kind;
  if (kind === "course") {
    await handleCoursePurchaseCompleted(session);
  } else if (kind === "subscription") {
    // Subscription objects are also surfaced via customer.subscription.created;
    // we rely on those handlers to create the Subscription row.
  }
}

async function handleCoursePurchaseCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const purchaseId = session.metadata?.purchaseId ?? session.client_reference_id;
  if (!purchaseId) return;

  const purchase = await db.coursePurchase.findUnique({
    where: { id: purchaseId },
  });
  if (!purchase) return;
  if (purchase.status === "PAID") return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  await db.$transaction(async (tx) => {
    await tx.coursePurchase.update({
      where: { id: purchase.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntentId ?? undefined,
      },
    });

    await tx.invoice.create({
      data: {
        userId: purchase.userId,
        coursePurchaseId: purchase.id,
        kind: "COURSE",
        status: "PAID",
        number: `INV-C-${purchase.id.slice(-8).toUpperCase()}`,
        subtotal: purchase.amount,
        total: purchase.amount,
        currency: purchase.currency,
        stripeInvoiceId:
          typeof session.invoice === "string" ? session.invoice : undefined,
        paidAt: new Date(),
      },
    });
  });

  // Enrol the learner after the transaction commits. enrollUser is idempotent.
  await enrollUser(purchase.userId, purchase.courseId);

  const couponId = session.metadata?.couponId;
  const couponAmountOff = Number(session.metadata?.couponAmountOff ?? 0);
  if (couponId && couponAmountOff > 0) {
    await recordRedemption({
      couponId,
      userId: purchase.userId,
      coursePurchaseId: purchase.id,
      amountOff: couponAmountOff,
      currency: purchase.currency,
    }).catch((err) => console.error("[coupon] redemption record failed:", err));
  }

  track({
    name: EVENTS.COURSE_PURCHASE_COMPLETED,
    userId: purchase.userId,
    properties: {
      courseId: purchase.courseId,
      purchaseId: purchase.id,
      amount: Number(purchase.amount),
      currency: purchase.currency,
    },
  }).catch(() => null);
}

export async function upsertSubscriptionFromStripe(
  sub: Stripe.Subscription
): Promise<void> {
  const userId =
    sub.metadata?.userId ??
    (await resolveUserIdFromCustomer(
      typeof sub.customer === "string" ? sub.customer : sub.customer.id
    ));
  if (!userId) return;

  const planId = await resolvePlanIdFromSubscription(sub);
  if (!planId) return;

  const mappedStatus = mapStripeSubscriptionStatus(sub.status);
  // In Stripe's 2026 API the billing period lives on the subscription items
  // rather than on the subscription root. We take the first item since all
  // items on a subscription share the same cycle.
  const primaryItem = sub.items.data[0];
  const periodStart = primaryItem?.current_period_start
    ? new Date(primaryItem.current_period_start * 1000)
    : null;
  const periodEnd = primaryItem?.current_period_end
    ? new Date(primaryItem.current_period_end * 1000)
    : null;
  const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;
  const canceledAt = sub.canceled_at ? new Date(sub.canceled_at * 1000) : null;

  const persisted = await db.subscription.upsert({
    where: { stripeSubscriptionId: sub.id },
    create: {
      userId,
      planId,
      status: mappedStatus,
      stripeSubscriptionId: sub.id,
      stripeCustomerId:
        typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt,
      trialEndsAt: trialEnd,
    },
    update: {
      planId,
      status: mappedStatus,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt,
      trialEndsAt: trialEnd,
    },
  });

  const couponId = sub.metadata?.couponId;
  const couponAmountOff = Number(sub.metadata?.couponAmountOff ?? 0);
  if (couponId && couponAmountOff > 0) {
    const already = await db.couponRedemption.findFirst({
      where: { couponId, subscriptionId: persisted.id },
      select: { id: true },
    });
    if (!already) {
      const currency = sub.items.data[0]?.price?.currency?.toUpperCase() ?? "USD";
      await recordRedemption({
        couponId,
        userId,
        subscriptionId: persisted.id,
        amountOff: couponAmountOff,
        currency,
      }).catch((err) => console.error("[coupon] redemption record failed:", err));
    }
  }
}

export async function recordSubscriptionInvoicePaid(
  invoice: Stripe.Invoice
): Promise<void> {
  // In the current API the subscription reference lives under parent
  // rather than on the Invoice root.
  const parentSub =
    invoice.parent?.type === "subscription_details"
      ? invoice.parent.subscription_details?.subscription
      : null;
  const subId =
    typeof parentSub === "string" ? parentSub : parentSub?.id ?? null;
  if (!subId) return;

  const subscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId: subId },
  });
  if (!subscription) return;

  const amount = (invoice.amount_paid ?? 0) / 100;
  const currency = (invoice.currency ?? "usd").toUpperCase();

  await db.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      userId: subscription.userId,
      subscriptionId: subscription.id,
      kind: "SUBSCRIPTION",
      status: "PAID",
      number: invoice.number ?? `INV-S-${invoice.id.slice(-8).toUpperCase()}`,
      subtotal: amount,
      total: amount,
      currency,
      stripeInvoiceId: invoice.id,
      hostedUrl: invoice.hosted_invoice_url ?? null,
      pdfUrl: invoice.invoice_pdf ?? null,
      paidAt: new Date(),
    },
    update: {
      status: "PAID",
      hostedUrl: invoice.hosted_invoice_url ?? null,
      pdfUrl: invoice.invoice_pdf ?? null,
      paidAt: new Date(),
    },
  });
}

export async function recordChargeRefunded(
  charge: Stripe.Charge
): Promise<void> {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!paymentIntentId) return;

  const purchase = await db.coursePurchase.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  });
  if (!purchase) return;

  await db.coursePurchase.update({
    where: { id: purchase.id },
    data: { status: "REFUNDED", refundedAt: new Date() },
  });
  await db.invoice.updateMany({
    where: { coursePurchaseId: purchase.id },
    data: { status: "REFUNDED" },
  });
}

function mapStripeSubscriptionStatus(
  s: Stripe.Subscription.Status
):
  | "INCOMPLETE"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID"
  | "EXPIRED" {
  switch (s) {
    case "trialing":
      return "TRIALING";
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    case "unpaid":
      return "UNPAID";
    case "incomplete":
    case "incomplete_expired":
      return "INCOMPLETE";
    default:
      return "EXPIRED";
  }
}

async function resolveUserIdFromCustomer(
  customerId: string
): Promise<string | null> {
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
  return user?.id ?? null;
}

async function resolvePlanIdFromSubscription(
  sub: Stripe.Subscription
): Promise<string | null> {
  // Prefer metadata hint, fall back to resolving by the line-item price id.
  if (sub.metadata?.planId) {
    const plan = await db.plan.findUnique({
      where: { id: sub.metadata.planId },
      select: { id: true },
    });
    if (plan) return plan.id;
  }
  const priceId = sub.items.data[0]?.price.id;
  if (!priceId) return null;
  const plan = await db.plan.findUnique({
    where: { stripePriceId: priceId },
    select: { id: true },
  });
  return plan?.id ?? null;
}
