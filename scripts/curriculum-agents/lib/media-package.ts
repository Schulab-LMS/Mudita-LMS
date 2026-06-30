// Turn a VideoScript into the media deliverables: a human/tool-readable
// video/script.md and an assets-manifest.json (per-scene image prompts,
// narration for TTS, derived caption cues, thumbnail prompt). The media team or
// a pluggable image/TTS/assembly tool consumes the manifest; the finished video
// is uploaded to Mux by mux-upload.ts. Serializers are pure + unit-tested.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { VideoScript, AssetManifest, CaptionCue } from "./media-types";

/** Derive sequential caption cues (start/end seconds) from the scene durations. */
export function deriveCaptions(script: VideoScript): CaptionCue[] {
  const cues: CaptionCue[] = [];
  let t = 0;
  script.scenes.forEach((s, i) => {
    const start = t;
    const end = t + s.durationSec;
    cues.push({ index: i + 1, startSec: start, endSec: end, text: s.narration });
    t = end;
  });
  return cues;
}

export function toAssetManifest(script: VideoScript): AssetManifest {
  const totalDurationSec = script.scenes.reduce((sum, s) => sum + s.durationSec, 0);
  return {
    lessonTitle: script.lessonTitle,
    ageRange: script.ageRange,
    characterVariant: script.characterVariant,
    voiceoverStyle: script.voiceoverStyle,
    totalDurationSec,
    thumbnailPrompt: script.thumbnailPrompt,
    scenes: script.scenes.map((s, i) => ({
      index: i + 1,
      durationSec: s.durationSec,
      imagePrompt: s.visualPrompt,
      narration: s.narration,
      onScreenText: s.onScreenText ?? null,
    })),
    captions: deriveCaptions(script),
  };
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** video/script.md — readable shooting script for the media team. */
export function toScriptMd(script: VideoScript): string {
  const total = script.scenes.reduce((sum, s) => sum + s.durationSec, 0);
  const lines: string[] = [
    `# Video script — ${script.lessonTitle}`,
    `**Ages ${script.ageRange} · ${script.characterVariant} · ~${fmtTime(total)} · voiceover: ${script.voiceoverStyle}**`,
    "",
    `**Thumbnail prompt:** ${script.thumbnailPrompt}`,
    "",
    "---",
    "",
  ];
  let t = 0;
  script.scenes.forEach((s, i) => {
    lines.push(
      `## Scene ${i + 1} · ${fmtTime(t)}–${fmtTime(t + s.durationSec)} (${s.durationSec}s)`,
      "",
      `**Narration:** ${s.narration}`,
      "",
      `**Visual:** ${s.visualPrompt}`,
      ...(s.onScreenText ? ["", `**On-screen:** ${s.onScreenText}`] : []),
      "",
      "---",
      ""
    );
    t += s.durationSec;
  });
  return lines.join("\n");
}

/** Write video/script.md + video/assets-manifest.json under `<lessonDir>/video/`. */
export function writeMediaPackage(script: VideoScript, lessonDir: string): string[] {
  const dir = join(lessonDir, "video");
  mkdirSync(dir, { recursive: true });
  const scriptPath = join(dir, "script.md");
  const manifestPath = join(dir, "assets-manifest.json");
  writeFileSync(scriptPath, toScriptMd(script));
  writeFileSync(manifestPath, JSON.stringify(toAssetManifest(script), null, 2) + "\n");
  return [scriptPath, manifestPath];
}
