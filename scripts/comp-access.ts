// Bulk comp-access granter for the soft-launch payments-off beta. Grants invited
// users a complimentary ACTIVE LIFETIME subscription so requiredPlan-gated courses
// are reachable — no Stripe. The grant/revoke logic lives in the shared service
// (src/services/comp-access.service.ts), which the admin UI uses too, so behaviour
// is identical whether comped from the dashboard or here in bulk.
//
// Usage:
//   tsx scripts/comp-access.ts a@x.com b@y.com           # specific emails
//   COMP_EMAILS="a@x.com,b@y.com" tsx scripts/comp-access.ts
//   COMP_ALL_STUDENTS=true tsx scripts/comp-access.ts     # every STUDENT/PARENT
// Requires: DATABASE_URL in env. Run the main seed first (creates base plans).

import { db } from "../src/lib/db";
import { grantComp } from "../src/services/comp-access.service";

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

  let granted = 0;
  let skipped = 0;
  for (const user of users) {
    const created = await grantComp(user.id);
    if (created) {
      console.log(`  ✓ ${user.email ?? user.id} — comped LIFETIME`);
      granted++;
    } else {
      console.log(`  • ${user.email ?? user.id} — already comped, skipped`);
      skipped++;
    }
  }

  console.log(`\nDone. Granted ${granted}, skipped ${skipped}, total ${users.length}.`);
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
