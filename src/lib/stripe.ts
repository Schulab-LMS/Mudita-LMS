import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

// Instantiate lazily so non-billing code paths (build, tests) don't explode
// when the key is absent. Callers should check `isStripeConfigured()` first
// when the action is optional.
let instance: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(secretKey);
}

export function stripe(): Stripe {
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Billing features are disabled."
    );
  }
  if (!instance) {
    instance = new Stripe(secretKey, {
      typescript: true,
      appInfo: { name: "Mudita LMS", version: "0.1.0" },
    });
  }
  return instance;
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
export const DEFAULT_CURRENCY =
  process.env.STRIPE_DEFAULT_CURRENCY?.toUpperCase() ?? "USD";
