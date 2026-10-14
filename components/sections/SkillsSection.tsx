import { Section } from "@/components/layout/Section";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { sectionIndex } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function SkillsSection() {
  const t = await getDictionary();
  return (
    <Section id="skills" tone="sand-2" labelledBy="skills-title">
      <SectionLabel as="h2" id="skills-title" index={sectionIndex("skills")}>
        {t.skills.label}
      </SectionLabel>
    </Section>
  );
}
