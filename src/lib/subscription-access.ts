import { db } from "@/lib/db";
import type { PlanTier } from "@/generated/prisma/client";

// Tier ordering for the subscription-grant check. LIFETIME > PRO > LEARNER >
// FREE. A course with requiredPlan=LEARNER is reachable by LEARNER, PRO and
// LIFETIME subscribers; a course with requiredPlan=PRO is only reachable by
// PRO and LIFETIME subscribers. FREE as a requirement means "any logged-in
// user" and is supported mostly for completeness.
const TIER_RANK: Record<PlanTier, number> = {
  FREE: 0,
  LEARNER: 1,
  PRO: 2,
  LIFETIME: 3,
};

export function tierRank(tier: PlanTier): number {
  return TIER_RANK[tier];
}

export function tierSatisfies(userTier: PlanTier, required: PlanTier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[required];
}

// Subscription statuses that grant content access. TRIALING counts so a
// user mid-trial gets the courses they signed up for; PAST_DUE deliberately
// does not — Stripe's grace window is the billing portal's job, not ours.
const ENTITLED_STATUSES = ["ACTIVE", "TRIALING"] as const;

// Returns the highest-tier active subscription the user currently holds, or
// null if they have none. "Active" here means one of the entitled statuses
// AND (currentPeriodEnd is null OR still in the future). LIFETIME plans are
// expected to have no currentPeriodEnd; monthly/yearly plans always do.
export async function getActiveSubscriptionTier(
  userId: string
): Promise<PlanTier | null> {
  const now = new Date();
  const subs = await db.subscription.findMany({
    where: {
      userId,
      status: { in: [...ENTITLED_STATUSES] },
      OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }],
    },
    select: { plan: { select: { tier: true } } },
  });
  if (subs.length === 0) return null;

  let best: PlanTier | null = null;
  for (const sub of subs) {
    if (!best || TIER_RANK[sub.plan.tier] > TIER_RANK[best]) {
      best = sub.plan.tier;
    }
  }
  return best;
}

export async function hasActivePlanAtLeast(
  userId: string,
  required: PlanTier
): Promise<boolean> {
  const tier = await getActiveSubscriptionTier(userId);
  if (!tier) return false;
  return tierSatisfies(tier, required);
}

// Whether a viewer may access a bundle. Free bundles (or those with no
// requiredPlan) are open to everyone; otherwise the viewer must be signed in
// with a subscription at or above the bundle's tier. Mirrors the course gate
// in enrollment.actions.ts, surfaced on the bundle page rather than enforced
// per-enrolment (the constituent courses still gate at enrolment time).
export async function hasBundleAccess(
  userId: string | null,
  bundle: { isFree: boolean; requiredPlan: PlanTier | null }
): Promise<boolean> {
  if (bundle.isFree || !bundle.requiredPlan) return true;
  if (!userId) return false;
  return hasActivePlanAtLeast(userId, bundle.requiredPlan);
}
