// Client-safe constants, types, and pure helpers for the admin "Preview as role"
// feature. Kept free of server-only imports (no next/headers, no auth) so client
// components — the preview banner and switcher — can import the type and the
// cookie name without pulling the server machinery into the client bundle.
// The server-side reader (getViewContext) lives in `view-as.server.ts`, mirroring
// the consent.ts / consent.actions.ts split.

// httpOnly cookie holding the role an admin is currently previewing as. Honored
// ONLY when the real session role is an admin (see view-as.server.ts), so a
// cookie set on any other account is inert and can never elevate privilege.
export const PREVIEW_ROLE_COOKIE = "schulab_preview_role";

// Roles an admin may preview. Admin/Super-Admin are intentionally excluded —
// previewing "as admin" is just the admin's normal view.
export const PREVIEWABLE_ROLES = ["STUDENT", "TUTOR", "PARENT"] as const;
export type PreviewableRole = (typeof PREVIEWABLE_ROLES)[number];

export function isPreviewableRole(value: string | undefined | null): value is PreviewableRole {
  return value === "STUDENT" || value === "TUTOR" || value === "PARENT";
}
