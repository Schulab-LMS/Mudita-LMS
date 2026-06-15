import { cookies } from "next/headers";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import {
  PREVIEW_ROLE_COOKIE,
  isPreviewableRole,
  type PreviewableRole,
} from "@/lib/view-as";

// Server-side resolver for the admin role-preview overlay. Read-only: it never
// writes the cookie (that's the job of the preview server actions) so it is safe
// to call during server-component render as well as inside server actions.

export interface ViewContext {
  session: Session | null;
  /** The viewer's true role from their session. */
  realRole: string | undefined;
  /** The role the app should render as — the preview role when previewing, else realRole. */
  effectiveRole: string | undefined;
  isPreviewing: boolean;
  previewRole: PreviewableRole | null;
}

/**
 * Resolve the effective role for the current request. A preview cookie is honored
 * ONLY when the real session role is an admin, so the overlay can never grant a
 * non-admin a different role — a leaked or forged cookie is inert.
 */
export async function getViewContext(): Promise<ViewContext> {
  const session = await auth();
  const realRole = session?.user?.role;

  let previewRole: PreviewableRole | null = null;
  if (isAdminRole(realRole)) {
    const jar = await cookies();
    const raw = jar.get(PREVIEW_ROLE_COOKIE)?.value;
    if (isPreviewableRole(raw)) previewRole = raw;
  }

  return {
    session,
    realRole,
    effectiveRole: previewRole ?? realRole,
    isPreviewing: previewRole !== null,
    previewRole,
  };
}

// User-facing message for a write blocked by read-only preview mode.
export const PREVIEW_WRITE_BLOCKED_MESSAGE =
  "This action is disabled while previewing as another role. Exit preview to make changes.";

/**
 * True when the current request is an admin in role-preview mode. Role preview
 * is strictly read-only, so mutating server actions short-circuit on this and
 * return PREVIEW_WRITE_BLOCKED_MESSAGE — preview never writes data under the
 * admin's own identity.
 */
export async function isInPreviewMode(): Promise<boolean> {
  return (await getViewContext()).isPreviewing;
}
