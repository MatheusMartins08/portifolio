import { ExperienceTabs, type ExperienceGroupData } from "@/components/experience/ExperienceTabs";
import { Section } from "@/components/layout/Section";
import { Statement } from "@/components/ui/Statement";
import { sectionIndex, site, type ExperienceGroup } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";

/** Shape shared by every experience entry in i18n.json; each item fills only what applies. */
interface ExperienceCopy {
  title: string;
  org?: string;
  kind?: string;
  period?: string;
  place?: string;
  summary?: string;
  tags?: string[];
  details?: string[];
}

export async function ExperienceSection() {
  const t = await getDictionary();
  const ui = t.experience.ui;

  const groups: ExperienceGroupData[] = (Object.keys(site.experience) as ExperienceGroup[]).map((group) => ({
    id: group,
    label: t.experience.tabs[group],
    items: site.experience[group].map((entry) => {
      const copy = t.experience.items[entry.key] as ExperienceCopy;
      return {
        id: entry.key,
        ...copy,
        current: entry.current,
        currentLabel: ui[entry.currentLabel ?? "current"],
        future: entry.future,
        kicker: entry.future ? ui.nextChapter : undefined,
      };
    }),
  }));

  return (
    <Section id="experiencia" labelledBy="experiencia-title">
      <Statement
        label={t.experience.label}
        index={sectionIndex("experiencia")}
        highlight={t.experience.statementHighlight}
        labelId="experiencia-label"
        headingId="experiencia-title"
      >
        {t.experience.statement}
      </Statement>
      <ExperienceTabs groups={groups} labelledBy="experiencia-label" moreLabel={ui.more} lessLabel={ui.less} />
    </Section>
  );
}
