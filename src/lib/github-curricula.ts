import { createHmac, timingSafeEqual } from "node:crypto";

// Authenticated client for the private STEM-Curricula GitHub repo. We use the
// REST API directly (no Octokit) — the surface we need is small: read the
// commit at HEAD, list the tree, read blobs, and stream raw media bytes.
//
// Required env:
//   CURRICULA_REPO            "owner/name" of the curriculum repo
//   CURRICULA_GITHUB_TOKEN    fine-grained, read-only PAT (Contents: read)
// Optional env:
//   CURRICULA_BRANCH          branch to sync from (default "main")
//   CURRICULA_WEBHOOK_SECRET  HMAC secret for the push webhook

const GITHUB_API_BASE = "https://api.github.com";
const API_VERSION = "2022-11-28";

export function isCurriculaConfigured(): boolean {
  return Boolean(process.env.CURRICULA_REPO && process.env.CURRICULA_GITHUB_TOKEN);
}

export function curriculaRepo(): string {
  const repo = process.env.CURRICULA_REPO;
  if (!repo) throw new Error("CURRICULA_REPO is not configured");
  return repo;
}

export function curriculaBranch(): string {
  return process.env.CURRICULA_BRANCH || "main";
}

function token(): string {
  const t = process.env.CURRICULA_GITHUB_TOKEN;
  if (!t) throw new Error("CURRICULA_GITHUB_TOKEN is not configured");
  return t;
}

function baseHeaders(accept: string): HeadersInit {
  return {
    Authorization: `Bearer ${token()}`,
    Accept: accept,
    "X-GitHub-Api-Version": API_VERSION,
    "User-Agent": "schulab-curriculum-sync",
  };
}

async function gh<T>(path: string, accept = "application/vnd.github+json"): Promise<T> {
  const res = await fetch(`${GITHUB_API_BASE}/repos/${curriculaRepo()}${path}`, {
    headers: baseHeaders(accept),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GitHub API ${res.status} for ${path}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export interface TreeEntry {
  path: string;
  type: "blob" | "tree" | "commit";
  sha: string;
  size?: number;
}

/** SHA of the latest commit on the given branch. */
export async function getLatestCommitSha(branch = curriculaBranch()): Promise<string> {
  const data = await gh<{ sha: string }>(`/commits/${encodeURIComponent(branch)}`);
  return data.sha;
}

/** Full recursive tree at a commit/branch ref. Warns if GitHub truncates it. */
export async function getTree(ref: string): Promise<TreeEntry[]> {
  const data = await gh<{ tree: TreeEntry[]; truncated: boolean }>(
    `/git/trees/${encodeURIComponent(ref)}?recursive=1`
  );
  if (data.truncated) {
    console.warn(
      "[curricula] tree response was truncated — repo exceeds the GitHub tree API limit; some files may be missing from this sync."
    );
  }
  return data.tree;
}

/** Decoded UTF-8 text of a blob, addressed by its git blob SHA. */
export async function getBlobText(sha: string): Promise<string> {
  const data = await gh<{ content: string; encoding: string }>(`/git/blobs/${sha}`);
  if (data.encoding !== "base64") {
    throw new Error(`Unexpected blob encoding "${data.encoding}" for ${sha}`);
  }
  return Buffer.from(data.content, "base64").toString("utf-8");
}

/** Raw bytes + content-type of a file at a path/ref. Used by the media proxy. */
export async function getRawFile(
  path: string,
  ref = curriculaBranch()
): Promise<{ bytes: ArrayBuffer; contentType: string }> {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const res = await fetch(
    `${GITHUB_API_BASE}/repos/${curriculaRepo()}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`,
    { headers: baseHeaders("application/vnd.github.raw"), cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`GitHub raw ${res.status} for ${path}`);
  }
  return {
    bytes: await res.arrayBuffer(),
    contentType: res.headers.get("content-type") || "application/octet-stream",
  };
}

/**
 * Verify a GitHub push webhook signature. GitHub sends
 * `x-hub-signature-256: sha256=<hex>` computed as HMAC-SHA256(secret, rawBody).
 */
export function verifyWebhookSignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.CURRICULA_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
