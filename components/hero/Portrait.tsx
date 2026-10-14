import Image from "next/image";
import type { ImageAsset } from "@/lib/content/assets";
import { cx } from "@/lib/cx";
import styles from "./Portrait.module.css";

interface PortraitProps {
  /** 4:5 photo, already cropped. */
  image: ImageAsset;
  alt: string;
  /** "Fig. 01"; false removes the caption. */
  caption: string | false;
  /** Where the photo was taken: "Paris — Louvre". */
  meta?: string;
  /** next/image `sizes` for the rendered width. */
  sizes: string;
  /** The above-the-fold LCP image: loads eagerly with high fetch priority. */
  priority?: boolean;
  className?: string;
}

/** Editorial photo: chamfered top-right corner, terracota crop marks, mono caption, slight warm tone. */
export function Portrait({ image, alt, caption, meta, sizes, priority = false, className }: PortraitProps) {
  return (
    <figure className={cx(styles.portrait, className)}>
      <div className={styles.frame}>
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          alt={alt}
          sizes={sizes}
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          className={styles.img}
        />
      </div>
      <span className={cx(styles.mark, styles.tl)} aria-hidden="true" />
      <span className={cx(styles.mark, styles.br)} aria-hidden="true" />
      {caption === false ? null : (
        <figcaption className={styles.cap}>
          <span>{caption}</span>
          {meta ? <span>{meta}</span> : null}
        </figcaption>
      )}
    </figure>
  );
}
