"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { audit } from "@/lib/audit";
import {
  createEventSchema,
  updateEventSchema,
  deleteEventSchema,
  toggleEventListingSchema,
  addEventRecommendationSchema,
  removeEventRecommendationSchema,
} from "@/validators/action.schemas";

type ActionResult = { success: boolean; error?: string };

// Slugify a title and ensure uniqueness against the Competition table.
async function uniqueEventSlug(name: string): Promise<string> {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "event";
  let slug = base;
  let n = 2;
  // Competition.slug is globally unique (hosted + external share the table).
  while (await db.competition.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

function revalidateEvents(slug?: string) {
  revalidatePath("/admin/events");
  revalidatePath("/events");
  if (slug) revalidatePath(`/events/${slug}`);
}

export async function createEvent(data: unknown): Promise<ActionResult & { slug?: string }> {
  try {
    const session = await requireAdmin();
    const parsed = createEventSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
    const d = parsed.data;

    const slug = await uniqueEventSlug(d.name);
    const created = await db.competition.create({
      data: {
        slug,
        title: d.name,
        description: d.description,
        isExternal: true,
        officialProvider: d.officialProvider,
        officialUrl: d.officialUrl,
        eventType: d.eventType,
        category: d.category,
        region: d.region,
        tracks: d.tracks,
        ageGroup: d.ageGroup as never,
        ageMin: d.ageMin,
        ageMax: d.ageMax,
        levelMin: d.levelMin,
        levelMax: d.levelMax,
        seasonMonths: d.seasonMonths,
        listingStatus: d.listingStatus,
        preparationPathId: d.preparationPathId ?? null,
        thumbnail: d.thumbnail ?? null,
        eligibilityRules: {
          minAge: d.ageMin,
          maxAge: d.ageMax,
          tracks: d.tracks,
          notes: "",
        },
      },
      select: { id: true, slug: true, title: true },
    });

    await audit({
      actorId: session.user!.id,
      action: "event.create",
      resource: "Competition",
      resourceId: created.id,
      metadata: { slug: created.slug, title: created.title, isExternal: true },
    });
    revalidateEvents(created.slug);
    return { success: true, slug: created.slug };
  } catch (error) {
    console.error("createEvent error:", error);
    return { success: false, error: "Failed to create event" };
  }
}

export async function updateEvent(eventId: string, data: unknown): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = updateEventSchema.safeParse({ eventId, data });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
    const { data: d } = parsed.data;

    if (d.ageMin != null && d.ageMax != null && d.ageMax < d.ageMin) {
      return { success: false, error: "Maximum age must be ≥ minimum age" };
    }

    const existing = await db.competition.findFirst({
      where: { id: eventId, isExternal: true },
      select: { id: true, slug: true },
    });
    if (!existing) return { success: false, error: "Event not found" };

    await db.competition.update({
      where: { id: eventId },
      data: {
        ...(d.name !== undefined ? { title: d.name } : {}),
        ...(d.description !== undefined ? { description: d.description } : {}),
        ...(d.officialProvider !== undefined ? { officialProvider: d.officialProvider } : {}),
        ...(d.officialUrl !== undefined ? { officialUrl: d.officialUrl } : {}),
        ...(d.eventType !== undefined ? { eventType: d.eventType } : {}),
        ...(d.category !== undefined ? { category: d.category } : {}),
        ...(d.region !== undefined ? { region: d.region } : {}),
        ...(d.tracks !== undefined ? { tracks: d.tracks } : {}),
        ...(d.ageGroup !== undefined ? { ageGroup: d.ageGroup as never } : {}),
        ...(d.ageMin !== undefined ? { ageMin: d.ageMin } : {}),
        ...(d.ageMax !== undefined ? { ageMax: d.ageMax } : {}),
        ...(d.levelMin !== undefined ? { levelMin: d.levelMin } : {}),
        ...(d.levelMax !== undefined ? { levelMax: d.levelMax } : {}),
        ...(d.seasonMonths !== undefined ? { seasonMonths: d.seasonMonths } : {}),
        ...(d.listingStatus !== undefined ? { listingStatus: d.listingStatus } : {}),
        ...(d.preparationPathId !== undefined ? { preparationPathId: d.preparationPathId } : {}),
        ...(d.thumbnail !== undefined ? { thumbnail: d.thumbnail } : {}),
      },
    });

    await audit({
      actorId: session.user!.id,
      action: "event.update",
      resource: "Competition",
      resourceId: eventId,
      metadata: { fields: Object.keys(d) },
    });
    revalidateEvents(existing.slug);
    return { success: true };
  } catch (error) {
    console.error("updateEvent error:", error);
    return { success: false, error: "Failed to update event" };
  }
}

