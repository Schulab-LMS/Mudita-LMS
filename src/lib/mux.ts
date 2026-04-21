import { SignJWT, importPKCS8 } from "jose";

// Mux REST client. We deliberately don't use @mux/mux-node — the surface we
// need (create direct upload, fetch asset, sign playback JWTs) is small and
// well-documented, and keeping the dep footprint small matters for cold
// starts on the video endpoints.
//
// Required env:
//   MUX_TOKEN_ID              API access token id (Basic auth username)
//   MUX_TOKEN_SECRET          API access token secret (Basic auth password)
// Optional env (required for signed playback):
//   MUX_SIGNING_KEY_ID        Signing key id, used as the JWT `kid`
//   MUX_SIGNING_KEY_PRIVATE   PEM-encoded private key (PKCS#8)
// Optional env (required for webhooks):
//   MUX_WEBHOOK_SECRET        HMAC secret from Mux dashboard

const MUX_API_BASE = "https://api.mux.com";

export function isMuxConfigured(): boolean {
  return Boolean(process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET);
}

export function isMuxSigningConfigured(): boolean {
  return Boolean(
    process.env.MUX_SIGNING_KEY_ID && process.env.MUX_SIGNING_KEY_PRIVATE
  );
}

function authHeader(): string {
  const id = process.env.MUX_TOKEN_ID;
  const secret = process.env.MUX_TOKEN_SECRET;
  if (!id || !secret) {
    throw new Error("MUX_TOKEN_ID and MUX_TOKEN_SECRET must be set");
  }
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

async function muxFetch<T>(
  path: string,
  init?: Omit<RequestInit, "body"> & { body?: unknown }
): Promise<T> {
  const { body, headers, ...rest } = init ?? {};
  const serialisedBody =
    body !== undefined && typeof body !== "string"
      ? JSON.stringify(body)
      : (body as string | undefined);
  const res = await fetch(`${MUX_API_BASE}${path}`, {
    ...rest,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body: serialisedBody,
    // Video uploads/assets are per-request dynamic — never cache.
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Mux ${init?.method ?? "GET"} ${path} failed (${res.status}): ${text}`
    );
  }
  const json = (await res.json()) as { data: T };
  return json.data;
}

// ── Direct upload ────────────────────────────────────────────────────────

export type MuxDirectUpload = {
  id: string; // Upload id — used to poll for completion
  url: string; // Signed PUT URL valid for `timeout` seconds
  timeout: number; // Seconds until the URL expires
  status: "waiting" | "asset_created" | "errored" | "cancelled" | "timed_out";
  asset_id?: string; // Populated once Mux has received the upload
  new_asset_settings?: Record<string, unknown>;
};

export type MuxAsset = {
  id: string;
  status: "preparing" | "ready" | "errored";
  duration?: number;
  playback_ids?: { id: string; policy: "public" | "signed" }[];
  errors?: { messages: string[] };
};

// Creates a direct-upload URL the browser can PUT a file to. We default to
// signed playback so finished assets require a JWT to view.
export async function createDirectUpload(opts: {
  maxDurationSeconds?: number;
  corsOrigin?: string;
}): Promise<MuxDirectUpload> {
  return muxFetch<MuxDirectUpload>("/video/v1/uploads", {
    method: "POST",
    body: {
      cors_origin: opts.corsOrigin ?? "*",
      timeout: 3600,
      new_asset_settings: {
        playback_policy: [
          isMuxSigningConfigured() ? "signed" : "public",
        ],
        video_quality: "basic",
        ...(opts.maxDurationSeconds
          ? { max_resolution_tier: "1080p" }
          : {}),
      },
    },
  });
}

export async function getUpload(uploadId: string): Promise<MuxDirectUpload> {
  return muxFetch<MuxDirectUpload>(`/video/v1/uploads/${uploadId}`);
}

export async function getAsset(assetId: string): Promise<MuxAsset> {
  return muxFetch<MuxAsset>(`/video/v1/assets/${assetId}`);
}

export async function deleteAsset(assetId: string): Promise<void> {
  const res = await fetch(`${MUX_API_BASE}/video/v1/assets/${assetId}`, {
    method: "DELETE",
    headers: { Authorization: authHeader() },
  });
  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => "");
    throw new Error(`Mux DELETE asset failed (${res.status}): ${text}`);
  }
}

// ── Signed playback ──────────────────────────────────────────────────────

// Mux expects playback JWTs signed with RS256, using the signing key id as
// `kid`. `aud` encodes the resource type: "v" for video, "t" for thumbnail,
// "g" for GIF, "s" for storyboard.
export async function signPlaybackToken(opts: {
  playbackId: string;
  audience: "v" | "t" | "g" | "s";
  ttlSeconds?: number;
}): Promise<string> {
  const kid = process.env.MUX_SIGNING_KEY_ID;
  const pemRaw = process.env.MUX_SIGNING_KEY_PRIVATE;
  if (!kid || !pemRaw) {
    throw new Error(
      "MUX_SIGNING_KEY_ID and MUX_SIGNING_KEY_PRIVATE must be set for signed playback"
    );
  }
  // Env vars stored on hosts like Vercel can't contain real newlines, so
  // teams commonly encode the PEM with literal \n. Normalize either form.
  const pem = pemRaw.includes("\\n") ? pemRaw.replace(/\\n/g, "\n") : pemRaw;
  const key = await importPKCS8(pem, "RS256");
  const ttl = opts.ttlSeconds ?? 60 * 60; // 1h default
  return new SignJWT({ aud: opts.audience, sub: opts.playbackId })
    .setProtectedHeader({ alg: "RS256", kid, typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttl)
    .sign(key);
}

// Canonical URLs. When a playback id is signed we append `?token=…` — public
// ids render the same URL without a token.
export function playbackUrl(playbackId: string, token?: string | null): string {
  const base = `https://stream.mux.com/${playbackId}.m3u8`;
  return token ? `${base}?token=${token}` : base;
}

export function thumbnailUrl(playbackId: string, token?: string | null): string {
  const base = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640`;
  return token ? `${base}&token=${token}` : base;
}

// ── Webhook signature ────────────────────────────────────────────────────

// Mux sends `mux-signature: t=<unix>,v1=<hex>` where v1 is the HMAC-SHA256 of
// `${timestamp}.${body}` using MUX_WEBHOOK_SECRET. We validate with Node's
// crypto and a constant-time comparison.
export async function verifyWebhookSignature(opts: {
  rawBody: string;
  header: string | null;
  toleranceSeconds?: number;
}): Promise<boolean> {
  const secret = process.env.MUX_WEBHOOK_SECRET;
  if (!secret || !opts.header) return false;

  const parts = Object.fromEntries(
    opts.header.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), (v ?? "").trim()];
    })
  );
  const timestamp = parts["t"];
  const v1 = parts["v1"];
  if (!timestamp || !v1) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (Number.isNaN(age) || age > (opts.toleranceSeconds ?? 300)) return false;

  const { createHmac, timingSafeEqual } = await import("node:crypto");
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${opts.rawBody}`)
    .digest("hex");
  if (expected.length !== v1.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}
