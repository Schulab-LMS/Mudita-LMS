import { parse as parseYaml } from "yaml";
import { hasMediaSegment, subjectRoot } from "@/lib/curriculum-structure";

// Sync-time helpers for Reveal.js presentations authored in the curriculum
// repo. Unlike handout markdown — which is rendered to HTML at sync time and
// stored as HTML — presentation markdown is stored RAW so Reveal's markdown
// plugin can parse slide-delimiters (`---` between slides, `--` between
// vertical slides) on the client. That forces two sync-time concerns into
// this file:
//
//   1. YAML frontmatter extraction. Authors can configure theme / transition /
//      plugins per deck via leading `---\n…\n---\n` block. We parse it once at
//      sync time and stash the result as JSON on the lesson row.
//
//   2. Relative image rewriting. `![alt](./img.png)` references must resolve
//      to the authenticated /api/curriculum/media/<slug>/<path> proxy so
//      students don't bypass enrollment. We rewrite at sync time so the raw
//      markdown stored in the DB is already client-safe.

export interface PresentationConfig {
  theme?: string;
  transition?: string;
  rtl?: boolean;
  controls?: boolean;
  progress?: boolean;
  hash?: boolean;
  slideNumber?: boolean | string;
  // Plugin names the renderer should load (e.g. 'highlight', 'notes',
  // 'math', 'markdown'). The renderer enforces an allowlist — anything not
  // recognised is dropped.
  plugins?: string[];
  // Reveal accepts a long tail of other options. We don't validate the
  // schema here; the renderer reads only known keys.
  [extra: string]: unknown;
}

export interface ParsedPresentation {
  config: PresentationConfig | null;
  markdown: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Extract leading YAML frontmatter and return the remaining markdown. */
export function parsePresentationMarkdown(raw: string): ParsedPresentation {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return { config: null, markdown: raw };
  }
  let config: PresentationConfig | null = null;
  try {
    const parsed = parseYaml(match[1]);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      config = parsed as PresentationConfig;
    }
  } catch (e) {
    console.warn(`[curricula] presentation frontmatter parse failed: ${String(e)}`);
  }
  return { config, markdown: raw.slice(match[0].length) };
}

// ── Media URL rewriting ─────────────────────────────────────────────────

function isAbsoluteUrl(src: string): boolean {
  return /^([a-z]+:)?\/\//i.test(src) || src.startsWith("data:");
}

function resolveRepoPath(baseDir: string, relative: string): string | null {
  const segments = baseDir.split("/").filter(Boolean);
  for (const part of relative.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (segments.length === 0) return null;
      segments.pop();
    } else {
      segments.push(part);
    }
  }
  return segments.join("/");
}

function mediaProxyUrl(courseSlug: string, repoPathInCourse: string): string {
  const encoded = repoPathInCourse.split("/").map(encodeURIComponent).join("/");
  return `/api/curriculum/media/${encodeURIComponent(courseSlug)}/${encoded}`;
}

export interface RewriteContext {
  /** Course slug — first segment of the media proxy URL. */
  courseSlug: string;
  /** Repo path of the course root folder (e.g. "intro-to-ai"). */
  courseRoot: string;
  /** Repo path of the presentation.md file being rewritten. */
  sourceFilePath: string;
}

// Match standard markdown image syntax: ![alt](src "title")
// Captures: alt, src (allowing only non-whitespace inside parens for simplicity).
// Curriculum is reasonably-formed markdown; we accept the constraint that
// paths with spaces must use <…> or absolute URLs.
const IMAGE_RE = /(!\[[^\]]*\]\()([^)\s]+)(\)|\s)/g;

/**
 * Rewrite relative `![](./img)` image paths in raw markdown to the
 * authenticated media-proxy URL, mirroring renderCurriculumMarkdown's
 * behaviour but operating on the markdown text itself (so Reveal's slide
 * delimiters remain intact for client-side parsing).
 */
export function rewritePresentationMediaUrls(
  markdown: string,
  ctx: RewriteContext
): string {
  const baseDir = ctx.sourceFilePath.includes("/")
    ? ctx.sourceFilePath.slice(0, ctx.sourceFilePath.lastIndexOf("/"))
    : "";
  const courseRootPrefix = ctx.courseRoot.endsWith("/")
    ? ctx.courseRoot
    : `${ctx.courseRoot}/`;

  return markdown.replace(IMAGE_RE, (match, prefix, src, suffix) => {
    if (isAbsoluteUrl(src) || src.startsWith("/")) return match;
    const abs = resolveRepoPath(baseDir, src);
    if (abs && abs.startsWith(courseRootPrefix)) {
      const within = abs.slice(courseRootPrefix.length);
      return `${prefix}${mediaProxyUrl(ctx.courseSlug, within)}${suffix}`;
    }
    // Shared subject-level media (e.g. space-science/_media) lives above the
    // per-course folder. Emit a repo-root-relative proxy path scoped to this
    // subject; the proxy serves it under the same enrolment gate.
    if (abs && hasMediaSegment(abs) && subjectRoot(abs) === subjectRoot(ctx.courseRoot)) {
      return `${prefix}${mediaProxyUrl(ctx.courseSlug, abs)}${suffix}`;
    }
    console.warn(
      `[curricula] presentation image "${src}" in ${ctx.sourceFilePath} resolves outside the course root — left as-is`
    );
    return match;
  });
}

/**
 * Rewrite a single resource URL (from resources.md) to the authenticated media
 * proxy when it points at a repo-relative file, so resource downloads honour
 * enrolment the same way presentation images do. Absolute URLs and site-root
 * paths are returned unchanged; paths that escape the course root are dropped
 * (returns null) so we never proxy outside the course folder.
 */
export function rewriteResourceUrl(url: string, ctx: RewriteContext): string | null {
  if (isAbsoluteUrl(url) || url.startsWith("/") || url.startsWith("mailto:")) {
    return url;
  }
  const baseDir = ctx.sourceFilePath.includes("/")
    ? ctx.sourceFilePath.slice(0, ctx.sourceFilePath.lastIndexOf("/"))
    : "";
  const courseRootPrefix = ctx.courseRoot.endsWith("/")
    ? ctx.courseRoot
    : `${ctx.courseRoot}/`;
  const abs = resolveRepoPath(baseDir, url);
  if (abs && abs.startsWith(courseRootPrefix)) {
    return mediaProxyUrl(ctx.courseSlug, abs.slice(courseRootPrefix.length));
  }
  // Shared subject-level media (e.g. space-science/_media) lives above the
  // per-course folder — serve it through the proxy, scoped to this subject.
  if (abs && hasMediaSegment(abs) && subjectRoot(abs) === subjectRoot(ctx.courseRoot)) {
    return mediaProxyUrl(ctx.courseSlug, abs);
  }
  console.warn(
    `[curricula] resource "${url}" in ${ctx.sourceFilePath} resolves outside the course root — dropped`
  );
  return null;
}
