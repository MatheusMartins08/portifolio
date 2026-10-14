import { Section } from "@/components/layout/Section";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { sectionIndex } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function ExperienceSection() {
  const t = await getDictionary();
  return (
    <Section id="experiencia" labelledBy="experiencia-title">
      <SectionLabel as="h2" id="experiencia-title" index={sectionIndex("experiencia")}>
        {t.experience.label}
      </SectionLabel>
    </Section>
  );
}
