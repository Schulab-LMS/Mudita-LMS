import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generateKeyPairSync } from "node:crypto";

// Locks the Mux VideoAsset lifecycle from "admin creates upload" through
// "student fetches signed URL". We stub the db with tiny in-memory tables
// and intercept global fetch — no real Mux calls, no Postgres.

type Row = {
  id: string;
  provider: "MUX" | "EXTERNAL" | "CLOUDFLARE_STREAM";
  providerId: string;
  playbackId: string | null;
  uploadUrl: string | null;
  status: "UPLOADING" | "PROCESSING" | "READY" | "ERROR";
  duration: number | null;
  languages: string[];
};

// ── Prisma stub ───────────────────────────────────────────────────────────
const store = new Map<string, Row>();
let idCounter = 0;
const nextId = () => `asset_${++idCounter}`;

function matchFilter(row: Row, where: Record<string, unknown>): boolean {
  for (const [k, v] of Object.entries(where)) {
    if (row[k as keyof Row] !== v) return false;
  }
  return true;
}

const db = {
  videoAsset: {
    create: vi.fn(
      async ({ data }: { data: Partial<Row> }) => {
        const id = nextId();
        const row: Row = {
          id,
          provider: (data.provider ?? "MUX") as Row["provider"],
          providerId: data.providerId ?? "",
          playbackId: null,
          uploadUrl: data.uploadUrl ?? null,
          status: (data.status ?? "UPLOADING") as Row["status"],
          duration: null,
          languages: data.languages ?? [],
        };
        store.set(id, row);
        return { id };
      }
    ),
    findUnique: vi.fn(
      async ({ where }: { where: { id: string } }) => store.get(where.id) ?? null
    ),
    update: vi.fn(
      async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<Row>;
      }) => {
        const row = store.get(where.id);
        if (!row) throw new Error("Not found");
        const next = { ...row, ...data } as Row;
        store.set(where.id, next);
        return next;
      }
    ),
    updateMany: vi.fn(
      async ({
        where,
        data,
      }: {
        where: Record<string, unknown>;
        data: Partial<Row>;
      }) => {
        let count = 0;
        for (const row of store.values()) {
          if (matchFilter(row, where)) {
            store.set(row.id, { ...row, ...data } as Row);
            count++;
          }
        }
        return { count };
      }
    ),
    delete: vi.fn(async ({ where }: { where: { id: string } }) => {
      const row = store.get(where.id);
      store.delete(where.id);
      return row;
    }),
  },
};

vi.mock("@/lib/db", () => ({ db }));

