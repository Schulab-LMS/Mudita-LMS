import { NextResponse } from "next/server";
import type Stripe from "stripe";
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
    // 500 triggers Stripe's retry policy, giving us a second chance if a
    // dependency (e.g. DB) was briefly unavailable.
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
