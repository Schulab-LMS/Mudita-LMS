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
  withdrawChildConsentSchema,
  bulkGrantChildConsentSchema,
  enrollChildInCourseSchema,
} from "@/validators/action.schemas";
import {
  recordConsent,
  PRIVACY_VERSION,
  assertMinorConsent,
  isMinor,
} from "@/lib/compliance";
import { hasActivePlanAtLeast } from "@/lib/subscription-access";
import { assertSameTenant } from "@/lib/tenant";
import { enrollUser } from "@/services/enrollment.service";
import { getUnmetPrerequisites } from "@/services/prerequisite.service";
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

// Parent withdraws an earlier parental consent for a linked child. Appends
// a `granted: false` row to the ledger — never updates the prior grant.
// `assertMinorConsent` reads the most recent row, so a withdrawal blocks
// the child from new enrolments, purchases, and lesson access going
// forward.
export async function withdrawChildConsent(input: {
  childId: string;
  type: "PARENTAL_COPPA" | "PARENTAL_GDPR_K";
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }
    if (session.user.role !== "PARENT") {
      return { success: false, error: "Only parents can withdraw child consent" };
    }

    const parsed = withdrawChildConsentSchema.safeParse(input);
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
      PRIVACY_VERSION,
      false
    );

    revalidatePath(`/parent/children/${parsed.data.childId}`);
    revalidatePath("/parent/children");
    return { success: true };
  } catch (error) {
    console.error("withdrawChildConsent action error:", error);
    return { success: false, error: "Failed to record withdrawal" };
  }
}

// Grants parental consent for every linked child who is a minor without an
// active consent on record. Writes happen in one transaction so the legal
// record either fully reflects the parent's action or not at all. IP/UA are
// captured once and stamped onto every row — the parent's signal is one
// signal applied to N children, not N independent signals.
export async function bulkGrantChildConsent(input: {
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

    const parsed = bulkGrantChildConsentSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const parentId = session.user.id;
    const links = await db.parentChild.findMany({
      where: { parentId },
      include: {
        child: {
          select: {
            id: true,
            dateOfBirth: true,
            consentRecords: {
              where: {
                type: { in: ["PARENTAL_COPPA", "PARENTAL_GDPR_K"] },
              },
              orderBy: { grantedAt: "desc" },
              take: 1,
              select: { granted: true },
            },
          },
        },
      },
    });

    const candidates = links
      .map((l) => l.child)
      .filter((c) => c.dateOfBirth && isMinor(c.dateOfBirth))
      .filter((c) => !c.consentRecords[0]?.granted);

    if (candidates.length === 0) {
      return { success: true, data: { granted: 0 } };
    }

    const h = await headers().catch(() => null);
    const ipAddress =
      h?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h?.get("x-real-ip") ??
      null;
    const userAgent = h?.get("user-agent") ?? null;

    await db.$transaction(
      candidates.map((c) =>
        db.consentRecord.create({
          data: {
            userId: c.id,
            grantedById: parentId,
            type: parsed.data.type,
            version: PRIVACY_VERSION,
            granted: true,
            ipAddress: ipAddress ?? undefined,
            userAgent: userAgent ?? undefined,
          },
        })
      )
    );

    revalidatePath("/parent/children");
    candidates.forEach((c) =>
      revalidatePath(`/parent/children/${c.id}`)
    );
    return { success: true, data: { granted: candidates.length } };
  } catch (error) {
    console.error("bulkGrantChildConsent action error:", error);
    return { success: false, error: "Failed to grant consent" };
  }
}

// Parent enrols a linked child in a course. Mirrors enrollInCourse but
// runs all of the gates against the child: tenancy, plan entitlement, and
// minor-consent. The subscription gate uses the PARENT's plan — the
// household model: one parent subscription covers their linked children.
// Individual course purchases are no longer supported; legacy paid courses
// (price > 0 with no requiredPlan) default to the lowest paid tier.
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

    // Zero price alone no longer means free — subscription courses are priced
    // at 0 and gated by requiredPlan.
    const isFree =
      course.isFree || (Number(course.price) <= 0 && !course.requiredPlan);
    if (!isFree) {
      // Household model: check the PARENT's subscription, not the child's.
      // Legacy paid courses without a requiredPlan fall back to LEARNER —
      // every paid course is subscription-only now.
      const requiredTier = course.requiredPlan ?? "LEARNER";
      const ok = await hasActivePlanAtLeast(session.user.id, requiredTier);
      if (!ok) {
        return {
          success: false,
          error:
            "This course is included with a subscription — subscribe to Solo, Family, or Custom to enrol your child",
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

    // Prerequisite gate, checked against the CHILD's completed courses.
    const unmet = await getUnmetPrerequisites(parsed.data.childId, parsed.data.courseId);
    if (unmet.length > 0) {
      const titles = unmet.map((c) => c.title);
      const list =
        titles.length === 1
          ? `"${titles[0]}"`
          : `${titles.slice(0, -1).map((t) => `"${t}"`).join(", ")} and "${titles[titles.length - 1]}"`;
      return { success: false, error: `Your child must complete ${list} before enrolling in this course` };
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

// Retained for type compatibility with older callers; new code shouldn't
// rely on the success branch.
type BuyCourseForChildResult =
  | { success: true; data: { url: string; sessionId: string } }
  | { success: false; error: string };

// Individual course purchases for children were retired alongside the
// learner-facing flow. The action stays so the parent UI gets a deterministic
// error instead of a 500 if it hasn't migrated yet. No Stripe call is made.
export async function buyCourseForChild(_input: {
  courseId: string;
  childId: string;
  couponCode?: string;
}): Promise<BuyCourseForChildResult> {
  return {
    success: false,
    error:
      "Individual course purchases are not available — subscribe to Solo, Family, or Custom and enrol your child instead.",
  };
}
