import { createHash, randomBytes } from "crypto";

// Password-reset and email-verification links use high-entropy random
// strings (32 bytes, 256 bits). We store only a SHA-256 hash of the token
// in the DB so that a DB dump doesn't hand an attacker working reset links.
// The plaintext token lives only in the email we send. SHA-256 is the
// right primitive here — unlike passwords, these are long random nonces
// so we don't need bcrypt's slow key-stretching.
//
// Changing the hash function later is fine: we can include a version prefix
// (e.g. "v2:") in the stored value and fall back to the old scheme during
// the roll-over window. Tokens are short-lived (≤24h) so a flip-day
// invalidation is acceptable.

const TOKEN_BYTES = 32;

export function generateVerificationToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export function hashVerificationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
