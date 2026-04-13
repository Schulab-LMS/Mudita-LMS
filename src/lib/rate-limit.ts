/**
 * Simple in-memory rate limiter using a sliding window.
 * Suitable for single-instance deployments.
 * For multi-instance, replace with Redis-based rate limiting.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 600_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 300_000);

interface RateLimitConfig {
  /** Max number of requests allowed in the window */
  maxRequests: number;
  /** Window size in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  entry.timestamps.push(now);
  return {
    success: true,
    remaining: config.maxRequests - entry.timestamps.length,
  };
}

// Pre-configured rate limiters for common use cases
export const AUTH_RATE_LIMIT = { maxRequests: 5, windowSeconds: 60 };
export const REGISTER_RATE_LIMIT = { maxRequests: 3, windowSeconds: 60 };
export const FORGOT_PASSWORD_RATE_LIMIT = { maxRequests: 3, windowSeconds: 300 };
export const EMAIL_VERIFY_SEND_RATE_LIMIT = { maxRequests: 3, windowSeconds: 300 };
export const EMAIL_VERIFY_CONSUME_RATE_LIMIT = { maxRequests: 10, windowSeconds: 300 };
export const SEND_MESSAGE_RATE_LIMIT = { maxRequests: 30, windowSeconds: 60 };
export const HELP_FEEDBACK_RATE_LIMIT = { maxRequests: 10, windowSeconds: 300 };
