import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Bricolage_Grotesque, Instrument_Serif } from "next/font/google";
import { htmlLang, isLocale, locales, ogLocale } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionary";
import { site } from "@/lib/content/site";
import { localeAlternates, siteUrl } from "@/lib/seo";
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

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const title = `${site.person.name} — ${t.footer.role}`;
  // Built from existing copy: role, the services statement and the about statement.
  const description = `${t.footer.role} · ${t.services.statement} ${t.about.statement}`;
  return {
    metadataBase: siteUrl,
    title: { default: title, template: `%s — ${site.person.name}` },
    description,
    applicationName: site.person.name,
    authors: [{ name: site.person.fullName, url: site.social.linkedin }],
    creator: site.person.fullName,
    alternates: localeAlternates(locale),
    openGraph: {
      type: "website",
      siteName: site.person.name,
      title,
      description,
      url: `/${locale}`,
      locale: ogLocale[locale],
      alternateLocale: locales.filter((other) => other !== locale).map((other) => ogLocale[other]),
    },
    twitter: { card: "summary_large_image", title, description },
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
