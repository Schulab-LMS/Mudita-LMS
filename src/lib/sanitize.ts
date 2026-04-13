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
