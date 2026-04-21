import sanitizeHtml from "sanitize-html";

const defaultOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img", "h1", "h2", "h3", "h4", "h5", "h6",
    "figure", "figcaption", "video", "source", "iframe",
    "details", "summary", "mark", "abbr", "time",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "width", "height", "loading"],
    a: ["href", "title", "target", "rel"],
    iframe: ["src", "width", "height", "frameborder", "allowfullscreen"],
    video: ["src", "controls", "width", "height"],
    source: ["src", "type"],
    time: ["datetime"],
    "*": ["class", "id"],
  },
  allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
  allowedSchemes: ["http", "https", "mailto"],
};

export function sanitize(dirty: string): string {
  return sanitizeHtml(dirty, defaultOptions);
}

// For free-text fields (review bodies, titles, etc.) we don't want any HTML
// at all — the UI renders these as plain text, so anything tag-shaped is
// either an XSS attempt or noise. Strip every tag, decode entities, and
// collapse whitespace so the stored value is exactly what the reader sees.
export function sanitizeText(dirty: string): string {
  const stripped = sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });
  return stripped.replace(/\s+/g, " ").trim();
}
