import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/header/SiteHeader";
import { CaseHero } from "@/components/projects/CaseHero";
import { CaseSection } from "@/components/projects/CaseSection";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Tag, Tags } from "@/components/ui/Tag";
import { asset } from "@/lib/content/assets";
import { site, type Project } from "@/lib/content/site";
import { pad2 } from "@/lib/cx";
import { getDictionary, getLocale, type Dictionary } from "@/lib/i18n/dictionary";
import styles from "./page.module.css";

type CaseSectionKey = keyof Dictionary["projects"]["case"]["sections"];

/** Order of the blocks on every case study. */
const ORDER: CaseSectionKey[] = [
  "overview",
  "problem",
  "solution",
  "role",
  "features",
  "architecture",
  "stack",
  "decisions",
  "challenges",
  "solutions",
  "results",
  "learned",
  "gallery",
  "live",
  "github",
];

/**
 * Written content of a case study: `projects.items.<key>.case` in i18n.json, every leaf {pt, en, es}.
 * No project has one yet; blocks without content are simply not rendered.
 */
interface CaseContent {
  role?: string;
  timeline?: string;
  status?: string;
  sections?: Partial<Record<CaseSectionKey, { title?: string; body?: string[] }>>;
}

function findProject(slug: string): Project | undefined {
  return site.projects.find((project) => project.slug === slug);
}

/** A case page exists only with `caseStudy: true`; in development the template renders anyway, for review. */
function isPublished(project: Project): boolean {
  return project.caseStudy || process.env.NODE_ENV !== "production";
}

// The whole route is static output (params come from generateStaticParams, text from i18n.json).
// An unknown slug is rendered before anything is sent, so it answers a real 404 instead of a
// streamed fallback shell with status 200.
export const ensureStatic = "navigation";
// Nothing on the page is meaningful without the slug, so there is no App Shell to show instantly;
// case studies are opened with full page loads from the project cards.
export const instant = false;

// Cache Components needs at least one param to validate the route: every project is listed and the
// ones without a case study answer 404.
export function generateStaticParams() {
  return site.projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project || !isPublished(project)) return {};
  const t = await getDictionary();
  const copy = t.projects.items[project.key];
  return { title: `${copy.title} — ${site.person.name}`, description: copy.description };
}

export default async function CaseStudyPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { slug } = await params;
  const found = findProject(slug);
  if (!found || !isPublished(found)) notFound();
  const project: Project = found;

  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const copy = t.projects.items[project.key];
  const content: CaseContent = (copy as { case?: CaseContent }).case ?? {};
  const labels = t.projects.case;
  const images = project.images.map(asset);

  const meta = [
    content.role ? { label: labels.meta.role, value: content.role } : null,
    content.timeline ? { label: labels.meta.timeline, value: content.timeline } : null,
    project.tech.length ? { label: labels.meta.stack, value: project.tech.join(" · ") } : null,
    content.status ? { label: labels.meta.status, value: content.status } : null,
  ].filter((item) => item !== null);

  const links = [
    project.live ? { label: labels.links.live, href: project.live, primary: true } : null,
    project.github ? { label: labels.links.github, href: project.github } : null,
  ].filter((item) => item !== null);

  function block(key: CaseSectionKey): { title?: string; body: ReactNode } | null {
    switch (key) {
      case "stack":
        return project.tech.length
          ? {
              body: (
                <Tags>
                  {project.tech.map((item) => (
                    <Tag key={item}>{item}</Tag>
                  ))}
                </Tags>
              ),
            }
          : null;
      case "gallery":
        // The first screenshot is already the main image at the top.
        return images.length > 1
          ? {
              body: (
                <div className={styles.gallery}>
                  {images.slice(1).map((image) => (
                    <div key={image.src} className={styles.shot}>
                      <Image src={image.src} alt="" fill sizes="(max-width: 720px) 100vw, 420px" className={styles.shotImg} />
                    </div>
                  ))}
                </div>
              ),
            }
          : null;
      case "live":
        return project.live
          ? {
              body: (
                <ArrowLink href={project.live} size="lg" newTabLabel={t.a11y.newTab}>
                  {labels.links.live}
                </ArrowLink>
              ),
            }
          : null;
      case "github":
        return project.github
          ? {
              body: (
                <ArrowLink href={project.github} size="lg" newTabLabel={t.a11y.newTab}>
                  {labels.links.github}
                </ArrowLink>
              ),
            }
          : null;
      default: {
        const section = content.sections?.[key];
        if (!section?.body?.length) return null;
        return {
          title: section.title,
          body: section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>),
        };
      }
    }
  }

  const blocks = ORDER.flatMap((key) => {
    const entry = block(key);
    return entry ? [{ key, ...entry }] : [];
  });

  return (
    <>
      <SiteHeader onHome={false} />
      <main className={styles.page}>
        <CaseHero
          back={{ label: t.nav.projetos, href: `/${locale}#projetos` }}
          index={project.index}
          category={copy.category}
          title={copy.title}
          summary={copy.description}
          meta={meta}
          links={links}
          image={images[0]}
        />
        <div className={styles.sections}>
          {blocks.map(({ key, title, body }, i) => (
            <CaseSection key={key} id={key} index={pad2(i + 1)} label={labels.sections[key]} title={title}>
              {body}
            </CaseSection>
          ))}
        </div>
      </main>
    </>
  );
}
