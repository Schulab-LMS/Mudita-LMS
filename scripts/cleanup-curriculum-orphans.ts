/**
 * Maintenance: hard-delete curriculum modules/lessons that the sync
 * soft-archived (syncStatus = "REMOVED") after STEM-Curricula folder renames,
 * but ONLY when they carry no learner data. Rows a student/tutor touched are
 * preserved (reported, left REMOVED, hidden by the course readers).
 *
 * Safe by default — DRY RUN unless `--apply` is passed:
 *
 *   npm run curriculum:cleanup              # dry run — report only, no deletes
 *   npm run curriculum:cleanup -- --apply   # actually delete
 *
 * Requires DATABASE_URL in the environment (same as prisma/seed.ts).
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { reapRemovedCurriculum } from "../src/services/curriculum-cleanup.service";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const apply = process.argv.includes("--apply");
  const report = await reapRemovedCurriculum(db, { dryRun: !apply });

  console.log(`Scanned ${report.scannedCourses} Git-managed course(s).`);
  console.log(
    `${apply ? "Deleted" : "Would delete"}: ${report.modulesDeleted} module(s), ` +
      `${report.lessonsDeleted} lesson(s).`
  );
  console.log(
    `Preserved (still referenced): ${report.modulesKept} module(s), ` +
      `${report.lessonsKept} lesson(s).`
  );
  for (const k of report.kept) {
    console.log(`  • kept lesson "${k.title}" (${k.id}) — ${k.reason}`);
  }
  if (!apply) {
    console.log("\nDRY RUN — nothing deleted. Re-run with --apply to delete.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
