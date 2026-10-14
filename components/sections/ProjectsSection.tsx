import { Section } from "@/components/layout/Section";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Statement } from "@/components/ui/Statement";
import { asset } from "@/lib/content/assets";
import { sectionIndex, site } from "@/lib/content/site";
import { getDictionary, getLocale } from "@/lib/i18n/dictionary";
import { cx } from "@/lib/cx";
import styles from "./ProjectsSection.module.css";

const SIZES = {
  feature: "(max-width: 860px) 100vw, 680px",
  half: "(max-width: 860px) 100vw, 480px",
  tall: "(max-width: 860px) 100vw, 480px",
} as const;

export async function ProjectsSection() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);

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

      {/* .mf-pgrid: Black Crown as feature (7 col), Métrica as half (5 col) offset down. */}
      <div className={styles.grid}>
        {site.projects.map((project) => {
          const copy = t.projects.items[project.key];
          return (
            <Reveal
              key={project.slug}
              variant="clip"
              as="div"
              className={cx(styles[project.size], project.offset && styles.offset)}
            >
              <ProjectCard
                size={project.size}
                index={project.index}
                category={copy.category}
                title={copy.title}
                description={copy.description}
                tech={project.tech}
                images={project.images.map(asset)}
                sizes={SIZES[project.size]}
                // Cards only link to a case study that exists.
                href={project.caseStudy ? `/${locale}/projects/${project.slug}` : undefined}
                live={project.live}
                github={project.github}
                labels={{
                  caseStudy: t.projects.caseStudy,
                  viewSite: t.projects.viewSite,
                  github: t.contact.channels.github,
                  cursor: t.projects.cursor,
                  newTab: t.a11y.newTab,
                }}
              />
            </Reveal>
          );
        })}
      </div>

      <div className={styles.more}>
        <SectionLabel>{t.projects.moreWork}</SectionLabel>
        <ArrowLink href={site.social.github} size="lg" newTabLabel={t.a11y.newTab}>
          {t.projects.viewGithub}
        </ArrowLink>
      </div>
    </Section>
  );
}
