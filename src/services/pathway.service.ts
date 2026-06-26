import { db } from "@/lib/db";
import { getLocalizedField } from "@/services/course.service";
import {
  isPlatformAdmin,
  tenantScope,
  type TenantPrincipal,
} from "@/lib/tenant";

// Pathway reads mirror bundle.service.ts: tenant-scoped, soft-fail to []/null,
// localized via getLocalizedField. Progress is DERIVED from existing
// Enrollment rows (a stage is done when its course / every required bundle
// course is COMPLETED) — no PathwayEnrollment table in v1.

function isViewerPlatformAdmin(v: TenantPrincipal | null | undefined): boolean {
  return Boolean(v && isPlatformAdmin(v.role));
}

interface PathwayFilters {
  ageGroup?: string;
  search?: string;
  viewer?: TenantPrincipal | null;
}

export async function getPathways(filters: PathwayFilters = {}) {
  try {
    const where: Record<string, unknown> = { status: "PUBLISHED" };
    if (filters.ageGroup) where.ageGroup = filters.ageGroup;

    const andClauses: Array<Record<string, unknown>> = [];
    const scope = tenantScope(filters.viewer);
    if ("OR" in scope) andClauses.push(scope as Record<string, unknown>);
    if (filters.search) {
      andClauses.push({
        OR: [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ],
      });
    }
    if (andClauses.length > 0) where.AND = andClauses;

    const pathways = await db.learningPathway.findMany({
      where,
      include: { _count: { select: { stages: true } } },
      orderBy: [{ ageGroup: "asc" }, { order: "asc" }],
    });

    return pathways.map((pathway) => ({
      ...pathway,
      stageCount: pathway._count.stages,
    }));
  } catch {
    return [];
  }
}

export async function getPathwayBySlug(
  slug: string,
  viewer?: TenantPrincipal | null
) {
  try {
    const pathway = await db.learningPathway.findUnique({
      where: { slug },
      include: {
        stages: {
          orderBy: { order: "asc" },
          include: {
            course: {
              include: {
                modules: { include: { _count: { select: { lessons: true } } } },
              },
            },
            bundle: {
              include: {
                courses: {
                  orderBy: { order: "asc" },
                  select: { courseId: true, isRequired: true },
                },
              },
            },
          },
        },
        referenceSources: {
          orderBy: { order: "asc" },
          include: { source: true },
        },
      },
    });

    if (!pathway) return null;

    // Soft-fail with null for out-of-tenant pathways → route surfaces a 404.
    if (viewer !== undefined) {
      const principalOrg =
        viewer && !isViewerPlatformAdmin(viewer) ? viewer.organizationId ?? null : null;
      if (
        viewer &&
        !isViewerPlatformAdmin(viewer) &&
        pathway.organizationId !== null &&
        pathway.organizationId !== principalOrg
      ) {
        return null;
      }
    }

    return pathway;
  } catch {
    return null;
  }
}

export type PathwayWithStages = NonNullable<
  Awaited<ReturnType<typeof getPathwayBySlug>>
>;

export interface PathwayProgress {
  percent: number;
  completedStages: number;
  totalStages: number;
  // Per-stage completion in stage order, for the roadmap ticks.
  stageDone: boolean[];
}

// Derive pathway progress from the learner's Enrollment rows. One batched
// query over every course referenced by any stage (direct or via a bundle),
// resolved in memory to avoid N+1.
export async function getPathwayProgress(
  userId: string,
  pathway: PathwayWithStages
): Promise<PathwayProgress> {
  const totalStages = pathway.stages.length;
  const empty: PathwayProgress = {
    percent: 0,
    completedStages: 0,
    totalStages,
    stageDone: new Array(totalStages).fill(false),
  };
  if (totalStages === 0) return empty;

  try {
    const courseIds = new Set<string>();
    for (const stage of pathway.stages) {
      if (stage.courseId) courseIds.add(stage.courseId);
      if (stage.bundle) {
        for (const link of stage.bundle.courses) courseIds.add(link.courseId);
      }
    }

    const enrollments = await db.enrollment.findMany({
      where: { userId, courseId: { in: [...courseIds] } },
      select: { courseId: true, status: true },
    });
    const completed = new Set(
      enrollments.filter((e) => e.status === "COMPLETED").map((e) => e.courseId)
    );

    const stageDone = pathway.stages.map((stage) => {
      if (stage.courseId) return completed.has(stage.courseId);
      if (stage.bundle) {
        const required = stage.bundle.courses.filter((c) => c.isRequired);
        const gate = required.length > 0 ? required : stage.bundle.courses;
        return gate.length > 0 && gate.every((c) => completed.has(c.courseId));
      }
      return false;
    });

    const completedStages = stageDone.filter(Boolean).length;
    return {
      percent: Math.round((completedStages / totalStages) * 100),
      completedStages,
      totalStages,
      stageDone,
    };
  } catch {
    return empty;
  }
}

export { getLocalizedField };
