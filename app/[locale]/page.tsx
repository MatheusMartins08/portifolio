import { Header } from "@/components/header/Header";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { navSections, site } from "@/lib/content/site";
import { getDictionary, getLocale } from "@/lib/i18n/dictionary";
import styles from "./page.module.css";

export default async function HomePage() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <>
      <Header
        items={navSections.map((section) => ({ id: section.id, label: t.nav[section.id] }))}
        locale={locale}
        labels={{
          nav: t.a11y.nav,
          menu: t.nav.menu,
          close: t.nav.close,
          language: t.nav.language,
          cv: t.nav.cv,
          cvShort: t.nav.cvShort,
        }}
        cvHref={site.cv.href}
      />
      <main>
        <section id="topo" className={styles.hero} />
        <AboutSection />
        <ServicesSection />
        <ExperienceSection />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
      </main>
    </>
  );
}
