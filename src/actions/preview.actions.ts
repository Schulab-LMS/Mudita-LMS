"use server";

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { audit } from "@/lib/audit";
import { PREVIEW_ROLE_COOKIE, isPreviewableRole, type PreviewableRole } from "@/lib/view-as";

// Enter / leave the admin "Preview as role" overlay. Only admins may set a
// preview; the cookie is httpOnly + session-length and is ignored server-side
// for any non-admin, so this can never elevate privilege. Both transitions are
// written to the audit log.

export async function setPreviewRole(role: PreviewableRole) {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return { success: false as const, error: "Forbidden" };
  }
  if (!isPreviewableRole(role)) {
    return { success: false as const, error: "Invalid role" };
  }

  const jar = await cookies();
  jar.set({
    name: PREVIEW_ROLE_COOKIE,
    value: role,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // No maxAge → session cookie. Also cleared explicitly via clearPreviewRole.
  });

  await audit({
    actorId: session.user.id,
    action: "PREVIEW_ROLE_START",
    resource: "preview",
    metadata: { role },
  });

  return { success: true as const };
}

export async function clearPreviewRole() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Not authenticated" };
  }

  const jar = await cookies();
  const previous = jar.get(PREVIEW_ROLE_COOKIE)?.value;
  jar.delete(PREVIEW_ROLE_COOKIE);

  if (previous) {
    await audit({
      actorId: session.user.id,
      action: "PREVIEW_ROLE_STOP",
      resource: "preview",
      metadata: { role: previous },
    });
  }

  return { success: true as const };
}
