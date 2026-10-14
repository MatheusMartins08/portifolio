import { Section } from "@/components/layout/Section";
import { Statement } from "@/components/ui/Statement";
import { sectionIndex } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function ProjectsSection() {
  const t = await getDictionary();
  return (
    <Section id="projetos" labelledBy="projetos-title">
      <Statement
        label={t.projects.label}
        index={sectionIndex("projetos")}
        highlight={t.projects.statementHighlight}
        headingId="projetos-title"
      >
        {t.projects.statement}
      </Statement>
    </Section>
  );
}
