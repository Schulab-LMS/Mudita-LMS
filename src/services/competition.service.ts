import { db } from "@/lib/db";

export async function getCompetitions(filters?: { status?: string; ageGroup?: string }) {
  try {
    // Only SchuLab-HOSTED competitions. External catalog events (isExternal)
    // are served by the Events & Competitions tab via event.service.ts.
    const where: Record<string, unknown> = { isExternal: false };
    if (filters?.status) where.status = filters.status;
    if (filters?.ageGroup) where.ageGroup = filters.ageGroup;

    return await db.competition.findMany({
      where,
      orderBy: { startDate: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getCompetitionBySlug(slug: string) {
  try {
    return await db.competition.findFirst({
      where: { slug, isExternal: false },
      include: {
        registrations: { select: { id: true, userId: true } },
      },
    });
  } catch {
    return null;
  }
}

/**
 * Returns a competition with full registration details including user info,
 * scores, and ranks — for admin scoring view.
 */
export async function getCompetitionWithScores(competitionId: string) {
  try {
    return await db.competition.findUnique({
      where: { id: competitionId },
      include: {
        registrations: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: [
            { rank: "asc" },
            { registeredAt: "asc" },
          ],
        },
      },
    });
  } catch {
    return null;
  }
}

/**
 * Returns the scored leaderboard for a competition (public view).
 * Only returns participants who have been scored.
 */
export async function getLeaderboard(competitionId: string) {
  try {
    return await db.competitionRegistration.findMany({
      where: { competitionId, score: { not: null } },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: [{ rank: "asc" }, { score: "desc" }],
    });
  } catch {
    return [];
  }
}

export async function registerForCompetition(userId: string, competitionId: string) {
  try {
    return await db.competitionRegistration.create({
      data: { userId, competitionId },
    });
  } catch {
    return null;
  }
}

/**
 * Set the score for a single registration.
 */
export async function updateRegistrationScore(registrationId: string, score: number) {
  return await db.competitionRegistration.update({
    where: { id: registrationId },
    data: { score },
  });
}

/**
 * Recalculate and save ranks for all scored participants in a competition.
 * Participants with no score are unranked (rank = null).
 */
export async function calculateRanks(competitionId: string) {
  const scored = await db.competitionRegistration.findMany({
    where: { competitionId, score: { not: null } },
    orderBy: { score: "desc" },
    select: { id: true },
  });

  // Assign ranks 1, 2, 3, … in order of descending score
  await db.$transaction(
    scored.map((reg, index) =>
      db.competitionRegistration.update({
        where: { id: reg.id },
        data: { rank: index + 1 },
      })
    )
  );

  // Clear rank for unscored participants
  await db.competitionRegistration.updateMany({
    where: { competitionId, score: null },
    data: { rank: null },
  });
}
