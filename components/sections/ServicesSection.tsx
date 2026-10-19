import { Section } from "@/components/layout/Section";
import { ServiceStack } from "@/components/services/ServiceStack";
import { Statement } from "@/components/ui/Statement";
import { sectionIndex, site } from "@/lib/content/site";
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

      {/* Services in site.json order, as a stack of cards on scroll. */}
      <ServiceStack
        items={site.services.map((service) => {
          const copy = t.services[service.key];
          return {
            key: service.key,
            index: service.index,
            motif: service.motif,
            label: copy.label,
            title: copy.title,
            description: copy.description,
            highlights: copy.highlights,
          };
        })}
      />
    </Section>
  );
}
