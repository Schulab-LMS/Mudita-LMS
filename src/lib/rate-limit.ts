/**
 * Sliding-window rate limiter.
 *
 * When REDIS_URL is set, requests are counted across instances using a
 * sorted-set-per-key plus an atomic Lua script — so horizontally scaled
 * deployments share one counter instead of each instance holding its own.
 * Without REDIS_URL (local dev, single-container), we fall back to an
 * in-process Map so the existing behaviour is preserved.
 */

import Redis from "ioredis";

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

// ─── Redis (multi-instance) ────────────────────────────────────────
// Lazily constructed — unit tests run without REDIS_URL and should not
// try to open a socket.
let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (redisClient) return redisClient;
  redisClient = new Redis(url, {
    // Fail fast if the Redis instance is unreachable instead of hanging
    // the request for 30s+.
    maxRetriesPerRequest: 2,
    connectTimeout: 1_000,
    lazyConnect: false,
  });
  redisClient.on("error", (err) => {
    console.error("[rate-limit] redis error:", err.message);
  });
  return redisClient;
}

// Atomic sliding-window check:
//   1. drop timestamps older than (now - window)
//   2. if count >= max → reject, return the oldest surviving score so we
//      can compute retry-after without a second round-trip
//   3. otherwise add a new member and refresh the TTL
// Members are "<score>-<random>" so two requests arriving in the same
// millisecond don't collide in the sorted set.
const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local maxReq = tonumber(ARGV[3])
local member = ARGV[4]
redis.call('ZREMRANGEBYSCORE', key, '-inf', now - windowMs)
local count = redis.call('ZCARD', key)
if count >= maxReq then
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  return {0, 0, tonumber(oldest[2])}
end
redis.call('ZADD', key, now, member)
redis.call('PEXPIRE', key, windowMs)
return {1, maxReq - count - 1, 0}
`;

async function rateLimitRedis(
  redis: Redis,
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const member = `${now}-${Math.random().toString(36).slice(2, 10)}`;

  const res = (await redis.eval(
    SLIDING_WINDOW_LUA,
    1,
    key,
    now,
    windowMs,
    config.maxRequests,
    member
  )) as [number, number, number];

  const [allowed, remaining, oldestScore] = res;
  if (allowed === 1) {
    return { success: true, remaining };
  }
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((oldestScore + windowMs - now) / 1000)
  );
  return { success: false, remaining: 0, retryAfterSeconds };
}

// ─── In-memory fallback (single-instance / tests) ───────────────────
interface RateLimitEntry {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitEntry>();

// Periodic sweep so entries that go quiet don't leak forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 600_000);
    if (entry.timestamps.length === 0) memoryStore.delete(key);
  }
}, 300_000);

function rateLimitMemory(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = memoryStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    memoryStore.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return { success: false, remaining: 0, retryAfterSeconds };
  }

  entry.timestamps.push(now);
  return {
    success: true,
    remaining: config.maxRequests - entry.timestamps.length,
  };
}

// ─── Public API ─────────────────────────────────────────────────────
export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) return rateLimitMemory(key, config);

  try {
    return await rateLimitRedis(redis, key, config);
  } catch (err) {
    // If Redis is momentarily unreachable we fail open to the in-memory
    // limiter rather than locking every user out. Noisy logs surface
    // the degradation without bringing traffic down.
    console.error("[rate-limit] redis fallback:", err);
    return rateLimitMemory(key, config);
  }
}

// Pre-configured rate limiters for common use cases
export const AUTH_RATE_LIMIT = { maxRequests: 5, windowSeconds: 60 };
export const REGISTER_RATE_LIMIT = { maxRequests: 3, windowSeconds: 60 };
export const FORGOT_PASSWORD_RATE_LIMIT = { maxRequests: 3, windowSeconds: 300 };
export const EMAIL_VERIFY_SEND_RATE_LIMIT = { maxRequests: 3, windowSeconds: 300 };
export const EMAIL_VERIFY_CONSUME_RATE_LIMIT = { maxRequests: 10, windowSeconds: 300 };
export const SEND_MESSAGE_RATE_LIMIT = { maxRequests: 30, windowSeconds: 60 };
export const HELP_FEEDBACK_RATE_LIMIT = { maxRequests: 10, windowSeconds: 300 };
