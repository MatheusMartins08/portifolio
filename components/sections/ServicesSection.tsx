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

      {/* Services in site.json order: two on the first row (7/5, the second offset down), three on the
          next. Each row enters on its own, so the stagger restarts per row. */}
      <div className={styles.grid}>
        {site.services.map((service, i) => {
          const copy = t.services[service.key];
          const place = i === 0 ? styles.lead : i === 1 ? styles.side : styles.trio;
          return (
            <Reveal key={service.key} variant="blur" delay={(i < 2 ? i : i - 2) * 120} className={place}>
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
