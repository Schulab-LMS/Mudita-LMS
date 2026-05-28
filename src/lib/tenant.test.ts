import { describe, it, expect } from "vitest";
import {
  assertResourcesShareTenant,
  assertSameTenant,
  isOrgAdmin,
  isPlatformAdmin,
  tenantScope,
} from "./tenant";

describe("isPlatformAdmin / isOrgAdmin", () => {
  it("ADMIN and SUPER_ADMIN are platform admins", () => {
    expect(isPlatformAdmin("ADMIN")).toBe(true);
    expect(isPlatformAdmin("SUPER_ADMIN")).toBe(true);
  });

  it("ORG_ADMIN is not a platform admin", () => {
    expect(isPlatformAdmin("ORG_ADMIN")).toBe(false);
    expect(isOrgAdmin("ORG_ADMIN")).toBe(true);
  });

  it("STUDENT / TUTOR are neither", () => {
    expect(isPlatformAdmin("STUDENT")).toBe(false);
    expect(isOrgAdmin("STUDENT")).toBe(false);
    expect(isPlatformAdmin("TUTOR")).toBe(false);
    expect(isOrgAdmin("TUTOR")).toBe(false);
  });
});

describe("tenantScope", () => {
  it("returns an empty filter for platform admins (sees everything)", () => {
    expect(tenantScope({ role: "SUPER_ADMIN", organizationId: null })).toEqual({});
    expect(tenantScope({ role: "ADMIN", organizationId: "org-a" })).toEqual({});
  });

  it("limits anonymous viewers to global rows only", () => {
    expect(tenantScope(null)).toEqual({ OR: [{ organizationId: null }] });
    expect(tenantScope(undefined)).toEqual({ OR: [{ organizationId: null }] });
  });

  it("limits no-org users to global rows only", () => {
    expect(tenantScope({ role: "STUDENT", organizationId: null })).toEqual({
      OR: [{ organizationId: null }],
    });
  });

  it("allows org-scoped users to see global + their org's rows", () => {
    expect(
      tenantScope({ role: "STUDENT", organizationId: "org-a" })
    ).toEqual({
      OR: [{ organizationId: null }, { organizationId: "org-a" }],
    });
  });
});

describe("assertSameTenant", () => {
  it("passes platform admins through unconditionally", () => {
    expect(
      assertSameTenant(
        { role: "ADMIN", organizationId: null },
        { organizationId: "org-other" }
      )
    ).toBeNull();
  });

  it("lets anyone reach a global resource", () => {
    expect(
      assertSameTenant(
        { role: "STUDENT", organizationId: "org-a" },
        { organizationId: null }
      )
    ).toBeNull();
    expect(
      assertSameTenant({ role: "STUDENT", organizationId: null }, { organizationId: null })
    ).toBeNull();
  });

  it("matches same-org pairs", () => {
    expect(
      assertSameTenant(
        { role: "STUDENT", organizationId: "org-a" },
        { organizationId: "org-a" }
      )
    ).toBeNull();
  });

  it("rejects cross-org access", () => {
    expect(
      assertSameTenant(
        { role: "STUDENT", organizationId: "org-a" },
        { organizationId: "org-b" }
      )
    ).toMatch(/different organisation/i);
  });

  it("rejects an un-tenanted user trying to reach a tenant-scoped resource", () => {
    expect(
      assertSameTenant(
        { role: "STUDENT", organizationId: null },
        { organizationId: "org-a" }
      )
    ).toMatch(/different organisation/i);
  });
});

describe("assertResourcesShareTenant", () => {
  it("global resources line up with anything", () => {
    expect(
      assertResourcesShareTenant({ organizationId: null }, { organizationId: "org-a" })
    ).toBeNull();
    expect(
      assertResourcesShareTenant({ organizationId: "org-a" }, { organizationId: null })
    ).toBeNull();
    expect(
      assertResourcesShareTenant({ organizationId: null }, { organizationId: null })
    ).toBeNull();
  });

  it("matches identical orgs", () => {
    expect(
      assertResourcesShareTenant(
        { organizationId: "org-a" },
        { organizationId: "org-a" }
      )
    ).toBeNull();
  });

  it("rejects different orgs", () => {
    expect(
      assertResourcesShareTenant(
        { organizationId: "org-a" },
        { organizationId: "org-b" }
      )
    ).toMatch(/different organisations/i);
  });
});
