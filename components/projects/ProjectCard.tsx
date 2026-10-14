"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Icon } from "@/components/ui/Icon";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { Tag, Tags } from "@/components/ui/Tag";
import type { ImageAsset } from "@/lib/content/assets";
import { cx, pad2 } from "@/lib/cx";
import styles from "./ProjectCard.module.css";

export interface ProjectCardLabels {
  caseStudy: string;
  viewSite: string;
  github: string;
  /** Tooltip next to the cursor: "View". */
  cursor: string;
  newTab: string;
}

interface ProjectCardProps {
  /** feature = 7 columns, half / tall = 5 columns in the projects grid. */
  size?: "feature" | "half" | "tall";
  index: string;
  category: string;
  title: string;
  description: string;
  tech: string[];
  /** Up to two screenshots: the first at rest, the second cross-fades in on hover. */
  images: ImageAsset[];
  /** next/image `sizes` for the media width. */
  sizes: string;
  /** Case study page — only when it exists. Without it, image and title open the live site. */
  href?: string;
  live?: string | null;
  github?: string | null;
  labels: ProjectCardLabels;
  className?: string;
}

/**
 * Project card where the image leads: slow zoom, second screenshot on hover with a 01 / 02 counter,
 * a "VIEW ↗" tooltip that follows the cursor (pointer devices only), title sliding with an arrow and a
 * bottom rule that lights up in terracota.
 */
export function ProjectCard({
  size = "half",
  index,
  category,
  title,
  description,
  tech,
  images,
  sizes,
  href,
  live,
  github,
  labels,
  className,
}: ProjectCardProps) {
  const media = useRef<HTMLAnchorElement>(null);
  const bubble = useRef<HTMLSpanElement>(null);

  function onPointerMove(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType === "touch" || !media.current || !bubble.current) return;
    const rect = media.current.getBoundingClientRect();
    bubble.current.style.setProperty("--bx", `${event.clientX - rect.left}px`);
    bubble.current.style.setProperty("--by", `${event.clientY - rect.top}px`);
  }

  const shots = images.slice(0, 2);
  const target = href ?? live ?? github ?? "#";
  const external = !href && /^https?:/.test(target);
  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <article className={cx(styles.proj, styles[size], className)}>
      {/* Duplicate of the title link for pointer users; keyboard and screen readers use the title. */}
      <a
        ref={media}
        className={styles.media}
        href={target}
        {...linkProps}
        tabIndex={-1}
        aria-hidden="true"
        onPointerMove={onPointerMove}
      >
        {shots.length ? (
          <>
            <Image src={shots[0].src} alt="" fill sizes={sizes} className={styles.img} />
            {shots[1] ? <Image src={shots[1].src} alt="" fill sizes={sizes} className={cx(styles.img, styles.alt)} /> : null}
            {shots[1] ? (
              <span className={styles.count}>
                <b>{pad2(1)}</b>
                <i>{pad2(2)}</i> / {pad2(shots.length)}
              </span>
            ) : null}
          </>
        ) : (
          <MediaPlaceholder variant="ui" />
        )}
        <span className={styles.bubble} ref={bubble}>
          <span>{labels.cursor}</span>
          <Icon name="arrow-up-right" size={12} />
        </span>
      </a>

      <div className={styles.meta}>
        <span className={styles.idx}>{index}</span>
        <span>{category}</span>
      </div>
      <h3 className={styles.title}>
        <a href={target} {...linkProps}>
          <span>{title}</span>
          <Icon name="arrow-up-right" size={20} className={styles.arrow} />
          {external ? <span className="sr-only"> {labels.newTab}</span> : null}
        </a>
      </h3>
      <p className={styles.desc}>{description}</p>
      {tech.length ? (
        <Tags className={styles.tags}>
          {tech.map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </Tags>
      ) : null}
      <div className={styles.links}>
        {href ? (
          <ArrowLink href={href} icon="arrow-right" size="sm" external={false}>
            {labels.caseStudy}
          </ArrowLink>
        ) : null}
        {github ? (
          <ArrowLink href={github} size="sm" newTabLabel={labels.newTab}>
            {labels.github}
          </ArrowLink>
        ) : null}
        {live ? (
          <ArrowLink href={live} size="sm" newTabLabel={labels.newTab}>
            {labels.viewSite}
          </ArrowLink>
        ) : null}
      </div>
      <span className={styles.rule} aria-hidden="true" />
    </article>
  );
}
