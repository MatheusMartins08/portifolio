import Image from "next/image";
import type { ImageAsset } from "@/lib/content/assets";
import { cx } from "@/lib/cx";
import styles from "./Portrait.module.css";

interface PortraitProps {
  /** Shown in a square frame; `image.focus` decides what the crop keeps. */
  image: ImageAsset;
  alt: string;
  /** "Fig. 01"; false removes the caption. */
  caption: string | false;
  /** Second caption field: "Eu — MF". */
  meta?: string;
  /** A second photo that cross-fades in on hover (fine pointers only); its caption rolls in over the first. */
  hover?: { image: ImageAsset; alt: string; caption: string };
  /** next/image `sizes` for the rendered width. */
  sizes: string;
  /** The above-the-fold LCP image: loads eagerly with high fetch priority. */
  priority?: boolean;
  /** Entrance: the frame opens like a curtain, then the crop marks and the caption arrive. */
  intro?: boolean;
  className?: string;
}

/** Editorial photo: chamfered top-right corner, terracota crop marks, mono caption, slight warm tone. */
export function Portrait({ image, alt, caption, meta, hover, sizes, priority = false, intro = false, className }: PortraitProps) {
  return (
    <figure className={cx(styles.portrait, hover && styles.swap, intro && styles.intro, className)}>
      <div className={styles.frame}>
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          alt={alt}
          sizes={sizes}
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          style={{ objectPosition: image.focus }}
          className={styles.img}
        />
        {hover ? (
          // Loaded up front (not lazily) so it is already there when the pointer arrives.
          <Image
            src={hover.image.src}
            width={hover.image.width}
            height={hover.image.height}
            alt={hover.alt}
            sizes={sizes}
            loading="eager"
            style={{ objectPosition: hover.image.focus }}
            className={cx(styles.img, styles.alt)}
          />
        ) : null}
      </div>
      <span className={cx(styles.mark, styles.tl)} aria-hidden="true" />
      <span className={cx(styles.mark, styles.br)} aria-hidden="true" />
      {caption === false ? null : (
        <figcaption className={styles.cap}>
          {hover ? (
            // A one-line window over both labels: on hover the stack rolls up, like a counter.
            <span className={styles.fig}>
              <span className={styles.figStack}>
                <span>{caption}</span>
                <span aria-hidden="true">{hover.caption}</span>
              </span>
            </span>
          ) : (
            <span>{caption}</span>
          )}
          {meta ? <span>{meta}</span> : null}
        </figcaption>
      )}
    </figure>
  );
}
