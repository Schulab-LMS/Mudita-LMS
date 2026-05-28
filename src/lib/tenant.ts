import type { Role } from "@/generated/prisma/client";

// Multi-tenant primitives. The `Organization` model has lived in the schema
// as nullable scaffolding since P1. Phase 4 turns it into a soft enforcement
// layer at the service boundary without flipping any FK to NOT NULL — the
// migration to required-tenant is reserved for a later phase once we've
// verified no orphan rows exist in production.
//
// Semantics of a null `organizationId`:
//   - On a User: the user has no home tenant. They see global content only.
//     (Direct learners on the public marketing funnel are this case.)
//   - On a Course / Booking: the resource is GLOBAL — available to everyone.
//     Curriculum from the STEM-Curricula repo lands as null by default.
//
// `tenantScope(user)` returns a Prisma where-fragment that resolves to
// "rows owned by the user's org PLUS rows that are global". A user-less
// (anonymous) caller only sees global rows. A SUPER_ADMIN sees everything.

export interface TenantPrincipal {
  id?: string | null;
  role: Role | string;
  organizationId?: string | null;
}

const PLATFORM_GLOBAL_ROLES: ReadonlySet<string> = new Set([
  "ADMIN",
  "SUPER_ADMIN",
]);

/** Platform-wide admins see across every tenant. */
export function isPlatformAdmin(role: Role | string): boolean {
  return PLATFORM_GLOBAL_ROLES.has(role);
}

/** Org-scoped admin (e.g. a school's IT lead). Not a platform admin. */
export function isOrgAdmin(role: Role | string): boolean {
  return role === "ORG_ADMIN";
}

/**
 * Prisma where-fragment that restricts rows to (a) global rows
 * (organizationId IS NULL) plus (b) rows owned by the principal's org.
 * Platform admins skip the filter entirely.
 *
 *   const where = { status: "PUBLISHED", ...tenantScope(user) };
 */
export function tenantScope(
  principal: TenantPrincipal | null | undefined
): Record<string, never> | { OR: Array<{ organizationId: string | null }> } {
  if (principal && isPlatformAdmin(principal.role)) return {};
  const orgId = principal?.organizationId ?? null;
  if (!orgId) {
    // No org membership — only global rows are visible.
    return { OR: [{ organizationId: null }] };
  }
  return {
    OR: [{ organizationId: null }, { organizationId: orgId }],
  };
}

/**
 * Throw-style guard for write paths. Use when one resource targets another
 * (e.g. a student enrolling in a course) and they must share a tenant. A
 * global resource (organizationId null) is reachable from any tenant.
 *
 * Returns `null` on success, an error string on failure — never throws so
 * callers can short-circuit with the same `{ success: false, error }`
 * shape used elsewhere.
 */
export function assertSameTenant(
  principal: TenantPrincipal,
  resource: { organizationId?: string | null }
): string | null {
  if (isPlatformAdmin(principal.role)) return null;
  const principalOrg = principal.organizationId ?? null;
  const resourceOrg = resource.organizationId ?? null;
  // Global resources are reachable from any tenant.
  if (resourceOrg === null) return null;
  if (principalOrg === resourceOrg) return null;
  return "This resource belongs to a different organisation";
}

/**
 * For pairs of resources that must be in the same tenant (e.g. tutor and
 * student on a Booking). Returns null on success, or an error string. Global
 * resources line up with anything.
 */
export function assertResourcesShareTenant(
  a: { organizationId?: string | null },
  b: { organizationId?: string | null }
): string | null {
  const aOrg = a.organizationId ?? null;
  const bOrg = b.organizationId ?? null;
  if (aOrg === null || bOrg === null) return null;
  if (aOrg === bOrg) return null;
  return "These resources belong to different organisations";
}
