// One-off smoke-test setup. Idempotent: safe to re-run.
// - Aisha (child of Sara) gets a DOB making her a minor.
// - Aisha gets active PARENTAL_GDPR_K consent.
// - Lists a paid one-time-purchase course we can use for scenario 1.
// - Prints IDs the smoke test will reference.

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const sara = await db.user.findUnique({ where: { email: "sara@example.com" } });
  const aisha = await db.user.findUnique({ where: { email: "aisha@example.com" } });
  const liam = await db.user.findUnique({ where: { email: "liam@example.com" } });
  if (!sara || !aisha) throw new Error("seed parent/child not found");

  console.log(`Sara (parent) id: ${sara.id}`);
  console.log(`Aisha (child) id: ${aisha.id}`);
  console.log(`Liam id: ${liam?.id ?? "n/a"}`);

  // Make Aisha a minor (~10 yrs old). 2016-05-01 → ~10 on 2026-05-28.
  await db.user.update({
    where: { id: aisha.id },
    data: { dateOfBirth: new Date("2016-05-01") },
  });
  console.log("Aisha DOB set to 2016-05-01");

  // Make Liam a minor too (so scenario 3 has two unconsented minors)
  if (liam) {
    await db.user.update({
      where: { id: liam.id },
      data: { dateOfBirth: new Date("2014-09-15") },
    });
    console.log("Liam DOB set to 2014-09-15");

    // Link Liam to Sara if not already linked
    await db.parentChild.upsert({
      where: {
        parentId_childId: { parentId: sara.id, childId: liam.id },
      },
      update: {},
      create: { parentId: sara.id, childId: liam.id },
    });
    console.log("Sara ↔ Liam parentChild link upserted");
  }

  // Grant active consent for Aisha (idempotent — appends if not already
  // the latest grant). We always append a fresh row to guarantee an
  // "active" state for the smoke test, since assertMinorConsent reads
  // the most recent row.
  await db.consentRecord.create({
    data: {
      userId: aisha.id,
      grantedById: sara.id,
      type: "PARENTAL_GDPR_K",
      version: process.env.PRIVACY_VERSION ?? "2026-01-01",
      granted: true,
    },
  });
  console.log("Aisha consent appended (granted=true)");

  // Make sure Liam has NO active consent — append a withdrawal if his
  // latest is granted, otherwise leave alone.
  if (liam) {
    const latest = await db.consentRecord.findFirst({
      where: {
        userId: liam.id,
        type: { in: ["PARENTAL_COPPA", "PARENTAL_GDPR_K"] },
      },
      orderBy: { grantedAt: "desc" },
    });
    if (latest?.granted) {
      await db.consentRecord.create({
        data: {
          userId: liam.id,
          grantedById: sara.id,
          type: "PARENTAL_GDPR_K",
          version: process.env.PRIVACY_VERSION ?? "2026-01-01",
          granted: false,
        },
      });
      console.log("Liam consent withdrawn (for scenario 3 setup)");
    } else {
      console.log("Liam already has no active consent");
    }
  }

  // Find a paid one-time-purchase course (isFree=false AND requiredPlan=null)
  const paidCourse = await db.course.findFirst({
    where: { status: "PUBLISHED", isFree: false, requiredPlan: null },
    select: { id: true, title: true, slug: true, price: true, currency: true },
  });
  console.log("\nPaid one-time-purchase course candidate:");
  console.log(paidCourse);

  // Just for context — count how many fit the bill
  const paidCount = await db.course.count({
    where: { status: "PUBLISHED", isFree: false, requiredPlan: null },
  });
  console.log(`(${paidCount} total paid one-time-purchase courses)`);

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
