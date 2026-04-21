import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/navigation";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(en|ar|de)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
