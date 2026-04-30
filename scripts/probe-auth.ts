import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const cmd = process.argv[2];

  if (cmd === "verify-admin") {
    const r = await db.user.update({
      where: { email: "admin@schulab.com" },
      data: { emailVerified: new Date() },
    });
    console.log("VERIFIED:", r.email, r.emailVerified);
    return;
  }

  if (cmd === "unverify-admin") {
    const r = await db.user.update({
      where: { email: "admin@schulab.com" },
      data: { emailVerified: null },
    });
    console.log("UNVERIFIED:", r.email);
    return;
  }

  const all = await db.user.findMany({
    select: {
      email: true,
      role: true,
      emailVerified: true,
      passwordHash: true,
    },
    orderBy: { createdAt: "asc" },
  });
  console.log(`USER COUNT: ${all.length}`);
  for (const u of all) {
    console.log(
      `  ${u.email.padEnd(35)} role=${u.role.padEnd(11)} verified=${
        u.emailVerified ? "yes" : "NO "
      } password=${u.passwordHash ? "yes" : "no "}`
    );
  }
}

main()
  .catch((e) => {
    console.error("ERR:", e?.message || e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
