// Step 13 publish hook — seed a lesson's "common student questions" (+ tutor
// answers) into the platform Q&A (LessonQuestion / LessonAnswer) so tutors and
// learners see helpful FAQs from day one. Run AFTER the lesson is published
// (the DB Lesson row must exist). Idempotent: skips questions already present.
//
// Usage:
//   npx tsx --env-file=.env scripts/curriculum-agents/seed-common-questions.ts \
//     --lesson <lessonId> --in <common-questions.json> [--author <userId>]

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { db } from "@/lib/db";

interface CommonQuestion {
  question: string;
  answer: string;
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const lessonId = arg("--lesson");
  const inPath = arg("--in");
  if (!lessonId || !inPath) {
    console.error("Usage: --lesson <lessonId> --in <common-questions.json> [--author <userId>]");
    process.exit(2);
  }

  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) {
    console.error(`Lesson ${lessonId} not found. Publish/sync the lesson before seeding questions.`);
    process.exit(1);
  }

  // Resolve an author — a real User (FK). Prefer --author, else any admin.
  let authorId = arg("--author");
  if (!authorId) {
    const admin = await db.user.findFirst({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { id: true },
    });
    if (!admin) {
      console.error("No --author given and no ADMIN/SUPER_ADMIN user found to attribute the FAQs to.");
      process.exit(1);
    }
    authorId = admin.id;
  }

  const items = JSON.parse(readFileSync(resolve(inPath), "utf8")) as CommonQuestion[];

  const existing = await db.lessonQuestion.findMany({
    where: { lessonId },
    select: { body: true },
  });
  const seen = new Set(existing.map((q) => q.body.trim()));

  let created = 0;
  for (const item of items) {
    const body = item.question.trim();
    if (!body || seen.has(body)) continue;
    await db.lessonQuestion.create({
      data: {
        lessonId,
        authorId,
        body,
        answers: { create: [{ authorId, body: item.answer }] },
      },
    });
    seen.add(body);
    created++;
  }

  console.log(`→ Seeded ${created} common question(s) (skipped ${items.length - created} existing/empty).`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
