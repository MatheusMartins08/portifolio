import { HeroBackdrop } from "@/components/hero/HeroBackdrop";
import { Section } from "@/components/layout/Section";
import { SkillFolder } from "@/components/skills/SkillFolder";
import { Reveal } from "@/components/ui/Reveal";
import { Statement } from "@/components/ui/Statement";
import { sectionIndex, site } from "@/lib/content/site";
import { cssVars } from "@/lib/cx";
import { getDictionary } from "@/lib/i18n/dictionary";
import { balancedColumns } from "@/lib/layout";
import styles from "./SkillsSection.module.css";

export async function SkillsSection() {
  const t = await getDictionary();
  const count = site.skills.length;
  // The CSS picks one by the width available (how many folders fit); each is balanced for the count.
  const columns = cssVars({
    "--cols-2": balancedColumns(count, 2),
    "--cols-3": balancedColumns(count, 3),
    "--cols-4": balancedColumns(count, 4),
  });

  return (
    <Section id="skills" labelledBy="skills-title">
      <div className={styles.stage}>
        {/* The Hero's lightning field, here without its entrance; the lines keep clear of the title. */}
        <HeroBackdrop variant="section" holes="h2" unit={110} />

        <Statement
          label={t.skills.label}
          index={sectionIndex("skills")}
          highlight={t.skills.statementHighlight}
          headingId="skills-title"
        >
          {t.skills.statement}
        </Statement>

        {/* .mf-folder-grid: items and order from site.json, categories from i18n. */}
        <div className={styles.fit}>
          <div className={styles.grid} style={columns}>
            {site.skills.map((folder, i) => (
              <Reveal key={folder.key} variant="fade" delay={i * 90} className={styles.cell}>
                <SkillFolder
                  index={folder.index}
                  title={t.skills.folders[folder.key]}
                  icon={folder.icon}
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
        </div>
      </div>
    </Section>
  );
}
