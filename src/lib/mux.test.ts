import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generateKeyPairSync, createHmac } from "node:crypto";
import { importSPKI, jwtVerify } from "jose";

// Tests for the low-level Mux client: JWT signing, webhook signature
// verification, and REST wrapper auth/body handling. We generate a real
// RSA keypair per run so nothing is pinned to a fixture file.

function withMuxEnv(vars: Record<string, string | undefined>): () => void {
  const prev: Record<string, string | undefined> = {};
  for (const k of Object.keys(vars)) prev[k] = process.env[k];
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  return () => {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  };
}

describe("isMuxConfigured / isMuxSigningConfigured", () => {
  it("reflects env var presence", async () => {
    const restore = withMuxEnv({
      MUX_TOKEN_ID: "",
      MUX_TOKEN_SECRET: "",
      MUX_SIGNING_KEY_ID: "",
      MUX_SIGNING_KEY_PRIVATE: "",
    });
    try {
      vi.resetModules();
      const m1 = await import("./mux");
      expect(m1.isMuxConfigured()).toBe(false);
      expect(m1.isMuxSigningConfigured()).toBe(false);
    } finally {
      restore();
    }

    const restore2 = withMuxEnv({
      MUX_TOKEN_ID: "id",
      MUX_TOKEN_SECRET: "secret",
      MUX_SIGNING_KEY_ID: "kid",
      MUX_SIGNING_KEY_PRIVATE: "pem",
    });
    try {
      vi.resetModules();
      const m2 = await import("./mux");
      expect(m2.isMuxConfigured()).toBe(true);
      expect(m2.isMuxSigningConfigured()).toBe(true);
    } finally {
      restore2();
    }
  });
});

describe("signPlaybackToken", () => {
  let restoreEnv: () => void;
  let publicPem: string;

  beforeEach(() => {
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    publicPem = publicKey;

    restoreEnv = withMuxEnv({
      MUX_SIGNING_KEY_ID: "test-kid",
      MUX_SIGNING_KEY_PRIVATE: privateKey,
    });
    vi.resetModules();
  });

  afterEach(() => {
    restoreEnv();
  });

  it("signs an RS256 JWT with kid, aud, sub, exp", async () => {
    const { signPlaybackToken } = await import("./mux");
    const token = await signPlaybackToken({
      playbackId: "play-123",
      audience: "v",
      ttlSeconds: 600,
    });

    const publicKey = await importSPKI(publicPem, "RS256");
    const { payload, protectedHeader } = await jwtVerify(token, publicKey);

    expect(protectedHeader.alg).toBe("RS256");
    expect(protectedHeader.kid).toBe("test-kid");
    expect(payload.sub).toBe("play-123");
    expect(payload.aud).toBe("v");
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    // Exp must be ~600s from now (allow 30s fuzz for clock drift in CI).
    expect(payload.exp! - (payload.iat as number)).toBe(600);
  });

  it("accepts PEM with escaped \\n (host env-var style)", async () => {
    const pemReal = process.env.MUX_SIGNING_KEY_PRIVATE!;
    const pemEscaped = pemReal.replace(/\n/g, "\\n");
    const restore = withMuxEnv({ MUX_SIGNING_KEY_PRIVATE: pemEscaped });
    try {
      vi.resetModules();
      const { signPlaybackToken } = await import("./mux");
      const token = await signPlaybackToken({
        playbackId: "p",
        audience: "t",
      });
      // It's enough that signing doesn't throw; the canonical PEM path is
      // covered by the previous test.
      expect(token.split(".")).toHaveLength(3);
    } finally {
      restore();
    }
  });

  it("throws when signing env is absent", async () => {
    const restore = withMuxEnv({
      MUX_SIGNING_KEY_ID: "",
      MUX_SIGNING_KEY_PRIVATE: "",
    });
    try {
      vi.resetModules();
      const { signPlaybackToken } = await import("./mux");
      await expect(
        signPlaybackToken({ playbackId: "x", audience: "v" })
      ).rejects.toThrow(/MUX_SIGNING_KEY/);
    } finally {
      restore();
    }
  });

  it("accepts PKCS#1 PEM (BEGIN RSA PRIVATE KEY)", async () => {
    const { privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs1", format: "pem" },
    });
    const restore = withMuxEnv({
      MUX_SIGNING_KEY_ID: "test-kid",
      MUX_SIGNING_KEY_PRIVATE: privateKey,
    });
    try {
      vi.resetModules();
      const { signPlaybackToken } = await import("./mux");
      const token = await signPlaybackToken({
        playbackId: "pkcs1-id",
        audience: "v",
      });
      expect(token.split(".")).toHaveLength(3);
    } finally {
      restore();
    }
  });

  it("accepts a base64-encoded PEM blob (Mux dashboard format)", async () => {
    const pemReal = process.env.MUX_SIGNING_KEY_PRIVATE!;
    const blob = Buffer.from(pemReal, "utf8").toString("base64");
    const restore = withMuxEnv({ MUX_SIGNING_KEY_PRIVATE: blob });
    try {
      vi.resetModules();
      const { signPlaybackToken } = await import("./mux");
      const token = await signPlaybackToken({
        playbackId: "b64-id",
        audience: "v",
      });
      const publicKey = await importSPKI(publicPem, "RS256");
      const { payload } = await jwtVerify(token, publicKey);
      expect(payload.sub).toBe("b64-id");
    } finally {
      restore();
    }
  });

  it("throws a descriptive error when the key material is garbage", async () => {
    const restore = withMuxEnv({ MUX_SIGNING_KEY_PRIVATE: "not-a-key" });
    try {
      vi.resetModules();
      const { signPlaybackToken } = await import("./mux");
      await expect(
        signPlaybackToken({ playbackId: "x", audience: "v" })
      ).rejects.toThrow(/MUX_SIGNING_KEY_PRIVATE is not a valid RSA private key/);
    } finally {
      restore();
    }
  });
});

