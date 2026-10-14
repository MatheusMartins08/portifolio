import type { MetadataRoute } from "next";
import { site } from "@/lib/content/site";
import { htmlLang, locales } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/seo";

/** Home in every language, plus published case studies; each URL lists its language alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", ...site.projects.filter((project) => project.caseStudy).map((project) => `/projects/${project.slug}`)];

  return paths.flatMap((path) => {
    const languages = Object.fromEntries(locales.map((lang) => [htmlLang[lang], absoluteUrl(`/${lang}${path}`)]));
    return locales.map((lang) => ({
      url: absoluteUrl(`/${lang}${path}`),
      changeFrequency: "monthly" as const,
      priority: path ? 0.7 : 1,
      alternates: { languages },
    }));
  });
}
