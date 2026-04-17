"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { EVENTS, track } from "@/lib/analytics";
import {
  completeOnboarding,
  upsertOnboardingProfile,
} from "@/services/onboarding.service";
import { enrollInDripJourney } from "@/services/drip.service";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

const saveStepSchema = z.object({
  goals: z.array(z.string().min(1).max(60)).max(8).optional(),
  interests: z.array(z.string().min(1).max(60)).max(20).optional(),
  preferredSubjects: z.array(z.string().min(1).max(60)).max(20).optional(),
  availableHours: z.number().int().min(0).max(168).optional(),
  experience: z.string().max(60).optional(),
});

export async function saveOnboardingStep(
  input: z.infer<typeof saveStepSchema>
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = saveStepSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const profile = await upsertOnboardingProfile(session.user.id, parsed.data);
    return { success: true, data: { id: profile.id } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save onboarding",
    };
  }
}

export async function finishOnboarding(): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const profile = await completeOnboarding(session.user.id);
    await enrollInDripJourney(session.user.id, "ACTIVATION");
    track({
      name: "onboarding_completed",
      userId: session.user.id,
    }).catch(() => null);
    // Re-export sign-up success beacon so the activation funnel has a clean
    // step-1 marker that fires *after* the learner has declared a goal.
    track({
      name: EVENTS.USER_SIGNED_UP,
      userId: session.user.id,
      properties: { onboarded: true },
    }).catch(() => null);
    return { success: true, data: { id: profile.id } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to complete onboarding",
    };
  }
}
