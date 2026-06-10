// Comp-access granter — gives invited beta users full content access WITHOUT
// Stripe, by creating an ACTIVE LIFETIME subscription for each.
//
// Why: at soft-launch we run "payments OFF" (no live Stripe). Courses gated by
// `requiredPlan` (LEARNER/PRO) are otherwise unreachable. A LIFETIME comp clears
// the gate for the cohort while keeping the catalog "premium" — and because it's
// a real Subscription row, NOTHING changes when real payments turn on later.
//
// How access works (see src/lib/subscription-access.ts): a subscription counts
// when status ∈ {ACTIVE, TRIALING} AND (currentPeriodEnd is null OR future).
// LIFETIME = currentPeriodEnd null → never expires. tierSatisfies(LIFETIME, *)
// is always true, so it covers FREE/LEARNER/PRO-gated content.
//
// Idempotent: re-running upserts the plan and skips users who already hold an
// active comp. Safe to run repeatedly as you invite more people.
//
// Usage:
//   tsx scripts/comp-access.ts a@x.com b@y.com           # specific emails
//   COMP_EMAILS="a@x.com,b@y.com" tsx scripts/comp-access.ts
//   COMP_ALL_STUDENTS=true tsx scripts/comp-access.ts     # every STUDENT/PARENT
// Requires: DATABASE_URL in env. Run the main seed first (creates plans).

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const COMP_PLAN_SLUG = "comp-lifetime";

async function ensureCompPlan() {
  // A dedicated, non-purchasable LIFETIME plan so comps are easy to identify
  // and never collide with the real (FREE/LEARNER/PRO) catalog. No Stripe IDs.
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
      isActive: false, // not shown in any purchasable plan listing
      sortOrder: 999,
    },
  });
}

async function resolveTargetUsers(): Promise<{ id: string; email: string | null }[]> {
  const argEmails = process.argv.slice(2).filter((a) => a.includes("@"));
  const envEmails = (process.env.COMP_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const emails = [...new Set([...argEmails, ...envEmails])];

  if (emails.length > 0) {
    return db.user.findMany({
      where: { email: { in: emails } },
      select: { id: true, email: true },
    });
  }

  if (process.env.COMP_ALL_STUDENTS === "true") {
    return db.user.findMany({
      where: { role: { in: ["STUDENT", "PARENT"] } },
      select: { id: true, email: true },
    });
  }

  return [];
}

async function main() {
  const users = await resolveTargetUsers();
  if (users.length === 0) {
    console.error(
      "No target users. Pass emails as args, set COMP_EMAILS=a@x.com,b@y.com, " +
        "or COMP_ALL_STUDENTS=true.",
    );
    process.exit(1);
  }

  const plan = await ensureCompPlan();
  console.log(`Comp plan ready: ${plan.slug} (${plan.tier})`);

  let granted = 0;
  let skipped = 0;
  for (const user of users) {
    const existing = await db.subscription.findFirst({
      where: {
        userId: user.id,
        planId: plan.id,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
      select: { id: true },
    });
    if (existing) {
      console.log(`  • ${user.email ?? user.id} — already comped, skipped`);
      skipped++;
      continue;
    }

    await db.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: null, // LIFETIME — never expires
        cancelAtPeriodEnd: false,
      },
    });
    console.log(`  ✓ ${user.email ?? user.id} — comped LIFETIME`);
    granted++;
  }

  console.log(`\nDone. Granted ${granted}, skipped ${skipped}, total ${users.length}.`);
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
