"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTutorByUserId, updateTutorAvailability } from "@/services/tutor.service";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { audit } from "@/lib/audit";
import {
  submitTutorApplicationSchema,
  updateTutorProfileSchema,
  setAvailabilitySchema,
  tutorIdSchema,
} from "@/validators/action.schemas";
import {
  sendTutorApprovedEmail,
  sendTutorRejectedEmail,
  sendNewTutorApplicationEmail,
} from "@/lib/email";

export async function submitTutorApplication(data: {
  bio: string;
  hourlyRate: number;
  subjects: string[];
  languages: string[];
  headline?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Not authenticated" };

    const parsed = submitTutorApplicationSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const existing = await getTutorByUserId(session.user.id);
    if (existing) return { success: false, error: "Tutor profile already exists" };

    await db.tutorProfile.create({
      data: {
        userId: session.user.id,
        bio: parsed.data.bio,
        hourlyRate: parsed.data.hourlyRate,
        subjects: parsed.data.subjects,
        languages: parsed.data.languages,
        headline: parsed.data.headline,
      },
    });

    // Notify admins of new application (non-blocking)
    sendNewTutorApplicationEmail(
      session.user.name || "Unknown",
      session.user.email || ""
    ).catch(() => null);

    // Create in-app notification for admins
    try {
      const admins = await db.user.findMany({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        select: { id: true },
      });
      if (admins.length > 0) {
        await db.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: "New Tutor Application",
            body: `${session.user.name} (${session.user.email}) submitted a tutor application.`,
            type: "TUTOR_APPLICATION",
          })),
        });
      }
    } catch {
      // non-critical
    }

    revalidatePath("/tutor");
    return { success: true };
  } catch (error) {
    console.error("submitTutorApplication error:", error);
    return { success: false, error: "Failed to submit application" };
  }
}

export async function updateTutorProfile(data: {
  bio?: string;
  hourlyRate?: number;
  subjects?: string[];
  languages?: string[];
  headline?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Not authenticated" };

    const parsed = updateTutorProfileSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const tutor = await getTutorByUserId(session.user.id);
    if (!tutor) return { success: false, error: "Tutor profile not found" };

    await db.tutorProfile.update({
      where: { id: tutor.id },
      data: {
        ...(parsed.data.bio !== undefined && { bio: parsed.data.bio }),
        ...(parsed.data.hourlyRate !== undefined && { hourlyRate: parsed.data.hourlyRate }),
        ...(parsed.data.subjects !== undefined && { subjects: parsed.data.subjects }),
        ...(parsed.data.languages !== undefined && { languages: parsed.data.languages }),
        ...(parsed.data.headline !== undefined && { headline: parsed.data.headline }),
      },
    });

    revalidatePath("/tutor/profile");
    return { success: true };
  } catch (error) {
    console.error("updateTutorProfile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function setAvailability(
  slots: { dayOfWeek: number; startTime: string; endTime: string; timezone: string }[]
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Not authenticated" };

    const parsed = setAvailabilitySchema.safeParse({ slots });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const tutor = await getTutorByUserId(session.user.id);
    if (!tutor) return { success: false, error: "Tutor profile not found" };

    const result = await updateTutorAvailability(tutor.id, parsed.data.slots);
    if ("error" in result) return { success: false, error: result.error };

    revalidatePath("/tutor/availability");
    return { success: true };
  } catch (error) {
    console.error("setAvailability error:", error);
    return { success: false, error: "Failed to update availability" };
  }
}

// ── Admin actions ───────────────────────────────────────────────────────

export async function verifyTutor(tutorProfileId: string) {
  try {
    const session = await requireAdmin();
    const parsed = tutorIdSchema.safeParse({ tutorProfileId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const tutor = await db.tutorProfile.update({
      where: { id: parsed.data.tutorProfileId },
      data: { isVerified: true },
      include: { user: { select: { email: true, name: true } } },
    });
    await audit({
      actorId: session.user!.id,
      action: "tutor.verify",
      resource: "TutorProfile",
      resourceId: parsed.data.tutorProfileId,
      metadata: { tutorUserId: tutor.userId },
    });

    // Send approval email (non-blocking)
    if (tutor.user.email) {
      sendTutorApprovedEmail(tutor.user.email, tutor.user.name || "Tutor").catch(() => null);
    }

    // In-app notification for tutor
    try {
      await db.notification.create({
        data: {
          userId: tutor.userId,
          title: "Application Approved",
          body: "Your tutor application has been approved! You can now set your availability and start accepting bookings.",
          type: "TUTOR_APPROVED",
        },
      });
    } catch { /* non-critical */ }

    revalidatePath("/admin/tutors");
    return { success: true };
  } catch (error) {
    console.error("verifyTutor error:", error);
    return { success: false, error: "Failed to verify tutor" };
  }
}

export async function rejectTutor(tutorProfileId: string) {
  try {
    const session = await requireAdmin();
    const parsed = tutorIdSchema.safeParse({ tutorProfileId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const tutor = await db.tutorProfile.update({
      where: { id: parsed.data.tutorProfileId },
      data: { isVerified: false },
      include: { user: { select: { email: true, name: true } } },
    });
    await audit({
      actorId: session.user!.id,
      action: "tutor.reject",
      resource: "TutorProfile",
      resourceId: parsed.data.tutorProfileId,
      metadata: { tutorUserId: tutor.userId },
    });

    // Send rejection email (non-blocking)
    if (tutor.user.email) {
      sendTutorRejectedEmail(tutor.user.email, tutor.user.name || "Tutor").catch(() => null);
    }

    // In-app notification for tutor
    try {
      await db.notification.create({
        data: {
          userId: tutor.userId,
          title: "Verification Revoked",
          body: "Your tutor verification has been revoked. Please update your profile and it will be reviewed again.",
          type: "TUTOR_REJECTED",
        },
      });
    } catch { /* non-critical */ }

    revalidatePath("/admin/tutors");
    return { success: true };
  } catch (error) {
    console.error("rejectTutor error:", error);
    return { success: false, error: "Failed to reject tutor" };
  }
}

export async function deleteTutorProfile(tutorProfileId: string) {
  try {
    const session = await requireAdmin();
    const parsed = tutorIdSchema.safeParse({ tutorProfileId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const existing = await db.tutorProfile.findUnique({
      where: { id: parsed.data.tutorProfileId },
      select: { userId: true },
    });
    await db.tutorProfile.delete({ where: { id: parsed.data.tutorProfileId } });
    await audit({
      actorId: session.user!.id,
      action: "tutor.delete_profile",
      resource: "TutorProfile",
      resourceId: parsed.data.tutorProfileId,
      metadata: existing ? { tutorUserId: existing.userId } : null,
    });
    revalidatePath("/admin/tutors");
    return { success: true };
  } catch (error) {
    console.error("deleteTutorProfile error:", error);
    return { success: false, error: "Failed to delete tutor profile" };
  }
}
