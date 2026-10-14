import type { Metadata } from "next";
import { defaultLocale, htmlLang, locales, type Locale } from "@/lib/i18n/config";

/**
 * Public origin of the site, for canonical URLs, hreflang, the sitemap and Open Graph.
 * NEXT_PUBLIC_SITE_URL wins (set it once there is a custom domain); on Vercel the production URL is
 * injected automatically; locally it falls back to localhost.
 */
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
);

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

/** Canonical + hreflang alternates for a page that exists in every locale. `path` is what follows the locale. */
export function localeAlternates(locale: Locale, path = ""): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const lang of locales) languages[htmlLang[lang]] = `/${lang}${path}`;
  languages["x-default"] = `/${defaultLocale}${path}`;
  return { canonical: `/${locale}${path}`, languages };
}
