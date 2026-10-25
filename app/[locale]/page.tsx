import type { Metadata } from "next";
import { SiteHeader } from "@/components/header/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { site } from "@/lib/content/site";
import { getDictionary, getLocale } from "@/lib/i18n/dictionary";
import { homeJsonLd, jsonLdScript, localeAlternates, openGraphFor } from "@/lib/seo";

/** The home's own canonical and language alternates, and its Open Graph as a profile page. */
export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const [firstName, ...rest] = site.person.fullName.split(" ");
  return {
    alternates: localeAlternates(locale),
    openGraph: {
      ...openGraphFor(locale, t),
      type: "profile",
      firstName,
      lastName: rest.join(" "),
      url: `/${locale}`,
    },
  };
}

export default async function HomePage() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <>
      {/* Structured data: who this site is about (see homeJsonLd). Not rendered. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(homeJsonLd(locale, t)) }} />
      <SiteHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <ExperienceSection />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
