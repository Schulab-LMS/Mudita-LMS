import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to maxRequests within the window", () => {
    const cfg = { maxRequests: 3, windowSeconds: 60 };
    const key = `t:allow:${Math.random()}`;
    expect(rateLimit(key, cfg).success).toBe(true);
    expect(rateLimit(key, cfg).success).toBe(true);
    expect(rateLimit(key, cfg).success).toBe(true);
  });

  it("rejects the next request after the limit is hit", () => {
    const cfg = { maxRequests: 2, windowSeconds: 60 };
    const key = `t:reject:${Math.random()}`;
    rateLimit(key, cfg);
    rateLimit(key, cfg);
    const result = rateLimit(key, cfg);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks remaining count", () => {
    const cfg = { maxRequests: 3, windowSeconds: 60 };
    const key = `t:remaining:${Math.random()}`;
    expect(rateLimit(key, cfg).remaining).toBe(2);
    expect(rateLimit(key, cfg).remaining).toBe(1);
    expect(rateLimit(key, cfg).remaining).toBe(0);
  });

  it("allows new requests after the window expires", () => {
    const cfg = { maxRequests: 1, windowSeconds: 10 };
    const key = `t:expire:${Math.random()}`;
    expect(rateLimit(key, cfg).success).toBe(true);
    expect(rateLimit(key, cfg).success).toBe(false);
    vi.advanceTimersByTime(11_000);
    expect(rateLimit(key, cfg).success).toBe(true);
  });

  it("isolates different keys", () => {
    const cfg = { maxRequests: 1, windowSeconds: 60 };
    const k1 = `t:iso-a:${Math.random()}`;
    const k2 = `t:iso-b:${Math.random()}`;
    expect(rateLimit(k1, cfg).success).toBe(true);
    expect(rateLimit(k2, cfg).success).toBe(true);
    expect(rateLimit(k1, cfg).success).toBe(false);
    expect(rateLimit(k2, cfg).success).toBe(false);
  });
});