describe("playbackUrl / thumbnailUrl", () => {
  it("builds stream.mux.com URLs with optional token", async () => {
    const { playbackUrl, thumbnailUrl } = await import("./mux");
    expect(playbackUrl("abc")).toBe("https://stream.mux.com/abc.m3u8");
    expect(playbackUrl("abc", "tok")).toBe(
      "https://stream.mux.com/abc.m3u8?token=tok"
    );
    expect(thumbnailUrl("abc")).toMatch(
      /^https:\/\/image\.mux\.com\/abc\/thumbnail\.jpg\?width=640$/
    );
    expect(thumbnailUrl("abc", "tok")).toMatch(/&token=tok$/);
  });
});

describe("verifyWebhookSignature", () => {
  const SECRET = "whsec_test";
  let restoreEnv: () => void;

  beforeEach(() => {
    restoreEnv = withMuxEnv({ MUX_WEBHOOK_SECRET: SECRET });
    vi.resetModules();
  });
  afterEach(() => restoreEnv());

  function signHeader(body: string, secret: string, ts: number): string {
    const v1 = createHmac("sha256", secret)
      .update(`${ts}.${body}`)
      .digest("hex");
    return `t=${ts},v1=${v1}`;
  }

  it("accepts a valid signature", async () => {
    const { verifyWebhookSignature } = await import("./mux");
    const body = JSON.stringify({ id: "evt_1", type: "video.asset.ready" });
    const ts = Math.floor(Date.now() / 1000);
    const header = signHeader(body, SECRET, ts);
    await expect(
      verifyWebhookSignature({ rawBody: body, header })
    ).resolves.toBe(true);
  });

  it("rejects signature from a different secret", async () => {
    const { verifyWebhookSignature } = await import("./mux");
    const body = JSON.stringify({ id: "evt_2", type: "video.asset.ready" });
    const ts = Math.floor(Date.now() / 1000);
    const header = signHeader(body, "other_secret", ts);
    await expect(
      verifyWebhookSignature({ rawBody: body, header })
    ).resolves.toBe(false);
  });

  it("rejects replayed events outside the tolerance window", async () => {
    const { verifyWebhookSignature } = await import("./mux");
    const body = JSON.stringify({ id: "evt_3" });
    const staleTs = Math.floor(Date.now() / 1000) - 10 * 60; // 10 min old
    const header = signHeader(body, SECRET, staleTs);
    await expect(
      verifyWebhookSignature({
        rawBody: body,
        header,
        toleranceSeconds: 300,
      })
    ).resolves.toBe(false);
  });

  it("rejects a malformed header", async () => {
    const { verifyWebhookSignature } = await import("./mux");
    await expect(
      verifyWebhookSignature({ rawBody: "{}", header: "garbage" })
    ).resolves.toBe(false);
  });

  it("rejects when the secret is not configured", async () => {
    const restore = withMuxEnv({ MUX_WEBHOOK_SECRET: "" });
    try {
      vi.resetModules();
      const { verifyWebhookSignature } = await import("./mux");
      await expect(
        verifyWebhookSignature({ rawBody: "{}", header: "t=1,v1=abc" })
      ).resolves.toBe(false);
    } finally {
      restore();
    }
  });

  it("is resistant to tampered bodies", async () => {
    const { verifyWebhookSignature } = await import("./mux");
    const body = JSON.stringify({ id: "evt_4", amount: 100 });
    const ts = Math.floor(Date.now() / 1000);
    const header = signHeader(body, SECRET, ts);
    const tampered = body.replace("100", "999");
    await expect(
      verifyWebhookSignature({ rawBody: tampered, header })
    ).resolves.toBe(false);
  });
});

describe("muxFetch REST wrapper", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;
  let restoreEnv: () => void;

  beforeEach(() => {
    restoreEnv = withMuxEnv({
      MUX_TOKEN_ID: "abc",
      MUX_TOKEN_SECRET: "shh",
    });
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    vi.resetModules();
  });
  afterEach(() => restoreEnv());

  it("sends Basic auth header from env", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { id: "up_1", url: "https://u", timeout: 3600, status: "waiting" } }), {
        status: 200,
      })
    );
    const { createDirectUpload } = await import("./mux");
    await createDirectUpload({});
    const [, init] = fetchSpy.mock.calls[0];
    const expected = `Basic ${Buffer.from("abc:shh").toString("base64")}`;
    expect(init.headers.Authorization).toBe(expected);
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("serialises object body to JSON", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { id: "up_2", url: "https://u", timeout: 3600, status: "waiting" } }))
    );
    const { createDirectUpload } = await import("./mux");
    await createDirectUpload({ corsOrigin: "https://lms.example" });
    const [, init] = fetchSpy.mock.calls[0];
    const body = JSON.parse(init.body as string) as { cors_origin: string };
    expect(body.cors_origin).toBe("https://lms.example");
  });

  it("throws with status + body when Mux returns non-2xx", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response("rate limited", { status: 429 })
    );
    const { getAsset } = await import("./mux");
    await expect(getAsset("nope")).rejects.toThrow(/429/);
  });

  it("tolerates 404 on delete (asset already gone)", async () => {
    fetchSpy.mockResolvedValueOnce(new Response("", { status: 404 }));
    const { deleteAsset } = await import("./mux");
    await expect(deleteAsset("missing")).resolves.toBeUndefined();
  });
});
