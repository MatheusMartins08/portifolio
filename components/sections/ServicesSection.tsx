import { Section } from "@/components/layout/Section";
import { ScrollLightning } from "@/components/lightning/ScrollLightning";
import { ServiceStack } from "@/components/services/ServiceStack";
import { Statement } from "@/components/ui/Statement";
import { sectionIndex, site } from "@/lib/content/site";
import { cx } from "@/lib/cx";
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

      {/* Services in site.json order, as a stack of cards on scroll, with a bolt drawn down each side. */}
      <div className={styles.stage}>
        <div className={cx(styles.rail, styles.left)}>
          <ScrollLightning shape="rail" seed={31} />
        </div>
        <div className={cx(styles.rail, styles.right)}>
          <ScrollLightning shape="rail" seed={47} />
        </div>
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
      </div>
    </Section>
  );
}
