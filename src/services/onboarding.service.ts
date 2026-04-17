import { db } from "@/lib/db";

// Onboarding is a quick-answer questionnaire run right after sign-up. Each
// step persists partial state so users can drop in/out without losing work.
// Completing the wizard sets completedAt and enrols the user into the
// ACTIVATION drip journey (see services/drip.service).

export type OnboardingInput = {
  goals?: string[];
  interests?: string[];
  preferredSubjects?: string[];
  availableHours?: number | null;
  experience?: string | null;
};

export async function upsertOnboardingProfile(
  userId: string,
  input: OnboardingInput
) {
  return db.onboardingProfile.upsert({
    where: { userId },
    create: {
      userId,
      goals: input.goals ?? [],
      interests: input.interests ?? [],
      preferredSubjects: input.preferredSubjects ?? [],
      availableHours: input.availableHours ?? null,
      experience: input.experience ?? null,
    },
    update: {
      goals: input.goals ?? undefined,
      interests: input.interests ?? undefined,
      preferredSubjects: input.preferredSubjects ?? undefined,
      availableHours: input.availableHours ?? undefined,
      experience: input.experience ?? undefined,
    },
  });
}

export async function completeOnboarding(userId: string) {
  return db.onboardingProfile.upsert({
    where: { userId },
    create: {
      userId,
      completedAt: new Date(),
      goals: [],
      interests: [],
      preferredSubjects: [],
    },
    update: { completedAt: new Date() },
  });
}

export async function getOnboardingProfile(userId: string) {
  return db.onboardingProfile.findUnique({ where: { userId } });
}
