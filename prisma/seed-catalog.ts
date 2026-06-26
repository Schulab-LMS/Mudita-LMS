// Catalog expansion seeder: reference sources, the full 93-course master list
// (new courses created with placeholder lessons; existing courses enriched and
// mapped — never duplicated), the 11 bundles and 6 age-based pathways, plus all
// reference-source links. Pure-additive and idempotent (upsert + replace-
// children), so it is safe to re-run and safe alongside the legacy seed body.
//
// Called from prisma/seed.ts after the base courses exist so every bundle /
// pathway course slug resolves.

import type { PrismaClient } from "../src/generated/prisma/client";
import type {
  AgeGroup,
  CourseLevel,
  PlanTier,
  ContentStatus,
  SourceStatus,
} from "../src/generated/prisma/client";
import type { CatalogCourse } from "./catalog/types";
import { REFERENCE_SOURCES } from "./catalog/reference-sources.data";
import { COURSES_AGES_3_5 } from "./catalog/courses-ages-3-5.data";
import { COURSES_AGES_5_7 } from "./catalog/courses-ages-5-7.data";
import { COURSES_AGES_8_10 } from "./catalog/courses-ages-8-10.data";
import { COURSES_AGES_11_13 } from "./catalog/courses-ages-11-13.data";
import { COURSES_SCIENCE } from "./catalog/courses-science.data";
import { COURSES_TEENS } from "./catalog/courses-teens.data";
import { BUNDLES } from "./catalog/bundles.data";
import { PATHWAYS } from "./catalog/pathways.data";

const ALL_COURSES: CatalogCourse[] = [
  ...COURSES_AGES_3_5,
  ...COURSES_AGES_5_7,
  ...COURSES_AGES_8_10,
  ...COURSES_AGES_11_13,
  ...COURSES_SCIENCE,
  ...COURSES_TEENS,
];

const DEFAULT_LESSON_DURATION = 1800; // 30 min, matches legacy seedCourseContent

