import { describe, it, expect } from "vitest";
import {
  toAssetManifest,
  toScriptMd,
  deriveCaptions,
} from "../../scripts/curriculum-agents/lib/media-package";
import type { VideoScript } from "../../scripts/curriculum-agents/lib/media-types";

function script(): VideoScript {
  return {
    lessonTitle: "Why does the Moon change shape?",
    ageRange: "8–10",
    characterVariant: "Lumo Creator",
    voiceoverStyle: "energetic, clear",
    thumbnailPrompt: "Lumo Creator in a space costume pointing at the Moon",
    scenes: [
      {
        narration: "Hi explorers! Today we crack the case of the changing Moon.",
        visualPrompt: "Lumo Creator waving in front of a starry sky",
        onScreenText: "Moon Detective Mission",
        durationSec: 30,
      },
      {
        narration: "The Moon does not make its own light — the Sun lights it up.",
        visualPrompt: "The Sun's light hitting the Moon",
        onScreenText: null,
        durationSec: 45,
      },
    ],
  };
}

describe("deriveCaptions", () => {
  it("produces sequential, non-overlapping cues that match scene durations", () => {
    const cues = deriveCaptions(script());
    expect(cues).toHaveLength(2);
    expect(cues[0]).toMatchObject({ index: 1, startSec: 0, endSec: 30 });
    expect(cues[1]).toMatchObject({ index: 2, startSec: 30, endSec: 75 });
    expect(cues[1].text).toContain("Sun");
  });
});

describe("toAssetManifest", () => {
  it("sums total duration and maps per-scene prompts", () => {
    const m = toAssetManifest(script());
    expect(m.totalDurationSec).toBe(75);
    expect(m.scenes).toHaveLength(2);
    expect(m.scenes[0].imagePrompt).toContain("Lumo Creator");
    expect(m.scenes[1].onScreenText).toBeNull();
    expect(m.captions).toHaveLength(2);
    expect(m.thumbnailPrompt).toContain("Moon");
  });
});

describe("toScriptMd", () => {
  it("renders scenes with timecodes, narration, and visuals", () => {
    const md = toScriptMd(script());
    expect(md).toContain("# Video script — Why does the Moon change shape?");
    expect(md).toContain("Lumo Creator");
    expect(md).toContain("## Scene 1 · 0:00–0:30 (30s)");
    expect(md).toContain("## Scene 2 · 0:30–1:15 (45s)");
    expect(md).toContain("**Narration:**");
    expect(md).toContain("**On-screen:** Moon Detective Mission");
  });
});
