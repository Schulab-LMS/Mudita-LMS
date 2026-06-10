// Server-side feature flags driven by env vars. Read these in Server Components /
// actions only (they are NOT NEXT_PUBLIC, so they never reach the client bundle and
// can be flipped with an env change + container restart — no rebuild).

// Whether the public-facing paid purchase flow is live. During the soft-launch
// "payments OFF" beta this stays false: the pricing page reframes to "free in early
// access" and hides buyable CTAs / auto-renew / refund copy, so we never advertise a
// purchase we can't fulfil (also a German consumer-law concern). Flip to "true" once
// the subscribe flow + Stripe live catalog are wired and tested.
export function paymentsEnabled(): boolean {
  return process.env.PAYMENTS_ENABLED === "true";
}
