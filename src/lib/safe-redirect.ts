// Accept a caller-supplied redirect path only when it's clearly an internal
// path — same origin, no protocol smuggling, no control chars. The usual
// `startsWith("/")` check is not enough: `//evil.com/x` begins with `/`
// but browsers resolve it as `https://evil.com/x` (protocol-relative URL),
// which hands Stripe an off-domain `return_url` and turns the route into
// an open redirect the moment the user bounces back.

const PROTOCOL_RELATIVE = /^\/\\/; // "/\\..." is another browser quirk
// Any C0 control character (0x00–0x1F) in a URL path can confuse parsers
// downstream (think `\r\n` header injection on a rewrite), so reject those.
const CONTROL_CHARS = /[\x00-\x1f]/;

export function isSafeInternalPath(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value.length === 0) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (PROTOCOL_RELATIVE.test(value)) return false;
  if (CONTROL_CHARS.test(value)) return false;
  return true;
}
