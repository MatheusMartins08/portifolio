import { Section } from "@/components/layout/Section";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Reveal } from "@/components/ui/Reveal";
import { Statement } from "@/components/ui/Statement";
import { sectionIndex, site } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./ServicesSection.module.css";

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

      {/* Only these two services (site.json): 7/5 with the second one offset down. */}
      <div className={styles.grid}>
        {site.services.map((service, i) => {
          const copy = t.services[service.key];
          return (
            <Reveal key={service.key} variant="blur" delay={i * 120}>
              <ServiceCard
                index={service.index}
                label={copy.label}
                motif={service.motif}
                size={service.size}
                title={copy.title}
                description={copy.description}
                highlights={copy.highlights}
              />
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
