import type { Metadata } from "next";
import { asset } from "@/lib/content/assets";
import { site } from "@/lib/content/site";
import { defaultLocale, htmlLang, locales, ogLocale, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary";

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

/** The home's title: the full name first (what people search for), then what he does. */
export function homeTitle(t: Dictionary): string {
  return `${site.person.fullName} | ${t.seo.title}`;
}

/** Open Graph shared by every page of a locale; pages add their own `url` and `type`. */
export function openGraphFor(locale: Locale, t: Dictionary) {
  return {
    siteName: site.person.fullName,
    title: homeTitle(t),
    description: t.seo.description,
    locale: ogLocale[locale],
    alternateLocale: locales.filter((other) => other !== locale).map((other) => ogLocale[other]),
  };
}

/**
 * Structured data for the home, one graph: the person (stable @id across languages), the website, the
 * profile page about him and the portfolio's projects. Built only from what the site itself shows:
 * name, photo, role, the About text, city, the profiles it links to, services, skills and projects.
 */
export function homeJsonLd(locale: Locale, t: Dictionary) {
  const root = absoluteUrl("/");
  const home = absoluteUrl(`/${locale}`);
  const person = { "@id": `${root}#person` };
  const website = { "@id": `${root}#website` };
  const photo = asset(site.person.photo);
  const image = { "@type": "ImageObject", url: absoluteUrl(photo.src), width: photo.width, height: photo.height };
  const knowsAbout = [
    ...new Set([
      ...site.services.map((service) => t.services[service.key].title),
      ...site.skills.flatMap((folder) => folder.items.map((item) => item.name)),
      ...site.projects.flatMap((project) => project.tech),
    ]),
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        ...person,
        name: site.person.fullName,
        alternateName: site.person.name,
        url: home,
        image,
        jobTitle: t.footer.role,
        description: t.about.paragraphs[0],
        address: {
          "@type": "PostalAddress",
          addressLocality: site.person.address.locality,
          addressRegion: site.person.address.region,
          addressCountry: site.person.address.country,
        },
        sameAs: [site.social.github, site.social.linkedin],
        knowsAbout,
      },
      {
        "@type": "WebSite",
        ...website,
        url: root,
        name: site.person.fullName,
        alternateName: site.person.name,
        inLanguage: locales.map((lang) => htmlLang[lang]),
        publisher: person,
      },
      {
        "@type": "ProfilePage",
        "@id": `${home}#profile`,
        url: home,
        name: homeTitle(t),
        description: t.seo.description,
        inLanguage: htmlLang[locale],
        isPartOf: website,
        about: person,
        mainEntity: person,
        primaryImageOfPage: image,
      },
      ...site.projects.map((project) => ({
        "@type": "CreativeWork",
        name: t.projects.items[project.key].title,
        description: t.projects.items[project.key].description,
        url: project.live ?? undefined,
        image: project.images[0] ? absoluteUrl(project.images[0]) : undefined,
        creator: person,
      })),
    ],
  };
}

/** JSON for a <script type="application/ld+json">, with "<" escaped so the payload cannot close the tag. */
export function jsonLdScript(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
