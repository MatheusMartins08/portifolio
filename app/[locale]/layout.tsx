import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Bricolage_Grotesque, Instrument_Serif } from "next/font/google";
import { htmlLang, isLocale, locales } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionary";
import { site } from "@/lib/content/site";
import { absoluteUrl, homeTitle, openGraphFor, siteUrl } from "@/lib/seo";
import "../globals.css";

/** Hero only: the name (display cut via opsz) and the morphing tagline. Re-pointed in app/globals.css. */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});
const serif = Instrument_Serif({
  weight: "400",
  style: "italic",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Defaults for every page of a locale: the full name leads the title (inner pages: "Page | Matheus Freitas
 * Martins"), a description written for search results (i18n `seo`), authorship, and robots letting
 * Google show large image previews. Canonical, hreflang and the Open Graph url belong to each page (the
 * home and the case studies set their own), so a 404 never inherits the home's.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const title = homeTitle(t);
  const description = t.seo.description;
  const { fullName } = site.person;
  // Set it in the hosting's environment once the Search Console property exists (DNS verification needs nothing).
  const google = process.env.GOOGLE_SITE_VERIFICATION;
  return {
    metadataBase: siteUrl,
    title: { default: title, template: `%s | ${fullName}` },
    description,
    applicationName: fullName,
    authors: [{ name: fullName, url: absoluteUrl(`/${locale}`) }],
    creator: fullName,
    publisher: fullName,
    category: "technology",
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    openGraph: { type: "website", ...openGraphFor(locale, t) },
    twitter: { card: "summary_large_image", title, description },
    verification: google ? { google } : undefined,
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={htmlLang[locale]}
      className={`${GeistSans.variable} ${GeistMono.variable} ${display.variable} ${serif.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}
