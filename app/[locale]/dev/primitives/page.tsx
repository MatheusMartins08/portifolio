import { notFound } from "next/navigation";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";
import { Icon, iconNames } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tag, Tags } from "@/components/ui/Tag";
import { site } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./page.module.css";

/**
 * Development-only sheet to check the primitives against design-system/previews.
 * Captions are component names (code identifiers); every visible copy comes from i18n.json.
 * Returns 404 in production builds.
 */
export default async function PrimitivesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const t = await getDictionary();
  const github = site.social.github;

  return (
    <main className={styles.page}>
      <section className={styles.block}>
        <p className={styles.cap}>Button</p>
        <div className={styles.row}>
          <Button variant="primary" icon="arrow-up-right">{t.contact.cta}</Button>
          <Button variant="solid" icon="arrow-right">{t.projects.viewSite}</Button>
          <Button variant="ghost" icon="arrow-down" href={site.cv.href} download="">{t.nav.cv}</Button>
          <Button variant="primary" loading>{t.contact.form.sending}</Button>
        </div>
        <div className={styles.row}>
          <Button variant="primary" size="sm" icon="arrow-right">{t.contact.form.send}</Button>
          <Button variant="ghost" size="sm" icon="arrow-up-right" href={github}>{t.contact.channels.github}</Button>
          <Button variant="solid" size="lg" icon="arrow-up-right" href={github}>{t.projects.viewGithub}</Button>
        </div>
      </section>

      <section className={styles.block}>
        <p className={styles.cap}>ArrowLink</p>
        <div className={styles.row}>
          <ArrowLink href={site.social.linkedin} size="sm" newTabLabel={t.a11y.newTab}>{t.contact.channels.linkedin}</ArrowLink>
          <ArrowLink href={github} size="sm" newTabLabel={t.a11y.newTab}>{t.contact.channels.github}</ArrowLink>
          <ArrowLink href="#case" icon="arrow-right">{t.projects.caseStudy}</ArrowLink>
        </div>
        <div>
          <p className={styles.cap}>{t.projects.moreWork}</p>
          <ArrowLink href={github} size="lg" newTabLabel={t.a11y.newTab}>{t.projects.viewGithub}</ArrowLink>
        </div>
      </section>

      <section className={styles.block}>
        <p className={styles.cap}>SectionLabel</p>
        <SectionLabel index="01">{t.about.label}</SectionLabel>
        <SectionLabel index="02" rule>{t.services.label}</SectionLabel>
        <SectionLabel>{t.projects.moreWork}</SectionLabel>
      </section>

      <section className={styles.block}>
        <p className={styles.cap}>Tag</p>
        <Tags>
          {t.experience.items.freelance.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Tags>
        <div className={styles.row}>
          <Tag tone="quiet">{t.services.web.label}</Tag>
          <Tag tone="quiet">{t.services.ai.label}</Tag>
          <Tag tone="accent">{t.experience.ui.current}</Tag>
        </div>
      </section>

      <section className={styles.block}>
        <p className={styles.cap}>StatusDot</p>
        <div className={styles.row}>
          <StatusDot tone="open">{t.about.cards.status}</StatusDot>
          <StatusDot tone="busy">{t.about.cards.status}</StatusDot>
          <StatusDot tone="away">{t.about.cards.status}</StatusDot>
        </div>
      </section>

      <section className={styles.block}>
        <p className={styles.cap}>Icon</p>
        <div className={styles.icons}>
          {iconNames.map((name) => (
            <div key={name} className={styles.cell}>
              <Icon name={name} size={20} />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.block}>
        <p className={styles.cap}>Reveal</p>
        <div className={styles.cols}>
          {(["up", "fade", "blur", "clip"] as const).map((variant, i) => (
            <Reveal key={variant} variant={variant} delay={i * 90} className={styles.box}>
              <span className={styles.cap}>{variant}</span>
              <b>{t.hero.phrases[i % t.hero.phrases.length]}</b>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
