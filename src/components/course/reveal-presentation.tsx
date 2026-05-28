"use client";

import { useEffect, useId, useRef } from "react";
import "reveal.js/dist/reveal.css";
// P1 ships a single bundled theme. The frontmatter `theme` key is read and
// stored at sync time but ignored by the renderer — per-deck theme switching
// requires loading the theme CSS dynamically and is on the P3 list.
import "reveal.js/dist/theme/black.css";
import "./reveal-presentation.css";
import type { Api as RevealApi, Options } from "reveal.js";

import type { PresentationConfig } from "@/lib/presentation";

export type PresentationMode = "self-paced" | "presenter" | "follower";

export interface SlidePosition {
  h: number;
  v: number;
  f: number;
}

interface RevealPresentationProps {
  /** Raw Reveal.js markdown (after sync-time media-URL rewriting). */
  markdown: string;
  /** Parsed frontmatter — controls plugins, transition, slide numbering, etc. */
  config?: PresentationConfig | null;
  /**
   * self-paced: student drives navigation (VOD lessons).
   * presenter: tutor drives navigation in a live classroom — fires
   *            `onSlideChange` whenever the tutor moves.
   * follower: student in a live classroom — Reveal's controls/keyboard are
   *           disabled and the slide position is driven by `currentSlide`.
   */
  mode?: PresentationMode;
  /** Right-to-left layout (Arabic). Overrides config.rtl if set. */
  rtl?: boolean;
  /** Used to label the iframe / aria — defaults to the lesson title. */
  ariaLabel?: string;
  /**
   * Presenter mode: invoked whenever the tutor navigates. The LiveClassroom
   * wrapper forwards this to the data channel (low-latency fan-out) and to
   * the server (durable mirror).
   */
  onSlideChange?: (slide: SlidePosition) => void;
  /**
   * Follower mode: the slide position the student should be on. Updated when
   * the tutor publishes a `slide:set` on the data channel. Setting this is a
   * no-op in self-paced / presenter modes.
   */
  currentSlide?: SlidePosition | null;
}

// Reveal's official plugins. Anything outside this allowlist is dropped from
// presentationConfig.plugins to keep the bundle bounded and the API contract
// explicit. New plugins go here intentionally, not by accident.
const PLUGIN_LOADERS: Record<string, () => Promise<{ default: unknown }>> = {
  markdown: () => import("reveal.js/plugin/markdown/markdown.esm.js"),
  highlight: () => import("reveal.js/plugin/highlight/highlight.esm.js"),
  notes: () => import("reveal.js/plugin/notes/notes.esm.js"),
  math: () => import("reveal.js/plugin/math/math.esm.js"),
  search: () => import("reveal.js/plugin/search/search.esm.js"),
  zoom: () => import("reveal.js/plugin/zoom/zoom.esm.js"),
};

// Markdown plugin is mandatory — it's how slide content is parsed. The others
// cover the standard curriculum needs (syntax highlighting + speaker notes).
const DEFAULT_PLUGINS = ["markdown", "highlight", "notes"];

const ALLOWED_TRANSITIONS = new Set([
  "none",
  "fade",
  "slide",
  "convex",
  "concave",
  "zoom",
]);

// Inside <script type="text/template"> the browser reads content as raw text
// until the literal sequence </script>. Only that exact sequence needs to be
// escaped — split-and-rejoin (vs regex) keeps decks that happen to discuss
// `</script>` human-readable in the DB.
function escapeForScriptTemplate(markdown: string): string {
  return markdown.split("</script>").join("<\\/script>");
}

// Avoid feedback loops in follower mode: don't apply a `currentSlide` that
// matches where Reveal already is.
function slidesEqual(a: SlidePosition | null, b: SlidePosition | null): boolean {
  if (!a || !b) return a === b;
  return a.h === b.h && a.v === b.v && a.f === b.f;
}

