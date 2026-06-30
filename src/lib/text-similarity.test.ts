import { describe, it, expect } from "vitest";
import {
  words,
  wordShingles,
  jaccard,
  shingleSimilarity,
  longestSharedWordRun,
  overCopyScore,
} from "./text-similarity";

describe("words", () => {
  it("lowercases, strips punctuation, collapses whitespace", () => {
    expect(words("The Moon's phases!  Bright.")).toEqual([
      "the",
      "moon",
      "s",
      "phases",
      "bright",
    ]);
  });
  it("handles unicode letters/numbers", () => {
    expect(words("Café 3 niños")).toEqual(["café", "3", "niños"]);
  });
});

describe("wordShingles", () => {
  it("produces contiguous k-grams", () => {
    expect(wordShingles("a b c d", 2)).toEqual(new Set(["a b", "b c", "c d"]));
  });
  it("short text (< k words) yields a single shingle of itself", () => {
    expect(wordShingles("a b", 5)).toEqual(new Set(["a b"]));
  });
});

describe("jaccard", () => {
  it("identical sets → 1, disjoint → 0", () => {
    expect(jaccard(new Set(["x"]), new Set(["x"]))).toBe(1);
    expect(jaccard(new Set(["x"]), new Set(["y"]))).toBe(0);
  });
  it("empty vs empty → 0 (no false 1)", () => {
    expect(jaccard(new Set(), new Set())).toBe(0);
  });
});

describe("shingleSimilarity", () => {
  it("identical text → 1", () => {
    const t = "the moon is lit by sunlight as it orbits the earth";
    expect(shingleSimilarity(t, t)).toBe(1);
  });
  it("unrelated text → low", () => {
    expect(
      shingleSimilarity(
        "the moon orbits the earth in a month",
        "loops repeat blocks in a scratch program"
      )
    ).toBeLessThan(0.1);
  });
});

describe("longestSharedWordRun", () => {
  it("counts the longest verbatim run in words", () => {
    const src = "moon phases come from the angle of sunlight on the moon";
    const copied = "today we learn that moon phases come from the angle of light";
    // "moon phases come from the angle of" = 7-word verbatim run
    expect(longestSharedWordRun(src, copied)).toBe(7);
  });
  it("0 when nothing is shared", () => {
    expect(longestSharedWordRun("alpha beta", "gamma delta")).toBe(0);
  });
  it("0 on empty input", () => {
    expect(longestSharedWordRun("", "anything here")).toBe(0);
  });
});

describe("overCopyScore", () => {
  it("flags a near-verbatim section against the worst source", () => {
    const sources = [
      "loops let you repeat code",
      "moon phases come from the angle of sunlight hitting the moon as it orbits earth",
    ];
    const generated =
      "moon phases come from the angle of sunlight hitting the moon as it orbits earth";
    const r = overCopyScore(generated, sources);
    expect(r.similarity).toBe(1);
    expect(r.longestRun).toBeGreaterThanOrEqual(14);
  });
  it("original paraphrase scores low on both signals", () => {
    const sources = [
      "moon phases come from the angle of sunlight hitting the moon as it orbits earth",
    ];
    const generated =
      "as our Moon travels around us, different amounts of its sunlit side face Earth — that is why it looks different each night";
    const r = overCopyScore(generated, sources);
    expect(r.similarity).toBeLessThan(0.2);
    expect(r.longestRun).toBeLessThan(5);
  });
});
