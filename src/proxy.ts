import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/navigation";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(en|ar|de)/:path*",
    // Exclude api, Next internals, and any file-with-extension (robots.txt,
    // sitemap.xml, icon.svg…). opengraph-image / twitter-image are extensionless
    // metadata routes, so they must be excluded explicitly or the i18n middleware
    // shadows them and they 404.
    "/((?!api|_next|_vercel|opengraph-image|twitter-image|.*\\..*).*)",
  ],
};
