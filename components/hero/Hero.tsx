import type { IconName } from "@/components/ui/Icon";
import { IconLink } from "@/components/ui/IconLink";
import type { ImageAsset } from "@/lib/content/assets";
import { cssVars } from "@/lib/cx";
import { HeroBackdrop } from "./HeroBackdrop";
import { HeroIntro } from "./HeroIntro";
import { HeroName } from "./HeroName";
import { MorphText } from "./MorphText";
import { Portrait } from "./Portrait";
import { ScrollCue } from "./ScrollCue";
import styles from "./Hero.module.css";

interface HeroProps {
  id: string;
  greeting: string;
  /** "Matheus Freitas": read whole by screen readers; drawn as handwriting by HeroName. */
  name: string;
  /** Icon links beside the photo, centred on it (in a row under the phrase on phones). */
  links: Array<{ label: string; href: string; icon: IconName }>;
  newTabLabel: string;
  phrases: string[];
  /** `hover`: the second photo that comes in, through light, over the first. */
  photo: {
    image: ImageAsset;
    alt: string;
    hover?: { image: ImageAsset; alt: string };
  };
  scroll: { target: string; label: string; ariaLabel: string };
}

/**
 * First fold (fits a short laptop viewport down to the scroll cue): greeting + handwritten name +
 * morphing phrase · photo · icon links, centred on each other; scroll cue below. The intro
 * (HeroIntro) and the lightning field (HeroBackdrop) live on the same full-width stage.
 */
export function Hero({ id, greeting, name, links, newTabLabel, phrases, photo, scroll }: HeroProps) {
  return (
    // Full-width stage: the art spans the viewport while the section keeps its own width and layout.
    <div className={styles.stage}>
      <HeroBackdrop phrases={phrases} />
      <section id={id} className={styles.hero}>
        <div className={styles.grid}>
          <div className={styles.text}>
            <p className={styles.greet} data-hole="text">
              {greeting}
            </p>
            <HeroName name={name} className={styles.name} />
            <div className={styles.sub}>
              <span className={styles.rule} aria-hidden="true" />
              <MorphText phrases={phrases} caret={false} className={styles.morph} data-hole="phrase" />
            </div>
          </div>
          <Portrait
            image={photo.image}
            alt={photo.alt}
            hover={photo.hover}
            sizes="(max-width: 820px) 70vw, (min-width: 1680px) 440px, 30vw"
            priority
            className={styles.portrait}
          />
          <ul className={styles.links}>
            {links.map((link, i) => (
              <li key={link.href} style={cssVars({ "--i": i })}>
                <IconLink href={link.href} icon={link.icon} label={link.label} newTabLabel={newTabLabel} size="lg" />
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.cue}>
          <ScrollCue target={scroll.target} label={scroll.label} ariaLabel={scroll.ariaLabel} />
        </div>
      </section>
      <HeroIntro />
    </div>
  );
}
