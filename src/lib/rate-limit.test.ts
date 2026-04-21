import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit } from "./rate-limit";

// REDIS_URL is unset in the test environment so these tests exercise the
// in-memory fallback deterministically. The Redis path is covered by
// production integration, not unit tests.

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to maxRequests within the window", async () => {
    const cfg = { maxRequests: 3, windowSeconds: 60 };
    const key = `t:allow:${Math.random()}`;
    expect((await rateLimit(key, cfg)).success).toBe(true);
    expect((await rateLimit(key, cfg)).success).toBe(true);
    expect((await rateLimit(key, cfg)).success).toBe(true);
  });

  it("rejects the next request after the limit is hit", async () => {
    const cfg = { maxRequests: 2, windowSeconds: 60 };
    const key = `t:reject:${Math.random()}`;
    await rateLimit(key, cfg);
    await rateLimit(key, cfg);
    const result = await rateLimit(key, cfg);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks remaining count", async () => {
    const cfg = { maxRequests: 3, windowSeconds: 60 };
    const key = `t:remaining:${Math.random()}`;
    expect((await rateLimit(key, cfg)).remaining).toBe(2);
    expect((await rateLimit(key, cfg)).remaining).toBe(1);
    expect((await rateLimit(key, cfg)).remaining).toBe(0);
  });

  it("allows new requests after the window expires", async () => {
    const cfg = { maxRequests: 1, windowSeconds: 10 };
    const key = `t:expire:${Math.random()}`;
    expect((await rateLimit(key, cfg)).success).toBe(true);
    expect((await rateLimit(key, cfg)).success).toBe(false);
    vi.advanceTimersByTime(11_000);
    expect((await rateLimit(key, cfg)).success).toBe(true);
  });

  it("isolates different keys", async () => {
    const cfg = { maxRequests: 1, windowSeconds: 60 };
    const k1 = `t:iso-a:${Math.random()}`;
    const k2 = `t:iso-b:${Math.random()}`;
    expect((await rateLimit(k1, cfg)).success).toBe(true);
    expect((await rateLimit(k2, cfg)).success).toBe(true);
    expect((await rateLimit(k1, cfg)).success).toBe(false);
    expect((await rateLimit(k2, cfg)).success).toBe(false);
  });
});
