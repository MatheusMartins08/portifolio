import Image from "next/image";
import type { ImageAsset } from "@/lib/content/assets";
import { cx } from "@/lib/cx";
import styles from "./Portrait.module.css";

interface PortraitProps {
  /** Shown in a square frame by default (the page can set a taller one); `image.focus` decides what the crop keeps. */
  image: ImageAsset;
  alt: string;
  /** A second photo that cross-fades in on hover (fine pointers only). */
  hover?: { image: ImageAsset; alt: string };
  /** next/image `sizes` for the rendered width. */
  sizes: string;
  /** The above-the-fold LCP image: loads eagerly with high fetch priority. */
  priority?: boolean;
  /** Entrance: the frame opens like a curtain while the photo settles. */
  intro?: boolean;
  className?: string;
}

/** Editorial photo: two unequal diagonal cuts (top-right, bottom-left), slight warm tone. */
export function Portrait({ image, alt, hover, sizes, priority = false, intro = false, className }: PortraitProps) {
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
          // Loaded up front (not lazily) so it is already there when the pointer arrives; at low priority,
          // so it never competes with the main photo (the LCP).
          <Image
            src={hover.image.src}
            width={hover.image.width}
            height={hover.image.height}
            alt={hover.alt}
            sizes={sizes}
            loading="eager"
            fetchPriority="low"
            style={{ objectPosition: hover.image.focus }}
            className={cx(styles.img, styles.alt)}
          />
        ) : null}
      </div>
    </figure>
  );
}
