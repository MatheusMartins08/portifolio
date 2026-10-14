import { Coordinates } from "@/components/about/Coordinates";
import { InfoCard, InfoNote, InfoValue } from "@/components/about/InfoCard";
import { ProfileTerminal } from "@/components/about/ProfileTerminal";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Statement } from "@/components/ui/Statement";
import { StatusDot } from "@/components/ui/StatusDot";
import { sectionIndex, site } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./AboutSection.module.css";

export async function AboutSection() {
  const t = await getDictionary();
  const { terminal, cards } = t.about;

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

      <div className={styles.grid}>
        <ProfileTerminal
          className={styles.terminal}
          title={site.terminal.title}
          path={site.terminal.path}
          prompt={site.terminal.prompt}
          command={terminal.command}
          entries={[
            { key: "name", value: site.person.fullName },
            { key: "role", value: terminal.role },
            { key: "since", value: site.person.since },
            { key: "study", value: terminal.study },
          ]}
          paragraphs={terminal.paragraphs}
          highlight={terminal.highlight}
          status={terminal.status.replace("{count}", String(terminal.paragraphs.length))}
        />

        <div className={styles.cards}>
          <Reveal className={styles.status}>
            <InfoCard label={cards.labels.status} aside={cards.statusAside} layout="row" className={styles.fill}>
              <StatusDot tone={site.status}>{cards.status}</StatusDot>
            </InfoCard>
          </Reveal>
          <Reveal delay={90}>
            <InfoCard
              label={cards.labels.resume}
              tone="sand"
              className={styles.fill}
              footer={
                <Button variant="ghost" size="sm" icon="arrow-down" href={site.cv.href} download="">
                  {t.nav.cv}
                </Button>
              }
            >
              <p>{cards.resume}</p>
            </InfoCard>
          </Reveal>
          <Reveal delay={180} className={styles.location}>
            <InfoCard
              label={cards.labels.location}
              className={styles.fill}
              footer={<Coordinates lat={site.location.lat} lon={site.location.lon} />}
            >
              <InfoValue>{cards.locationCity}</InfoValue>
              <InfoNote>{cards.locationRegion}</InfoNote>
            </InfoCard>
          </Reveal>
          <Reveal delay={270}>
            <InfoCard label={cards.labels.availableFor} tone="deep" className={styles.fill}>
              <InfoValue>{cards.availableFor}</InfoValue>
              <InfoNote>{cards.availableWhere}</InfoNote>
            </InfoCard>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
