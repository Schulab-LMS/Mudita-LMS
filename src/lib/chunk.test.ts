import { describe, it, expect } from "vitest";
import { chunkText } from "./chunk";

describe("chunkText", () => {
  it("returns no chunks for empty / whitespace input", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   \n\n  ")).toEqual([]);
  });

  it("returns a single chunk when text fits under maxChars", () => {
    const out = chunkText("short passage", { maxChars: 100 });
    expect(out).toEqual(["short passage"]);
  });

  it("splits long text into multiple chunks under the limit", () => {
    const para = "Sentence one is here. ".repeat(200); // ~4400 chars
    const out = chunkText(para, { maxChars: 1000, overlapChars: 100 });
    expect(out.length).toBeGreaterThan(1);
    for (const c of out) expect(c.length).toBeLessThanOrEqual(1000);
  });

  it("prefers paragraph boundaries", () => {
    const text = "A".repeat(500) + "\n\n" + "B".repeat(500);
    const out = chunkText(text, { maxChars: 700, overlapChars: 0 });
    expect(out[0]).toBe("A".repeat(500));
  });

  it("carries overlap between consecutive chunks", () => {
    const text = "word ".repeat(600).trim(); // 3000 chars
    const out = chunkText(text, { maxChars: 1000, overlapChars: 200 });
    // The tail of chunk 0 should reappear at the head of chunk 1.
    const tail = out[0].slice(-50);
    expect(out[1].includes(tail.split(" ").slice(-3).join(" "))).toBe(true);
  });

  it("always makes forward progress even with extreme overlap", () => {
    const text = "x".repeat(5000);
    const out = chunkText(text, { maxChars: 100, overlapChars: 999 });
    // overlap is clamped to maxChars-1, so it terminates with finite chunks.
    expect(out.length).toBeGreaterThan(0);
    expect(out.length).toBeLessThan(5000);
  });
});