export async function seedCatalog(db: PrismaClient, adminId: string) {
  // 1. Reference sources (upsert by stable key) ───────────────────────────────
  const sourceIdByKey = new Map<string, string>();
  for (const s of REFERENCE_SOURCES) {
    const row = await db.referenceSource.upsert({
      where: { key: s.key },
      update: {
        name: s.name,
        url: s.url,
        provider: s.provider,
        sourceType: s.sourceType,
        relatedTopics: s.relatedTopics,
        recommendedAgeRange: s.recommendedAgeRange ?? null,
        usageInSchulab: s.usageInSchulab,
        status: s.status as SourceStatus,
        notes: s.notes ?? null,
      },
      create: {
        key: s.key,
        name: s.name,
        url: s.url,
        provider: s.provider,
        sourceType: s.sourceType,
        relatedTopics: s.relatedTopics,
        recommendedAgeRange: s.recommendedAgeRange ?? null,
        usageInSchulab: s.usageInSchulab,
        status: s.status as SourceStatus,
        notes: s.notes ?? null,
      },
    });
    sourceIdByKey.set(s.key, row.id);
  }

  // 2. Courses (create new w/ placeholder lessons; enrich existing) ────────────
  let created = 0;
  let enriched = 0;
  const courseIdBySlug = new Map<string, string>();

  for (const c of ALL_COURSES) {
    const existingRow = await db.course.findUnique({
      where: { slug: c.slug },
      select: { id: true },
    });

    // Catalog metadata shared by create + update. For EXISTING courses we do
    // not touch status / price / isFree / requiredPlan (the data files omit
    // them) so a published course is never silently changed.
    const metadata = {
      title: c.title,
      description: c.description,
      ageGroup: c.ageGroup as AgeGroup,
      level: c.level as CourseLevel,
      category: c.category,
      skills: c.skills,
      tools: c.tools,
      parentSummary: c.parentSummary,
      studentSummary: c.studentSummary,
      finalProjectTitle: c.finalProjectTitle,
      finalProjectDescription: c.finalProjectDescription,
      contentStatus: (c.contentStatus ?? "SEED_NOW") as ContentStatus,
      adminNotes: c.adminNotes ?? null,
    };

    if (existingRow) {
      const update: Record<string, unknown> = { ...metadata };
      // Only (re)assert lifecycle fields for NEW (non-existing) catalog rows.
      if (!c.existing) {
        update.status = c.status ?? "DRAFT";
        update.isFree = c.isFree ?? false;
        update.requiredPlan = (c.requiredPlan ?? null) as PlanTier | null;
      }
      await db.course.update({ where: { id: existingRow.id }, data: update });
      courseIdBySlug.set(c.slug, existingRow.id);
      enriched++;
    } else {
      const row = await db.course.create({
        data: {
          slug: c.slug,
          ...metadata,
          status: c.existing ? "DRAFT" : c.status ?? "DRAFT",
          isFree: c.isFree ?? false,
          requiredPlan: (c.requiredPlan ?? null) as PlanTier | null,
          price: c.price ?? 0,
          createdById: adminId,
        },
      });
      courseIdBySlug.set(c.slug, row.id);
      created++;

      // Placeholder modules/lessons for NEW authored courses only. Existing
      // courses keep whatever content they already have (or get it via the
      // Git curriculum sync later).
      if (!c.existing && c.modules?.length) {
        let mOrder = 0;
        for (const mod of c.modules) {
          const createdMod = await db.module.create({
            data: { courseId: row.id, title: mod.title, order: mOrder++ },
          });
          let lOrder = 0;
          for (const lesson of mod.lessons) {
            await db.lesson.create({
              data: {
                moduleId: createdMod.id,
                title: lesson.title,
                order: lOrder++,
                isFree: lesson.isFree ?? false,
                duration: lesson.duration ?? DEFAULT_LESSON_DURATION,
                content: `<p>${lesson.title}</p>`,
                type: "VIDEO",
              },
            });
          }
        }
      }
    }
  }

  // 3. Linear "next recommended course" pointers ──────────────────────────────
  for (const c of ALL_COURSES) {
    if (!c.nextSlug) continue;
    const fromId = courseIdBySlug.get(c.slug);
    const toId = courseIdBySlug.get(c.nextSlug);
    if (fromId && toId) {
      await db.course.update({ where: { id: fromId }, data: { nextCourseId: toId } });
    }
  }

  // 4. Course → reference-source links (replace-children) ──────────────────────
  for (const c of ALL_COURSES) {
    const courseId = courseIdBySlug.get(c.slug);
    if (!courseId) continue;
    await db.courseReferenceSource.deleteMany({ where: { courseId } });
    let order = 0;
    for (const key of c.referenceKeys) {
      const sourceId = sourceIdByKey.get(key);
      if (!sourceId) {
        console.log(`⚠️  Course "${c.slug}" — unknown reference key "${key}", skipped`);
        continue;
      }
      await db.courseReferenceSource.create({ data: { courseId, sourceId, order: order++ } });
    }
  }

  // 5. Bundles (upsert + rebuild course links + source links) ──────────────────
  let bundlesUpserted = 0;
  for (const b of BUNDLES) {
    const row = await db.bundle.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        description: b.description,
        themeCategory: b.themeCategory,
        ageGroup: b.ageGroup as AgeGroup,
        level: b.level as CourseLevel,
        requiredPlan: (b.requiredPlan ?? null) as PlanTier | null,
        isFree: b.isFree ?? false,
        status: "PUBLISHED",
        finalProjectTitle: b.finalProjectTitle,
        finalProjectDescription: b.finalProjectDescription,
        learningObjectives: { en: b.learningObjectives, ar: [], de: [] },
        recommendedDurationWeeks: b.recommendedDurationWeeks,
        adminNotes: b.adminNotes ?? null,
      },
      create: {
        slug: b.slug,
        title: b.title,
        description: b.description,
        themeCategory: b.themeCategory,
        ageGroup: b.ageGroup as AgeGroup,
        level: b.level as CourseLevel,
        requiredPlan: (b.requiredPlan ?? null) as PlanTier | null,
        isFree: b.isFree ?? false,
        status: "PUBLISHED",
        finalProjectTitle: b.finalProjectTitle,
        finalProjectDescription: b.finalProjectDescription,
        learningObjectives: { en: b.learningObjectives, ar: [], de: [] },
        recommendedDurationWeeks: b.recommendedDurationWeeks,
        adminNotes: b.adminNotes ?? null,
        createdById: adminId,
      },
    });
    bundlesUpserted++;

    await db.bundleCourse.deleteMany({ where: { bundleId: row.id } });
    let order = 0;
    for (const link of b.courses) {
      const courseId = courseIdBySlug.get(link.slug);
      if (!courseId) {
        console.log(`⚠️  Bundle "${b.slug}" — course slug "${link.slug}" not found, skipped`);
        continue;
      }
      await db.bundleCourse.create({
        data: { bundleId: row.id, courseId, order: order++, isRequired: link.isRequired ?? true },
      });
    }

    await db.bundleReferenceSource.deleteMany({ where: { bundleId: row.id } });
    let sOrder = 0;
    for (const key of b.referenceKeys) {
      const sourceId = sourceIdByKey.get(key);
      if (!sourceId) continue;
      await db.bundleReferenceSource.create({ data: { bundleId: row.id, sourceId, order: sOrder++ } });
    }
  }

  // 6. Pathways (upsert + rebuild stages + source links) ───────────────────────
  let pathwaysUpserted = 0;
  for (const p of PATHWAYS) {
    const row = await db.learningPathway.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        description: p.description,
        ageGroup: p.ageGroup as AgeGroup,
        order: p.order,
        status: "PUBLISHED",
        adminNotes: p.adminNotes ?? null,
      },
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        ageGroup: p.ageGroup as AgeGroup,
        order: p.order,
        status: "PUBLISHED",
        adminNotes: p.adminNotes ?? null,
        createdById: adminId,
      },
    });
    pathwaysUpserted++;

    await db.pathwayStage.deleteMany({ where: { pathwayId: row.id } });
    let order = 0;
    for (const stage of p.stages) {
      let bundleId: string | null = null;
      let courseId: string | null = null;
      if (stage.bundleSlug) {
        const b = await db.bundle.findUnique({ where: { slug: stage.bundleSlug }, select: { id: true } });
        if (!b) {
          console.log(`⚠️  Pathway "${p.slug}" — bundle "${stage.bundleSlug}" not found, skipped`);
          continue;
        }
        bundleId = b.id;
      } else if (stage.courseSlug) {
        courseId = courseIdBySlug.get(stage.courseSlug) ?? null;
        if (!courseId) {
          console.log(`⚠️  Pathway "${p.slug}" — course "${stage.courseSlug}" not found, skipped`);
          continue;
        }
      } else {
        continue;
      }
      await db.pathwayStage.create({
        data: { pathwayId: row.id, order: order++, title: stage.title ?? null, bundleId, courseId },
      });
    }

    await db.pathwayReferenceSource.deleteMany({ where: { pathwayId: row.id } });
    let sOrder = 0;
    for (const key of p.referenceKeys) {
      const sourceId = sourceIdByKey.get(key);
      if (!sourceId) continue;
      await db.pathwayReferenceSource.create({ data: { pathwayId: row.id, sourceId, order: sOrder++ } });
    }
  }

  console.log(
    `✅ Catalog seeded — ${REFERENCE_SOURCES.length} sources, ${created} new courses, ` +
      `${enriched} enriched, ${bundlesUpserted} bundles, ${pathwaysUpserted} pathways`
  );
}
