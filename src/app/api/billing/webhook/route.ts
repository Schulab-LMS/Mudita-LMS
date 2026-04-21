import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import {
  STRIPE_WEBHOOK_SECRET,
  isStripeConfigured,
  stripe,
} from "@/lib/stripe";
import {
  handleCheckoutCompleted,
  recordChargeRefunded,
  recordSubscriptionInvoicePaid,
  upsertSubscriptionFromStripe,
} from "@/services/billing.service";

// Prisma's unique-constraint error code. When WebhookEvent.id collides the
// event has already been processed — Stripe is redelivering a handled event.
const PRISMA_UNIQUE_VIOLATION = "P2002";

// Webhook handlers must receive the raw body to validate Stripe's signature,
// so caching and static optimisation are both disabled here.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeConfigured() || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Billing webhook not configured" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[billing/webhook] invalid signature:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Idempotency: claim the event id before doing any work. Unique-violation
  // on the PK means this delivery is a retry of one we've already processed —
  // ack with 200 so Stripe stops retrying, without re-running handlers.
  try {
    await db.webhookEvent.create({
      data: { id: event.id, provider: "stripe", type: event.type },
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === PRISMA_UNIQUE_VIOLATION
    ) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error(`[billing/webhook] dedupe insert failed for ${event.id}:`, err);
    return NextResponse.json(
      { error: "Webhook dedupe failed" },
      { status: 500 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await upsertSubscriptionFromStripe(event.data.object);
        break;
      case "invoice.paid":
      case "invoice.payment_succeeded":
        await recordSubscriptionInvoicePaid(event.data.object);
        break;
      case "charge.refunded":
        await recordChargeRefunded(event.data.object);
        break;
      default:
        // Unhandled events are acknowledged so Stripe doesn't retry them.
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[billing/webhook] handler error for ${event.type}:`, err);
    // Release the idempotency claim so Stripe's retry can try again — the
    // handler didn't actually run to completion.
    await db.webhookEvent
      .delete({ where: { id: event.id } })
      .catch(() => null);
    // 500 triggers Stripe's retry policy, giving us a second chance if a
    // dependency (e.g. DB) was briefly unavailable.
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
