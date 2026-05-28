"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  addChildAccountSchema,
  removeChildSchema,
  grantChildConsentSchema,
  enrollChildInCourseSchema,
} from "@/validators/action.schemas";
import { recordConsent, PRIVACY_VERSION, assertMinorConsent } from "@/lib/compliance";
import { hasActivePlanAtLeast } from "@/lib/subscription-access";
import { assertSameTenant } from "@/lib/tenant";
import { enrollUser } from "@/services/enrollment.service";
import { sendEnrollmentConfirmation } from "@/lib/email";

export async function addChildAccount(data: {
  name: string;
  email: string;
  password: string;
  dateOfBirth: string | Date;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }
    if (session.user.role !== "PARENT") {
      return { success: false, error: "Only parents can add child accounts" };
    }

    const parsed = addChildAccountSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const email = parsed.data.email.toLowerCase().trim();

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "An account with this email already exists" };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const parentId = session.user.id;

    // Create the child user and link them to the parent atomically so we
    // never leave an orphaned child account if the link insert fails.
    const child = await db.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: parsed.data.name,
          email,
          passwordHash,
          role: "STUDENT",
          dateOfBirth: parsed.data.dateOfBirth,
        },
      });
      await tx.parentChild.create({
        data: { parentId, childId: created.id },
      });
      return created;
    });

    return { success: true, data: { childId: child.id } };
  } catch (error) {
    console.error("addChildAccount action error:", error);
    return { success: false, error: "Failed to add child account" };
  }
}

export async function removeChild(childId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const parsed = removeChildSchema.safeParse({ childId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await db.parentChild.delete({
      where: {
        parentId_childId: {
          parentId: session.user.id,
          childId: parsed.data.childId,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("removeChild action error:", error);
    return { success: false, error: "Failed to remove child" };
  }
}

// Parent grants parental consent on behalf of a child. Appends a new
// ConsentRecord row (the ledger is immutable — withdrawal is a separate
// granted:false row). Required before a minor can enrol or purchase.
export async function grantChildConsent(input: {
  childId: string;
  type: "PARENTAL_COPPA" | "PARENTAL_GDPR_K";
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }
    if (session.user.role !== "PARENT") {
      return { success: false, error: "Only parents can grant child consent" };
    }

    const parsed = grantChildConsentSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const link = await db.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId: session.user.id,
          childId: parsed.data.childId,
        },
      },
    });
    if (!link) return { success: false, error: "Child not found" };

    const h = await headers().catch(() => null);
    const ipAddress =
      h?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h?.get("x-real-ip") ??
      null;
    const userAgent = h?.get("user-agent") ?? null;

    await recordConsent(
      {
        userId: parsed.data.childId,
        grantedById: session.user.id,
        ipAddress,
        userAgent,
      },
      parsed.data.type,
      PRIVACY_VERSION
    );

    revalidatePath(`/parent/children/${parsed.data.childId}`);
    return { success: true };
  } catch (error) {
    console.error("grantChildConsent action error:", error);
    return { success: false, error: "Failed to record consent" };
  }
}

// Parent enrols a linked child in a course. Mirrors enrollInCourse but
// runs all of the gates against the child: tenancy, plan entitlement, and
// minor-consent. The subscription gate uses the PARENT's plan — the
// household model: one parent subscription covers their linked children.
// One-time-purchase courses still must go through Stripe, not this path.
export async function enrollChildInCourse(input: {
  courseId: string;
  childId: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }
    if (session.user.role !== "PARENT") {
      return { success: false, error: "Only parents can enrol a child" };
    }

    const parsed = enrollChildInCourseSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const link = await db.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId: session.user.id,
          childId: parsed.data.childId,
        },
      },
    });
    if (!link) return { success: false, error: "Child not found" };

    const [course, child] = await Promise.all([
      db.course.findUnique({
        where: { id: parsed.data.courseId },
        select: {
          title: true,
          slug: true,
          status: true,
          isFree: true,
          price: true,
          requiredPlan: true,
          organizationId: true,
        },
      }),
      db.user.findUnique({
        where: { id: parsed.data.childId },
        select: { name: true, email: true, organizationId: true },
      }),
    ]);
    if (!course) return { success: false, error: "Course not found" };
    if (course.status !== "PUBLISHED") {
      return { success: false, error: "This course is not available for enrolment" };
    }
    if (!child) return { success: false, error: "Child not found" };

    // Tenant gate runs against the child — they're the one whose enrolment
    // is being created, so their org must reach this course (or the course
    // is global).
    const tenantError = assertSameTenant(
      { role: "STUDENT", organizationId: child.organizationId },
      course
    );
    if (tenantError) return { success: false, error: "Course not found" };

    const isFree = course.isFree || Number(course.price) === 0;
    if (!isFree) {
      if (course.requiredPlan) {
        // Household model: check the PARENT's subscription, not the child's.
        const ok = await hasActivePlanAtLeast(session.user.id, course.requiredPlan);
        if (!ok) {
          return {
            success: false,
            error: "This course is included with a subscription — please subscribe first",
          };
        }
      } else {
        return {
          success: false,
          error: "This course requires payment — please purchase it from the catalog first",
        };
      }
    }

    const consent = await assertMinorConsent(parsed.data.childId);
    if (!consent.ok) {
      return {
        success: false,
        error:
          consent.reason === "consent_withdrawn"
            ? "Consent for this child has been withdrawn"
            : consent.reason === "dob_missing"
              ? "Please add the child's date of birth before enrolling"
              : "Please grant parental consent for this child before enrolling",
      };
    }

    const enrollment = await enrollUser(parsed.data.childId, parsed.data.courseId);
    if (!enrollment) {
      return { success: false, error: "Failed to enrol" };
    }

    if (child.email) {
      sendEnrollmentConfirmation(
        child.email,
        child.name || "Student",
        course.title
      ).catch(() => null);
    }

    revalidatePath(`/parent/children/${parsed.data.childId}`);
    return { success: true, data: enrollment };
  } catch (error) {
    console.error("enrollChildInCourse action error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
