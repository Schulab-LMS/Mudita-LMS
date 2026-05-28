"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth-helpers";
import { isOrgAdmin, isPlatformAdmin } from "@/lib/tenant";

// Minimal management surface for Organisations. Phase 4 deliberately ships
// without a full admin UI — the seed file creates the initial orgs, and
// these actions are the smallest piece needed for SUPER_ADMIN to onboard a
// school and assign its first ORG_ADMIN. A richer UI lands in a later phase.

interface OkResult<T = void> {
  success: true;
  data?: T;
}
interface ErrResult {
  success: false;
  error: string;
}
type Result<T = void> = OkResult<T> | ErrResult;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export async function createOrganization(input: {
  name: string;
  slug?: string;
}): Promise<Result<{ id: string; slug: string }>> {
  try {
    await requireSuperAdmin();
    const name = input.name.trim();
    if (!name) return { success: false, error: "Name is required" };
    const slug = slugify(input.slug || name);
    if (!slug) return { success: false, error: "Slug must contain letters or numbers" };

    const existing = await db.organization.findUnique({ where: { slug } });
    if (existing) return { success: false, error: "An organisation with that slug already exists" };

    const org = await db.organization.create({ data: { name, slug } });
    revalidatePath("/admin");
    return { success: true, data: { id: org.id, slug: org.slug } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Assign a user to an organisation (or detach them by passing null). Can be
 * called by SUPER_ADMIN platform-wide, or by an ORG_ADMIN for users moving
 * INTO their own org from no-org status. ORG_ADMINs can't transfer users
 * between other orgs — only SUPER_ADMIN can.
 */
export async function assignUserToOrganization(
  userId: string,
  organizationId: string | null
): Promise<Result> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Not authenticated" };
    const caller = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, organizationId: true },
    });
    if (!caller) return { success: false, error: "Not authenticated" };

    const target = await db.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });
    if (!target) return { success: false, error: "User not found" };

    if (isPlatformAdmin(caller.role)) {
      // Anything goes.
    } else if (isOrgAdmin(caller.role)) {
      // ORG_ADMIN can pull a no-org user into their own org, or push one of
      // their org's users back to no-org. Cross-org transfers are
      // SUPER_ADMIN-only.
      const ownOrg = caller.organizationId;
      if (!ownOrg) return { success: false, error: "Org admin without an org assignment" };
      const allowed =
        (target.organizationId === null && organizationId === ownOrg) ||
        (target.organizationId === ownOrg && organizationId === null);
      if (!allowed) {
        return { success: false, error: "Only the platform admin can move users between organisations" };
      }
    } else {
      return { success: false, error: "Not authorised" };
    }

    if (organizationId) {
      const org = await db.organization.findUnique({ where: { id: organizationId } });
      if (!org) return { success: false, error: "Organisation not found" };
    }

    await db.user.update({
      where: { id: userId },
      data: { organizationId },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}
