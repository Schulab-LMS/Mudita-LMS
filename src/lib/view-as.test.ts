import { describe, it, expect, vi, beforeEach } from "vitest";

// Unit tests for the effective-role resolver behind the admin "Preview as role"
// overlay. The security-critical invariant: a preview cookie only takes effect
// for a real admin, so it can never elevate a non-admin's privileges.

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { getViewContext, isInPreviewMode } from "./view-as.server";
import { PREVIEW_ROLE_COOKIE } from "./view-as";

function mockSession(role: string | null) {
  vi.mocked(auth).mockResolvedValue(
    (role ? { user: { id: "u1", role } } : null) as never
  );
}

function mockPreviewCookie(value: string | undefined) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) =>
      name === PREVIEW_ROLE_COOKIE && value !== undefined ? { name, value } : undefined,
  } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getViewContext", () => {
  it("an admin with a valid preview cookie takes on the previewed role", async () => {
    mockSession("ADMIN");
    mockPreviewCookie("STUDENT");
    const ctx = await getViewContext();
    expect(ctx.realRole).toBe("ADMIN");
    expect(ctx.effectiveRole).toBe("STUDENT");
    expect(ctx.isPreviewing).toBe(true);
    expect(ctx.previewRole).toBe("STUDENT");
  });

  it("a SUPER_ADMIN can preview too", async () => {
    mockSession("SUPER_ADMIN");
    mockPreviewCookie("TUTOR");
    const ctx = await getViewContext();
    expect(ctx.effectiveRole).toBe("TUTOR");
    expect(ctx.isPreviewing).toBe(true);
  });

  it("a non-admin with a preview cookie is unaffected (the cookie is inert)", async () => {
    mockSession("STUDENT");
    mockPreviewCookie("TUTOR");
    const ctx = await getViewContext();
    expect(ctx.effectiveRole).toBe("STUDENT");
    expect(ctx.isPreviewing).toBe(false);
    expect(ctx.previewRole).toBeNull();
  });

  it("an admin with no preview cookie keeps their real role", async () => {
    mockSession("ADMIN");
    mockPreviewCookie(undefined);
    const ctx = await getViewContext();
    expect(ctx.effectiveRole).toBe("ADMIN");
    expect(ctx.isPreviewing).toBe(false);
  });

  it("an invalid cookie value is ignored", async () => {
    mockSession("ADMIN");
    mockPreviewCookie("WIZARD");
    const ctx = await getViewContext();
    expect(ctx.effectiveRole).toBe("ADMIN");
    expect(ctx.isPreviewing).toBe(false);
  });

  it("ADMIN is not a previewable role — that cookie value is ignored", async () => {
    mockSession("ADMIN");
    mockPreviewCookie("ADMIN");
    const ctx = await getViewContext();
    expect(ctx.effectiveRole).toBe("ADMIN");
    expect(ctx.isPreviewing).toBe(false);
  });

  it("no session → undefined roles and not previewing", async () => {
    mockSession(null);
    mockPreviewCookie("STUDENT");
    const ctx = await getViewContext();
    expect(ctx.realRole).toBeUndefined();
    expect(ctx.effectiveRole).toBeUndefined();
    expect(ctx.isPreviewing).toBe(false);
  });
});

describe("isInPreviewMode", () => {
  it("is true for an admin actively previewing", async () => {
    mockSession("ADMIN");
    mockPreviewCookie("PARENT");
    expect(await isInPreviewMode()).toBe(true);
  });

  it("is false for a normal user", async () => {
    mockSession("STUDENT");
    mockPreviewCookie(undefined);
    expect(await isInPreviewMode()).toBe(false);
  });
});
