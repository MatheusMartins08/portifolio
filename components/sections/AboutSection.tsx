import { Section } from "@/components/layout/Section";
import { Statement } from "@/components/ui/Statement";
import { sectionIndex } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function AboutSection() {
  const t = await getDictionary();
  return (
    <Section id="sobre" labelledBy="sobre-title">
      <Statement
        label={t.about.label}
        index={sectionIndex("sobre")}
        highlight={t.about.statementHighlight}
        headingId="sobre-title"
      >
        {t.about.statement}
      </Statement>
    </Section>
  );
}
