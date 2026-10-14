import Image from "next/image";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ImageAsset } from "@/lib/content/assets";
import styles from "./CaseHero.module.css";

interface CaseHeroProps {
  back: { label: string; href: string };
  index: string;
  category: string;
  title: string;
  summary?: string;
  /** My role, Timeline, Tech stack, Status… — only the ones that exist. */
  meta: Array<{ label: string; value: string }>;
  /** Live project (primary) and GitHub. */
  links: Array<{ label: string; href: string; primary?: boolean }>;
  image?: ImageAsset;
  imageAlt?: string;
}

/** Top of a case study: back link, label, title, summary, metadata grid, links and the main image. */
export function CaseHero({ back, index, category, title, summary, meta, links, image, imageAlt = "" }: CaseHeroProps) {
  return (
    <header className={styles.hero}>
      <ArrowLink href={back.href} icon="arrow-left" size="sm" external={false} className={styles.back}>
        {back.label}
      </ArrowLink>
      <div className={styles.head}>
        <SectionLabel index={index}>{category}</SectionLabel>
        <h1 className={styles.title}>{title}</h1>
        {summary ? <p className={styles.summary}>{summary}</p> : null}
      </div>
      {meta.length ? (
        <dl className={styles.meta}>
          {meta.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {links.length ? (
        <div className={styles.links}>
          {links.map((link) => (
            <Button
              key={link.href}
              href={link.href}
              variant={link.primary ? "primary" : "ghost"}
              size="sm"
              icon="arrow-up-right"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </Button>
          ))}
        </div>
      ) : null}
      <div className={styles.media}>
        {image ? (
          <Image
            src={image.src}
            alt={imageAlt}
            fill
            sizes="(max-width: 1260px) 100vw, 1180px"
            loading="eager"
            fetchPriority="high"
            className={styles.img}
          />
        ) : (
          <MediaPlaceholder variant="ui" />
        )}
      </div>
    </header>
  );
}