export async function toggleEventListing(eventId: string, listingStatus: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = toggleEventListingSchema.safeParse({ eventId, listingStatus });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const existing = await db.competition.findFirst({
      where: { id: eventId, isExternal: true },
      select: { slug: true },
    });
    if (!existing) return { success: false, error: "Event not found" };

    await db.competition.update({
      where: { id: eventId },
      data: { listingStatus: parsed.data.listingStatus },
    });
    await audit({
      actorId: session.user!.id,
      action: "event.set_listing_status",
      resource: "Competition",
      resourceId: eventId,
      metadata: { listingStatus: parsed.data.listingStatus },
    });
    revalidateEvents(existing.slug);
    return { success: true };
  } catch (error) {
    console.error("toggleEventListing error:", error);
    return { success: false, error: "Failed to update event status" };
  }
}

export async function deleteEvent(eventId: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = deleteEventSchema.safeParse({ eventId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const existing = await db.competition.findFirst({
      where: { id: eventId, isExternal: true },
      select: { id: true, title: true, slug: true },
    });
    if (!existing) return { success: false, error: "Event not found" };

    // Recommendation rows cascade on delete (onDelete: Cascade).
    await db.competition.delete({ where: { id: eventId } });
    await audit({
      actorId: session.user!.id,
      action: "event.delete",
      resource: "Competition",
      resourceId: eventId,
      metadata: { slug: existing.slug, title: existing.title },
    });
    revalidateEvents(existing.slug);
    return { success: true };
  } catch (error) {
    console.error("deleteEvent error:", error);
    return { success: false, error: "Failed to delete event" };
  }
}

export async function addEventRecommendation(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = addEventRecommendationSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
    const d = parsed.data;

    const event = await db.competition.findFirst({
      where: { id: d.eventId, isExternal: true },
      select: { slug: true },
    });
    if (!event) return { success: false, error: "Event not found" };

    const common = {
      competitionId: d.eventId,
      recommendationType: d.recommendationType,
      reason: d.reason,
      minimumCompletionPercentage: d.minimumCompletionPercentage,
    };

    if (d.target === "course") {
      await db.eventCourseRecommendation.upsert({
        where: { competitionId_courseId: { competitionId: d.eventId, courseId: d.targetId } },
        create: { ...common, courseId: d.targetId },
        update: common,
      });
    } else {
      await db.eventBundleRecommendation.upsert({
        where: { competitionId_bundleId: { competitionId: d.eventId, bundleId: d.targetId } },
        create: { ...common, bundleId: d.targetId },
        update: common,
      });
    }

    await audit({
      actorId: session.user!.id,
      action: "event.add_recommendation",
      resource: "Competition",
      resourceId: d.eventId,
      metadata: { target: d.target, targetId: d.targetId, type: d.recommendationType },
    });
    revalidateEvents(event.slug);
    return { success: true };
  } catch (error) {
    console.error("addEventRecommendation error:", error);
    return { success: false, error: "Failed to add recommendation" };
  }
}

export async function removeEventRecommendation(recommendationId: string, target: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = removeEventRecommendationSchema.safeParse({ recommendationId, target });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    if (parsed.data.target === "course") {
      await db.eventCourseRecommendation.delete({ where: { id: parsed.data.recommendationId } });
    } else {
      await db.eventBundleRecommendation.delete({ where: { id: parsed.data.recommendationId } });
    }
    await audit({
      actorId: session.user!.id,
      action: "event.remove_recommendation",
      resource: "Competition",
      resourceId: parsed.data.recommendationId,
      metadata: { target: parsed.data.target },
    });
    revalidateEvents();
    return { success: true };
  } catch (error) {
    console.error("removeEventRecommendation error:", error);
    return { success: false, error: "Failed to remove recommendation" };
  }
}
