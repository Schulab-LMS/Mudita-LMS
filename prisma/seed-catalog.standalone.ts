// Production-safe catalog seeder. Unlike prisma/seed.ts (which also creates demo
// users with a shared password, enrollments, etc. and must NEVER run in prod),
// this script seeds ONLY catalog content: reference sources, the course master
// list, bundles, pathways and their links. It is idempotent (seed-catalog uses
// upsert + replace-children) and safe to run on every deploy.
//
// Run: `npm run db:seed:catalog` (needs DATABASE_URL). Wired into the deploy
// workflow as a one-shot container step right after `prisma migrate deploy`.

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedCatalog } from "./seed-catalog";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// Catalog rows need a `createdById`. Prefer a real platform admin; fall back to
// any existing user; only create a login-disabled system user as a last resort
// (no passwordHash + no OAuth account ⇒ cannot sign in).
async function resolveAdminId(): Promise<string> {
  const admin = await db.user.findFirst({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (admin) return admin.id;

  const anyUser = await db.user.findFirst({ select: { id: true }, orderBy: { createdAt: "asc" } });
  if (anyUser) {
    console.log("⚠️  No ADMIN/SUPER_ADMIN found — using the earliest existing user as catalog author.");
    return anyUser.id;
  }

  console.log("⚠️  No users found — creating a login-disabled system author for catalog content.");
  const system = await db.user.create({
    data: {
      email: "system+catalog@schulab.com",
      name: "SchuLab System",
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
      // no passwordHash, no linked OAuth Account ⇒ cannot authenticate
    },
    select: { id: true },
  });
  return system.id;
}

async function main() {
  console.log("🌱 Seeding catalog (production-safe)...");
  const adminId = await resolveAdminId();
  await seedCatalog(db, adminId);
}

main()
  .catch((e) => {
    console.error("Catalog seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
