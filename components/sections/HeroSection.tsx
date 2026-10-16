import { Hero } from "@/components/hero/Hero";
import { asset } from "@/lib/content/assets";
import { site } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function HeroSection() {
  const t = await getDictionary();
  return (
    <Hero
      id="topo"
      greeting={t.hero.greeting}
      name={site.person.name}
      links={[
        { label: t.contact.channels.linkedin, href: site.social.linkedin, icon: "linkedin" },
        { label: t.contact.channels.github, href: site.social.github, icon: "github" },
      ]}
      newTabLabel={t.a11y.newTab}
      phrases={t.hero.phrases}
      photo={{
        image: asset(site.person.photo),
        alt: t.hero.photoAlt,
        hover: { image: asset(site.person.photoHover), alt: t.hero.photoHoverAlt },
      }}
      scroll={{ target: "#sobre", label: t.hero.scrollLabel, ariaLabel: t.hero.scrollAria }}
    />
  );
}
