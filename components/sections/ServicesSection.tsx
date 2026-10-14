import { Section } from "@/components/layout/Section";
import { Statement } from "@/components/ui/Statement";
import { sectionIndex } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function ServicesSection() {
  const t = await getDictionary();
  return (
    <Section id="servicos" tone="sand-2" labelledBy="servicos-title">
      <Statement
        label={t.services.label}
        index={sectionIndex("servicos")}
        highlight={t.services.statementHighlight}
        headingId="servicos-title"
      >
        {t.services.statement}
      </Statement>
    </Section>
  );
}
