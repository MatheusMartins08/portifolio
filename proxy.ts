import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

/** First supported language from Accept-Language, honouring q-values; pt otherwise. */
function preferredLocale(header: string | null): Locale {
  if (!header) return defaultLocale;
  const ranked = header
    .split(",")
    .map((part, order) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return {
        lang: tag.trim().toLowerCase().split("-")[0],
        weight: q ? Number(q.slice(2)) : 1,
        order,
      };
    })
    .filter((entry) => entry.lang && entry.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.order - b.order);
  return ranked.map((entry) => entry.lang).find(isLocale) ?? defaultLocale;
}

/**
 * Every page lives under /pt, /en or /es. A path without a locale prefix is sent to the same path in
 * the visitor's language: "/" → "/en", "/fr" → "/pt/fr" (which then answers the localized 404).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) return NextResponse.next();

  const url = request.nextUrl.clone();
  const locale = preferredLocale(request.headers.get("accept-language"));
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(url);
  response.headers.set("Vary", "Accept-Language");
  return response;
}

export const config = {
  // Skip Next internals, image optimisation and anything that looks like a file (icon.svg,
  // sitemap.xml, robots.txt, /images/…), plus the generated icon routes.
  matcher: ["/((?!_next/|images/|apple-icon|icon|.*\\..*).*)"],
};
