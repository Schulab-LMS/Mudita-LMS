"use client";

import type { ReactNode } from "react";

// Best-effort content protection for curriculum material. This is a DETERRENT,
// not DRM: it disables text selection, copy/cut, right-click, and image drag,
// and overlays a faint identifying watermark so leaked screenshots are
// traceable. A determined user can still screen-record — the browser cannot
// prevent that. Server-side enrollment gating + the authenticated media proxy
// are the real access controls.

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function watermarkStyle(text: string): React.CSSProperties {
  const label = escapeXml(text.slice(0, 64));
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'><text x='10' y='110' transform='rotate(-30 160 100)' fill='rgba(120,120,120,0.10)' font-family='sans-serif' font-size='15'>${label}</text></svg>`;
  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundRepeat: "repeat",
  };
}

export function ProtectedContent({
  children,
  className = "",
  watermark,
}: {
  children: ReactNode;
  className?: string;
  watermark?: string;
}) {
  const block = (e: React.SyntheticEvent) => e.preventDefault();
  return (
    <div
      className={`relative select-none ${className}`}
      onContextMenu={block}
      onCopy={block}
      onCut={block}
      onDragStart={block}
    >
      {children}
      {watermark && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={watermarkStyle(watermark)}
        />
      )}
    </div>
  );
}
