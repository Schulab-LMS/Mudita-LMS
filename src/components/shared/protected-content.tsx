"use client";

import type { ReactNode } from "react";

// Best-effort content protection for curriculum material. This is a DETERRENT,
// not DRM: it disables text selection, copy/cut, right-click, and image drag so
// content can't be trivially exported. A determined user can still screenshot
// or screen-record — the browser cannot prevent that. Server-side enrollment
// gating + the authenticated media proxy are the real access controls.
export function ProtectedContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const block = (e: React.SyntheticEvent) => e.preventDefault();
  return (
    <div
      className={`select-none ${className}`}
      onContextMenu={block}
      onCopy={block}
      onCut={block}
      onDragStart={block}
    >
      {children}
    </div>
  );
}
