import { db } from "@/lib/db";
import { sendDripEmail } from "@/lib/email-drip";
import type { DripJourney } from "@/generated/prisma/client";

// Simple step-indexed lifecycle automation. Each journey is a list of
// DripStep objects; the cron endpoint (/api/cron/drip) advances any rows
// where nextSendAt <= now. Journeys complete themselves when they run out
// of steps. Designed so new journeys can be added by editing JOURNEYS only.

export type DripStep = {
  subject: (ctx: { name: string }) => string;
  html: (ctx: { name: string; appUrl: string }) => string;
  // Milliseconds from the previous step to the next one.
  delayMs: number;
};

const DAY = 24 * 60 * 60 * 1000;

const JOURNEYS: Record<DripJourney, DripStep[]> = {
  ACTIVATION: [
    {
      delayMs: 0,
      subject: ({ name }) => `Welcome aboard, ${name}! Here's where to start`,
      html: ({ name, appUrl }) => `
        <h2>Hi ${name},</h2>
        <p>Glad you're here. Try a free preview lesson today — no payment required.</p>
        <p><a href="${appUrl}/courses">Browse free previews</a></p>
      `,
    },
    {
      delayMs: 2 * DAY,
      subject: () => "Pick your first course",
      html: ({ appUrl }) => `
        <h2>Still exploring?</h2>
        <p>Based on your goals, here are three hand-picked courses for you.</p>
        <p><a href="${appUrl}/courses">See your recommendations</a></p>
      `,
    },
    {
      delayMs: 5 * DAY,
      subject: () => "Save 20% on your first course",
      html: ({ appUrl }) => `
        <h2>One-time offer</h2>
        <p>Use code <strong>WELCOME20</strong> at checkout for 20% off any paid course.</p>
        <p><a href="${appUrl}/courses">Unlock the discount</a></p>
      `,
    },
  ],
  PARENT_DIGEST: [
    {
      delayMs: 7 * DAY,
      subject: () => "Your child's learning recap",
      html: ({ name, appUrl }) => `
        <h2>Hi ${name},</h2>
        <p>Here's what your child has been up to this week.</p>
        <p><a href="${appUrl}/parent">Open the parent dashboard</a></p>
      `,
    },
  ],
  // Individual course purchases were retired in favour of subscription-only
  // access. The two CART_ABANDONMENT steps below stay because there are still
  // in-flight DripState rows in production from before the change. The copy
  // points them at the subscription flow instead of a now-410'd course
  // checkout. New users are no longer enrolled into this journey (see
  // seedCartAbandonmentJourney).
  CART_ABANDONMENT: [
    {
      delayMs: 60 * 60 * 1000,
      subject: () => "Your saved course is now part of every plan",
      html: ({ appUrl }) => `
        <h2>Good news — you don't need to buy it separately anymore.</h2>
        <p>The course you were looking at is now included with every Schulab subscription, alongside the full catalogue and 4 live tutor sessions per month.</p>
        <p><a href="${appUrl}/pricing">See plans &amp; start with a free tutor session</a></p>
      `,
    },
    {
      delayMs: DAY,
      subject: () => "Pick up where you left off",
      html: ({ appUrl }) => `
        <h2>Ready to continue?</h2>
        <p>Subscribe to Solo, Family, or Custom to unlock the course you started — your first tutor session is on us.</p>
        <p><a href="${appUrl}/pricing">Choose a plan</a></p>
      `,
    },
  ],
  WIN_BACK: [],
};

export async function enrollInDripJourney(
  userId: string,
  journey: DripJourney,
  metadata?: Record<string, unknown>
) {
  const first = JOURNEYS[journey][0];
  if (!first) return null;
  const nextSendAt = new Date(Date.now() + first.delayMs);
  return db.dripState.upsert({
    where: { userId_journey: { userId, journey } },
    create: {
      userId,
      journey,
      step: 0,
      status: "ACTIVE",
      nextSendAt,
      metadata: (metadata ?? undefined) as never,
    },
    update: {
      step: 0,
      status: "ACTIVE",
      nextSendAt,
      metadata: (metadata ?? undefined) as never,
    },
  });
}

export async function cancelDripJourney(userId: string, journey: DripJourney) {
  await db.dripState.updateMany({
    where: { userId, journey, status: "ACTIVE" },
    data: { status: "CANCELLED" },
  });
}

// Process every drip row whose next send time has elapsed. Returns a small
// summary that the cron endpoint surfaces for observability.
export async function processDueDripRows(
  now: Date = new Date()
): Promise<{ sent: number; completed: number; failed: number }> {
  const rows = await db.dripState.findMany({
    where: {
      status: "ACTIVE",
      nextSendAt: { lte: now },
    },
    include: {
      user: { select: { id: true, email: true, name: true, isActive: true } },
    },
    take: 200,
  });

  let sent = 0;
  let completed = 0;
  let failed = 0;

  for (const row of rows) {
    const steps = JOURNEYS[row.journey];
    const step = steps[row.step];
    if (!step) {
      await db.dripState.update({
        where: { id: row.id },
        data: { status: "COMPLETED" },
      });
      completed += 1;
      continue;
    }

    if (!row.user.isActive) {
      await db.dripState.update({
        where: { id: row.id },
        data: { status: "CANCELLED" },
      });
      continue;
    }

    try {
      await sendDripEmail({
        to: row.user.email,
        subject: step.subject({ name: row.user.name ?? "there" }),
        html: step.html({
          name: row.user.name ?? "there",
          appUrl:
            process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        }),
      });
      sent += 1;
    } catch (err) {
      console.error("[drip] send failed:", err);
      failed += 1;
      continue;
    }

    const nextStepIdx = row.step + 1;
    const nextStep = steps[nextStepIdx];
    if (nextStep) {
      await db.dripState.update({
        where: { id: row.id },
        data: {
          step: nextStepIdx,
          lastSentAt: now,
          nextSendAt: new Date(now.getTime() + nextStep.delayMs),
        },
      });
    } else {
      await db.dripState.update({
        where: { id: row.id },
        data: {
          lastSentAt: now,
          nextSendAt: null,
          status: "COMPLETED",
        },
      });
      completed += 1;
    }
  }

  return { sent, completed, failed };
}

// Sweep for abandoned carts. Disabled: individual course purchases were
// retired in favour of subscription-only access, so no new PENDING
// CoursePurchase rows are created. The function stays so the cron caller
// doesn't have to change, but it no longer enrols anyone — pre-existing
// DripState rows continue to fire through the (revised) email steps and
// drain naturally.
export async function seedCartAbandonmentJourney(
  _graceMinutes = 30,
  _now: Date = new Date()
) {
  return { scanned: 0, enrolled: 0 };
}

// Weekly parent digest: enrol every parent with a child into PARENT_DIGEST.
// The journey itself is single-step and reschedules weekly by re-seeding.
export async function seedParentDigestJourney() {
  const parents = await db.user.findMany({
    where: {
      role: "PARENT",
      isActive: true,
      parentOf: { some: {} },
    },
    select: { id: true },
    take: 500,
  });
  let enrolled = 0;
  for (const p of parents) {
    await enrollInDripJourney(p.id, "PARENT_DIGEST");
    enrolled += 1;
  }
  return { enrolled };
}