// ── Env helpers ──────────────────────────────────────────────────────────
const ENV_BACKUP: Record<string, string | undefined> = {};
function setEnv(vars: Record<string, string | undefined>): void {
  for (const k of Object.keys(vars)) {
    if (!(k in ENV_BACKUP)) ENV_BACKUP[k] = process.env[k];
  }
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

function restoreEnv(): void {
  for (const [k, v] of Object.entries(ENV_BACKUP)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

function genKeys(): { publicKey: string; privateKey: string } {
  return generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
}

// Response helper matching Mux's envelope shape.
function muxResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({ data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Mux video lifecycle", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    store.clear();
    idCounter = 0;
    for (const fn of Object.values(db.videoAsset)) fn.mockClear();

    setEnv({
      VIDEO_PROVIDER: "MUX",
      MUX_TOKEN_ID: "tok",
      MUX_TOKEN_SECRET: "sec",
      // Signing keys off by default; signed-URL test turns them on below.
      MUX_SIGNING_KEY_ID: "",
      MUX_SIGNING_KEY_PRIVATE: "",
    });

    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    vi.resetModules();
  });

  afterEach(() => {
    restoreEnv();
  });

  it("createVideoUpload: persists UPLOADING row with provider upload id + returns PUT url", async () => {
    fetchSpy.mockResolvedValueOnce(
      muxResponse({
        id: "upload_abc",
        url: "https://storage.mux.com/put/abc",
        timeout: 3600,
        status: "waiting",
      })
    );
    const { createVideoUpload } = await import("./video.service");
    const { resetVideoProviderCache } = await import("@/lib/video-provider");
    resetVideoProviderCache();

    const res = await createVideoUpload({});

    expect(res.uploadUrl).toBe("https://storage.mux.com/put/abc");
    expect(res.providerUploadId).toBe("upload_abc");
    expect(res.expiresAt.getTime()).toBeGreaterThan(Date.now());

    const row = store.get(res.assetId)!;
    expect(row.provider).toBe("MUX");
    expect(row.providerId).toBe("upload_abc");
    expect(row.status).toBe("UPLOADING");
    expect(row.uploadUrl).toBe("https://storage.mux.com/put/abc");
  });

  it("confirmVideoUpload: swaps upload id → asset id when upload is ready", async () => {
    // Seed an UPLOADING row manually.
    store.set("asset_x", {
      id: "asset_x",
      provider: "MUX",
      providerId: "upload_abc",
      playbackId: null,
      uploadUrl: "https://storage.mux.com/put/abc",
      status: "UPLOADING",
      duration: null,
      languages: [],
    });

    fetchSpy.mockResolvedValueOnce(
      muxResponse({
        id: "upload_abc",
        url: "https://storage.mux.com/put/abc",
        timeout: 3600,
        status: "asset_created",
        asset_id: "live_asset_xyz",
      })
    );
    const { confirmVideoUpload } = await import("./video.service");
    const res = await confirmVideoUpload("asset_x");

    expect(res.status).toBe("PROCESSING");
    const row = store.get("asset_x")!;
    expect(row.providerId).toBe("live_asset_xyz");
    expect(row.status).toBe("PROCESSING");
    expect(row.uploadUrl).toBeNull();
  });

  it("confirmVideoUpload: stays UPLOADING when Mux hasn't created the asset yet", async () => {
    store.set("asset_y", {
      id: "asset_y",
      provider: "MUX",
      providerId: "upload_pending",
      playbackId: null,
      uploadUrl: "https://storage.mux.com/put/pending",
      status: "UPLOADING",
      duration: null,
      languages: [],
    });

    fetchSpy.mockResolvedValueOnce(
      muxResponse({
        id: "upload_pending",
        url: "https://storage.mux.com/put/pending",
        timeout: 3600,
        status: "waiting",
      })
    );
    const { confirmVideoUpload } = await import("./video.service");
    const res = await confirmVideoUpload("asset_y");

    expect(res.status).toBe("UPLOADING");
    expect(store.get("asset_y")!.providerId).toBe("upload_pending");
  });

  it("confirmVideoUpload: marks ERROR when Mux errors the upload", async () => {
    store.set("asset_z", {
      id: "asset_z",
      provider: "MUX",
      providerId: "upload_err",
      playbackId: null,
      uploadUrl: "https://storage.mux.com/put/err",
      status: "UPLOADING",
      duration: null,
      languages: [],
    });
    fetchSpy.mockResolvedValueOnce(
      muxResponse({
        id: "upload_err",
        url: "",
        timeout: 0,
        status: "errored",
      })
    );
    const { confirmVideoUpload } = await import("./video.service");
    const res = await confirmVideoUpload("asset_z");
    expect(res.status).toBe("ERROR");
    expect(store.get("asset_z")!.status).toBe("ERROR");
  });

  it("linkUploadToAsset: webhook `video.upload.asset_created` path", async () => {
    store.set("asset_link", {
      id: "asset_link",
      provider: "MUX",
      providerId: "upload_link",
      playbackId: null,
      uploadUrl: "https://up",
      status: "UPLOADING",
      duration: null,
      languages: [],
    });
    const { linkUploadToAsset } = await import("./video.service");
    await linkUploadToAsset("upload_link", "real_asset_id");
    const row = store.get("asset_link")!;
    expect(row.providerId).toBe("real_asset_id");
    expect(row.status).toBe("PROCESSING");
    expect(row.uploadUrl).toBeNull();
  });

  it("reconcileByProviderAssetId: webhook `video.asset.ready` promotes status + playbackId", async () => {
    store.set("asset_ready", {
      id: "asset_ready",
      provider: "MUX",
      providerId: "live_1",
      playbackId: null,
      uploadUrl: null,
      status: "PROCESSING",
      duration: null,
      languages: [],
    });
    const { reconcileByProviderAssetId } = await import("./video.service");
    await reconcileByProviderAssetId("live_1", {
      status: "READY",
      playbackId: "pb_1",
      duration: 42,
    });
    const row = store.get("asset_ready")!;
    expect(row.status).toBe("READY");
    expect(row.playbackId).toBe("pb_1");
    expect(row.duration).toBe(42);
  });

  it("resolvePlayback: READY asset returns an unsigned stream URL when signing is off", async () => {
    store.set("asset_ok", {
      id: "asset_ok",
      provider: "MUX",
      providerId: "live_2",
      playbackId: "pb_public",
      uploadUrl: null,
      status: "READY",
      duration: 60,
      languages: [],
    });
    const { resolvePlayback } = await import("./video.service");
    const { resetVideoProviderCache } = await import("@/lib/video-provider");
    resetVideoProviderCache();

    const pb = await resolvePlayback("asset_ok");
    expect(pb?.status).toBe("READY");
    expect(pb?.url).toBe("https://stream.mux.com/pb_public.m3u8");
    expect(pb?.thumbnailUrl).toMatch(/image\.mux\.com\/pb_public/);
    // No token means no expiry is surfaced.
    expect(pb?.expiresAt).toBeNull();
  });

  it("resolvePlayback: signed mode returns URLs carrying a JWT + future expiry", async () => {
    const { privateKey } = genKeys();
    setEnv({
      MUX_SIGNING_KEY_ID: "kid1",
      MUX_SIGNING_KEY_PRIVATE: privateKey,
    });

    store.set("asset_signed", {
      id: "asset_signed",
      provider: "MUX",
      providerId: "live_3",
      playbackId: "pb_signed",
      uploadUrl: null,
      status: "READY",
      duration: 60,
      languages: [],
    });

    vi.resetModules();
    const { resolvePlayback } = await import("./video.service");
    const { resetVideoProviderCache } = await import("@/lib/video-provider");
    resetVideoProviderCache();

    const pb = await resolvePlayback("asset_signed", { ttlSeconds: 120 });
    expect(pb?.status).toBe("READY");
    expect(pb?.url).toMatch(/^https:\/\/stream\.mux\.com\/pb_signed\.m3u8\?token=/);
    expect(pb?.thumbnailUrl).toMatch(/image\.mux\.com\/pb_signed\/thumbnail\.jpg\?.*token=/);
    expect(pb?.expiresAt).toBeInstanceOf(Date);
    expect(pb!.expiresAt!.getTime()).toBeGreaterThan(Date.now());
    // Token is a JWT (header.payload.signature).
    const token = new URL(pb!.url!).searchParams.get("token");
    expect(token?.split(".")).toHaveLength(3);
  });

  it("resolvePlayback: still-processing asset returns READY:false without url", async () => {
    store.set("asset_proc", {
      id: "asset_proc",
      provider: "MUX",
      providerId: "live_4",
      playbackId: null,
      uploadUrl: null,
      status: "PROCESSING",
      duration: null,
      languages: [],
    });
    const { resolvePlayback } = await import("./video.service");
    const pb = await resolvePlayback("asset_proc");
    expect(pb?.status).toBe("PROCESSING");
    expect(pb?.url).toBeNull();
    expect(pb?.thumbnailUrl).toBeNull();
  });

  it("resolvePlayback: unknown asset returns null (404 upstream)", async () => {
    const { resolvePlayback } = await import("./video.service");
    const pb = await resolvePlayback("does_not_exist");
    expect(pb).toBeNull();
  });

  it("full lifecycle: create → confirm → webhook ready → resolvePlayback", async () => {
    // 1. create
    fetchSpy.mockResolvedValueOnce(
      muxResponse({
        id: "up_full",
        url: "https://storage.mux.com/put/full",
        timeout: 3600,
        status: "waiting",
      })
    );
    const { createVideoUpload, confirmVideoUpload } = await import(
      "./video.service"
    );
    const { resetVideoProviderCache } = await import("@/lib/video-provider");
    resetVideoProviderCache();

    const created = await createVideoUpload({});
    expect(store.get(created.assetId)!.status).toBe("UPLOADING");

    // 2. confirm — Mux has turned the upload into an asset id
    fetchSpy.mockResolvedValueOnce(
      muxResponse({
        id: "up_full",
        url: "https://storage.mux.com/put/full",
        timeout: 3600,
        status: "asset_created",
        asset_id: "asset_full_live",
      })
    );
    await confirmVideoUpload(created.assetId);
    expect(store.get(created.assetId)!.status).toBe("PROCESSING");
    expect(store.get(created.assetId)!.providerId).toBe("asset_full_live");

    // 3. webhook → ready
    const { reconcileByProviderAssetId } = await import("./video.service");
    await reconcileByProviderAssetId("asset_full_live", {
      status: "READY",
      playbackId: "pb_full",
      duration: 90,
    });
    expect(store.get(created.assetId)!.status).toBe("READY");

    // 4. student fetches playback
    const { resolvePlayback } = await import("./video.service");
    const pb = await resolvePlayback(created.assetId);
    expect(pb?.url).toBe("https://stream.mux.com/pb_full.m3u8");
  });
});
