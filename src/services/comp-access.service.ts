import { db } from "@/lib/db";

// Complimentary ("comp") access for the soft-launch payments-off beta. A comp is a
// real ACTIVE LIFETIME Subscription with no expiry, pointing at a dedicated hidden
// plan — so it clears `requiredPlan` content gating (see src/lib/subscription-access.ts)
// while keeping the real catalog untouched, and nothing changes when paid plans go live.
//
// Shared by both the admin UI (src/actions/admin.actions.ts) and the bulk CLI
// (scripts/comp-access.ts) so the grant/revoke semantics live in exactly one place.

export const COMP_PLAN_SLUG = "comp-lifetime";

// Idempotent: returns the dedicated, non-purchasable LIFETIME comp plan, creating it
// on first use. isActive:false keeps it out of any purchasable plan listing.
export async function ensureCompPlan() {
  return db.plan.upsert({
    where: { slug: COMP_PLAN_SLUG },
    update: {},
    create: {
      slug: COMP_PLAN_SLUG,
      tier: "LIFETIME",
      interval: null,
      name: "Early Access (Comp)",
      description: "Complimentary full access granted to early-access beta users.",
      amount: 0,
      currency: "EUR",
      features: { allCourses: true, certificates: true, community: true, comp: true },
      isActive: false,
      sortOrder: 999,
    },
  });
}

// Whether the user currently holds an active comp subscription.
export async function hasActiveComp(userId: string): Promise<boolean> {
  const sub = await db.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      plan: { slug: COMP_PLAN_SLUG },
    },
    select: { id: true },
  });
  return sub !== null;
}

// Returns the set of userIds (from the given list) that hold an active comp — one
// query, for rendering comp state across a table without N+1 lookups.
export async function compStatusFor(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const subs = await db.subscription.findMany({
    where: {
      userId: { in: userIds },
      status: "ACTIVE",
      plan: { slug: COMP_PLAN_SLUG },
    },
    select: { userId: true },
  });
  return new Set(subs.map((s) => s.userId));
}

// Idempotent grant. Returns false if the user already had an active comp (no-op),
// true if a new comp was created.
export async function grantComp(userId: string): Promise<boolean> {
  const plan = await ensureCompPlan();
  const existing = await db.subscription.findFirst({
    where: { userId, planId: plan.id, status: { in: ["ACTIVE", "TRIALING"] } },
    select: { id: true },
  });
  if (existing) return false;

  await db.subscription.create({
    data: {
      userId,
      planId: plan.id,
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: null, // LIFETIME — never expires
      cancelAtPeriodEnd: false,
    },
  });
  return true;
}

// Revokes all active comp subscriptions for the user (CANCELED). Returns how many
// were revoked (0 if none active).
export async function revokeComp(userId: string): Promise<number> {
  const plan = await db.plan.findUnique({
    where: { slug: COMP_PLAN_SLUG },
    select: { id: true },
  });
  if (!plan) return 0;

  const { count } = await db.subscription.updateMany({
    where: { userId, planId: plan.id, status: { in: ["ACTIVE", "TRIALING"] } },
    data: { status: "CANCELED", canceledAt: new Date() },
  });
  return count;
}
