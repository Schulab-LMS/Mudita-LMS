import { describe, it, expect } from "vitest";
import { sanitize, sanitizeText } from "./sanitize";

describe("sanitize", () => {
  it("removes script tags", () => {
    const dirty = `<p>hi</p><script>alert(1)</script>`;
    expect(sanitize(dirty)).toBe("<p>hi</p>");
  });

  it("removes inline event handlers", () => {
    const dirty = `<img src="/x.png" onerror="alert(1)" alt="x">`;
    const clean = sanitize(dirty);
    expect(clean).not.toMatch(/onerror/i);
    expect(clean).toMatch(/src="\/x.png"/);
  });

  it("strips javascript: URLs from links", () => {
    const dirty = `<a href="javascript:alert(1)">click</a>`;
    const clean = sanitize(dirty);
    expect(clean).not.toMatch(/javascript:/i);
  });

  it("allows embed from YouTube but not arbitrary hosts", () => {
    const yt = `<iframe src="https://www.youtube.com/embed/abc"></iframe>`;
    const bad = `<iframe src="https://evil.example.com/x"></iframe>`;
    expect(sanitize(yt)).toMatch(/youtube.com/);
    expect(sanitize(bad)).not.toMatch(/evil.example.com/);
  });

  it("preserves headings and semantic tags we added to the allow-list", () => {
    const dirty = `<h2>Title</h2><figure><img src="/x.png" alt="x"><figcaption>c</figcaption></figure>`;
    const clean = sanitize(dirty);
    expect(clean).toMatch(/<h2>/);
    expect(clean).toMatch(/<figure>/);
    expect(clean).toMatch(/<figcaption>/);
  });
});

describe("sanitizeText", () => {
  it("strips every tag and keeps the text", () => {
    expect(sanitizeText("<p>hello <b>world</b></p>")).toBe("hello world");
  });

  it("drops script tags entirely (content and all)", () => {
    expect(sanitizeText("nice<script>alert(1)</script> day")).toBe("nice day");
  });

  it("collapses whitespace and trims", () => {
    expect(sanitizeText("  foo\n\n  bar\t baz  ")).toBe("foo bar baz");
  });

  it("removes dangerous href schemes along with the link wrapper", () => {
    expect(sanitizeText(`<a href="javascript:alert(1)">click</a>`)).toBe("click");
  });

  it("returns empty string for HTML that holds no text", () => {
    expect(sanitizeText("<script>alert(1)</script>")).toBe("");
  });
});