export function RevealPresentation({
  markdown,
  config,
  mode = "self-paced",
  rtl,
  ariaLabel,
  onSlideChange,
  currentSlide,
}: RevealPresentationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<RevealApi | null>(null);
  // Stable refs for callbacks so the init effect doesn't re-fire when the
  // parent re-renders with a fresh function identity.
  const onSlideChangeRef = useRef(onSlideChange);
  onSlideChangeRef.current = onSlideChange;
  const lastAppliedRef = useRef<SlidePosition | null>(null);
  const uid = useId();

  // ── Initialisation ──────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    (async () => {
      const requested = (config?.plugins ?? DEFAULT_PLUGINS).filter(
        (p): p is string => typeof p === "string" && p in PLUGIN_LOADERS
      );
      const pluginNames = requested.includes("markdown")
        ? requested
        : ["markdown", ...requested];

      const [{ default: Reveal }, ...pluginMods] = await Promise.all([
        import("reveal.js"),
        ...pluginNames.map((p) => PLUGIN_LOADERS[p]()),
      ]);
      if (cancelled) return;

      const transition =
        config?.transition && ALLOWED_TRANSITIONS.has(config.transition)
          ? (config.transition as Options["transition"])
          : "slide";

      const isFollower = mode === "follower";
      const options: Options = {
        embedded: true,
        // Followers can't drive navigation — only the tutor does.
        controls: !isFollower,
        controlsTutorial: false,
        progress: config?.progress ?? true,
        hash: false,
        keyboard: !isFollower,
        touch: !isFollower,
        slideNumber: (config?.slideNumber as Options["slideNumber"]) ?? false,
        rtl: rtl ?? config?.rtl ?? false,
        transition,
        plugins: pluginMods.map((m) => m.default as never),
      };

      const RevealCtor = Reveal as unknown as new (
        el: HTMLElement,
        opts: Options
      ) => RevealApi;
      const deck = new RevealCtor(container, options);
      await deck.initialize();
      if (cancelled) {
        deck.destroy();
        return;
      }
      apiRef.current = deck;

      // Presenter: forward every slide change to the parent (which fans out
      // to the data channel + server). 'slidechanged' fires after Reveal
      // commits the new slide, which is exactly when followers should mirror.
      if (mode === "presenter") {
        deck.on("slidechanged", () => {
          const cb = onSlideChangeRef.current;
          if (!cb) return;
          const state = deck.getState() as { indexh?: number; indexv?: number; indexf?: number };
          cb({
            h: state.indexh ?? 0,
            v: state.indexv ?? 0,
            f: state.indexf ?? 0,
          });
        });
      }

      // Apply any pending currentSlide (e.g. a follower joining mid-session
      // with a non-zero slide already in props).
      if (mode === "follower" && currentSlide) {
        deck.slide(currentSlide.h, currentSlide.v, currentSlide.f);
        lastAppliedRef.current = currentSlide;
      }
    })();

    return () => {
      cancelled = true;
      try {
        apiRef.current?.destroy();
      } catch {
        // Reveal occasionally throws on destroy after a hot-reload; the next
        // mount runs cleanly so we can ignore the failure here.
      }
      apiRef.current = null;
    };
    // Deliberately exclude currentSlide / onSlideChange from the dep list —
    // they're applied via the imperative slide() / ref pattern in dedicated
    // effects below. Including them here would re-mount the deck on every
    // slide change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown, config, mode, rtl]);

  // ── Follower mode: apply incoming slide updates ─────────────────────
  useEffect(() => {
    if (mode !== "follower") return;
    if (!currentSlide) return;
    const api = apiRef.current;
    if (!api) return; // deck still initialising; the init effect will apply on mount
    if (slidesEqual(currentSlide, lastAppliedRef.current)) return;
    api.slide(currentSlide.h, currentSlide.v, currentSlide.f);
    lastAppliedRef.current = currentSlide;
  }, [mode, currentSlide]);

  return (
    <div
      className="reveal-host relative aspect-video w-full bg-black"
      aria-label={ariaLabel}
    >
      <div ref={containerRef} className="reveal" id={`reveal-${uid}`}>
        <div className="slides">
          <section
            data-markdown=""
            data-separator="\r?\n---\r?\n"
            data-separator-vertical="\r?\n--\r?\n"
            data-separator-notes="^Note:"
            dangerouslySetInnerHTML={{
              __html: `<script type="text/template">${escapeForScriptTemplate(markdown)}</script>`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
