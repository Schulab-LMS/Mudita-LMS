"use client";

import { useEffect, useId, useRef } from "react";
import "reveal.js/dist/reveal.css";
// P1 ships a single bundled theme. The frontmatter `theme` key is read and
// stored at sync time but ignored by the renderer — per-deck theme switching
// requires loading the theme CSS dynamically and is on the P2 list.
import "reveal.js/dist/theme/black.css";
import "./reveal-presentation.css";
import type { Api as RevealApi, Options } from "reveal.js";

import type { PresentationConfig } from "@/lib/presentation";

export type PresentationMode = "self-paced" | "presenter" | "follower";

interface RevealPresentationProps {
  /** Raw Reveal.js markdown (after sync-time media-URL rewriting). */
  markdown: string;
  /** Parsed frontmatter — controls plugins, transition, slide numbering, etc. */
  config?: PresentationConfig | null;
  /**
   * self-paced: student drives navigation (default for VOD lessons).
   * presenter / follower: reserved for Phase 2's live-classroom integration —
   * presenter publishes slide changes, follower subscribes and hides controls.
   */
  mode?: PresentationMode;
  /** Right-to-left layout (Arabic). Overrides config.rtl if set. */
  rtl?: boolean;
  /** Used to label the iframe / aria — defaults to the lesson title. */
  ariaLabel?: string;
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

export function RevealPresentation({
  markdown,
  config,
  mode = "self-paced",
  rtl,
  ariaLabel,
}: RevealPresentationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<RevealApi | null>(null);
  const uid = useId();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;

    (async () => {
      const requested = (config?.plugins ?? DEFAULT_PLUGINS).filter(
        (p): p is string => typeof p === "string" && p in PLUGIN_LOADERS
      );
      // Markdown plugin is required regardless of what the deck author set.
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

      const options: Options = {
        embedded: true,
        controls: mode !== "follower",
        controlsTutorial: false,
        progress: config?.progress ?? true,
        hash: false,
        keyboard: mode !== "follower",
        touch: true,
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
  }, [markdown, config, mode, rtl]);

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
