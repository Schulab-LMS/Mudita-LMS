import MarkdownIt from "markdown-it";
import { sanitize } from "@/lib/sanitize";
import { hasMediaSegment, subjectRoot } from "@/lib/curriculum-structure";

// Markdown → sanitized HTML pipeline for Git-synced curriculum. Rendering
// happens at SYNC time and the HTML is stored in the DB, so the read path
// (sanitize() + dangerouslySetInnerHTML, already used by lessons) is
// unchanged. markdown-it's default preset includes GFM tables, which the
// curriculum relies on heavily.

const md = new MarkdownIt({
  html: true, // allow embedded HTML; sanitize() is the safety net
  linkify: true,
  typographer: false,
});

// Fence marking tutor-only content inside an otherwise student-facing file.
const TUTOR_FENCE =
  /<!--\s*TUTOR_ONLY\s*-->([\s\S]*?)<!--\s*\/TUTOR_ONLY\s*-->/gi;

export interface TutorSplit {
  /** Markdown with all TUTOR_ONLY blocks removed — safe to show students. */
  studentMarkdown: string;
  /** Concatenated inner content of all TUTOR_ONLY blocks (may be empty). */
  tutorMarkdown: string;
}

/** Separate student-facing markdown from tutor-only fenced blocks. */
export function splitTutorContent(markdown: string): TutorSplit {
  const tutorParts: string[] = [];
  const studentMarkdown = markdown.replace(TUTOR_FENCE, (_match, inner) => {
    tutorParts.push(String(inner).trim());
    return "";
  });
  return {
    studentMarkdown: studentMarkdown.trim(),
    tutorMarkdown: tutorParts.join("\n\n").trim(),
  };
}

// Resolve a relative path (with ./ and ../ segments) against a base directory,
// posix-style. Returns null if it escapes above the repo root.
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

function isAbsoluteUrl(src: string): boolean {
  return /^([a-z]+:)?\/\//i.test(src) || src.startsWith("data:");
}

export interface RenderContext {
  /** The course slug — first segment of the media proxy URL. */
  courseSlug: string;
  /** The course's root folder path in the repo (e.g. "space-science-..."). */
  courseRoot: string;
  /** Full repo path of the markdown file being rendered (for resolving ../). */
  sourceFilePath: string;
}

function mediaProxyUrl(courseSlug: string, repoPathInCourse: string): string {
  const encoded = repoPathInCourse.split("/").map(encodeURIComponent).join("/");
  return `/api/curriculum/media/${encodeURIComponent(courseSlug)}/${encoded}`;
}

// Build a markdown-it renderer whose image rule rewrites relative src values
// to the authenticated media proxy. Absolute URLs are left untouched.
function rendererWithImageRewrite(ctx: RenderContext): MarkdownIt {
  const instance = new MarkdownIt({ html: true, linkify: true, typographer: false });
  const baseDir = ctx.sourceFilePath.includes("/")
    ? ctx.sourceFilePath.slice(0, ctx.sourceFilePath.lastIndexOf("/"))
    : "";
  const courseRootPrefix = ctx.courseRoot.endsWith("/")
    ? ctx.courseRoot
    : `${ctx.courseRoot}/`;

  const defaultImage =
    instance.renderer.rules.image ||
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  instance.renderer.rules.image = (tokens, idx, options, env, self) => {
    const tok = tokens[idx];
    const srcIdx = tok.attrIndex("src");
    if (srcIdx >= 0) {
      const src = tok.attrs![srcIdx][1];
      if (!isAbsoluteUrl(src) && !src.startsWith("/")) {
        const abs = resolveRepoPath(baseDir, src);
        if (abs && abs.startsWith(courseRootPrefix)) {
          const within = abs.slice(courseRootPrefix.length);
          tok.attrs![srcIdx][1] = mediaProxyUrl(ctx.courseSlug, within);
        } else if (
          abs &&
          hasMediaSegment(abs) &&
          subjectRoot(abs) === subjectRoot(ctx.courseRoot)
        ) {
          // Shared subject-level media (e.g. space-science/_media) lives above
          // the per-course folder. Emit a repo-root-relative proxy path — the
          // proxy serves it under the same enrolment gate, scoped to this
          // subject.
          tok.attrs![srcIdx][1] = mediaProxyUrl(ctx.courseSlug, abs);
        } else {
          console.warn(
            `[curricula] image "${src}" in ${ctx.sourceFilePath} resolves outside the course root — left as-is`
          );
        }
      }
    }
    // Lazy-load curriculum images.
    if (tok.attrIndex("loading") < 0) tok.attrPush(["loading", "lazy"]);
    return defaultImage(tokens, idx, options, env, self);
  };

  return instance;
}

/** Render markdown to sanitized HTML, rewriting relative image paths. */
export function renderCurriculumMarkdown(markdown: string, ctx: RenderContext): string {
  const renderer = rendererWithImageRewrite(ctx);
  return sanitize(renderer.render(markdown));
}

/** Render markdown to sanitized HTML with no image rewriting. */
export function renderMarkdown(markdown: string): string {
  return sanitize(md.render(markdown));
}
