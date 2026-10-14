import { Section } from "@/components/layout/Section";
import { Statement } from "@/components/ui/Statement";
import { sectionIndex } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function ContactSection() {
  const t = await getDictionary();
  return (
    <Section id="contato" labelledBy="contato-title">
      <Statement
        label={t.contact.label}
        index={sectionIndex("contato")}
        highlight={t.contact.statementHighlight}
        headingId="contato-title"
      >
        {t.contact.statement}
      </Statement>
    </Section>
  );
}
