import { Section } from "@/components/layout/Section";
import { SkillFolder } from "@/components/skills/SkillFolder";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { sectionIndex, site } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./SkillsSection.module.css";

export async function SkillsSection() {
  const t = await getDictionary();
  return (
    <Section id="skills" tone="sand-2" labelledBy="skills-title">
      <SectionLabel as="h2" id="skills-title" index={sectionIndex("skills")}>
        {t.skills.label}
      </SectionLabel>

      {/* .mf-folder-grid: the four folders; items and order from site.json, categories from i18n. */}
      <div className={styles.grid}>
        {site.skills.map((folder, i) => (
          <Reveal key={folder.key} variant="fade" delay={i * 90}>
            <SkillFolder
              index={folder.index}
              title={t.skills.folders[folder.key]}
              unit={t.skills.unit}
              openLabel={t.skills.open}
              closeLabel={t.skills.close}
              items={folder.items.map((item) => ({
                name: item.name,
                ext: item.ext,
                glyph: item.glyph,
                category: t.skills.categories[item.category],
              }))}
            />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
