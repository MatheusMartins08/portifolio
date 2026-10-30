import { Section } from "@/components/layout/Section";
import { MoreWork } from "@/components/projects/MoreWork";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectsArc } from "@/components/projects/ProjectsArc";
import { Reveal } from "@/components/ui/Reveal";
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
        align="center"
        label={t.projects.label}
        index={sectionIndex("projetos")}
        highlight={t.projects.statementHighlight}
        headingId="projetos-title"
      >
        {t.projects.statement}
      </Statement>

      {/* .mf-pgrid: Black Crown as feature (7 col), Métrica as half (5 col) offset down. */}
      <div className={styles.grid}>
        {/* First, so the cards paint over it. */}
        <ProjectsArc />
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
                imageAlts={copy.imageAlts}
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

      <MoreWork
        kicker={t.projects.moreWork}
        line={t.projects.moreWorkLine}
        href={site.social.github}
        label={t.contact.channels.github}
        handle={site.social.githubHandle}
        status={t.projects.githubStatus}
        newTabLabel={t.a11y.newTab}
      />
    </Section>
  );
}
