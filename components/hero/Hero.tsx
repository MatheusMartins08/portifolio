import type { IconName } from "@/components/ui/Icon";
import { IconLink } from "@/components/ui/IconLink";
import type { ImageAsset } from "@/lib/content/assets";
import { MorphText } from "./MorphText";
import { Portrait } from "./Portrait";
import { ScrollCue } from "./ScrollCue";
import styles from "./Hero.module.css";

interface HeroProps {
  id: string;
  /** Mono ruler above the fold: left · middle · right. */
  meta: [string, string, string];
  greeting: string;
  name: string;
  /** Icon links stacked beside the name (beside the photo when it stacks on top). */
  links: Array<{ label: string; href: string; icon: IconName }>;
  newTabLabel: string;
  phrases: string[];
  photo: { image: ImageAsset; alt: string; caption: string; meta: string };
  scroll: { target: string; label: string; ariaLabel: string };
}

/** First fold: mono ruler, portrait left, greeting + name + icon links + morphing phrase right, scroll cue below. */
export function Hero({ id, meta, greeting, name, links, newTabLabel, phrases, photo, scroll }: HeroProps) {
  return (
    <section id={id} className={styles.hero}>
      <div className={styles.meta} aria-hidden="true">
        <span>{meta[0]}</span>
        <span className={styles.metaMid}>{meta[1]}</span>
        <span>{meta[2]}</span>
      </div>

      <div className={styles.grid}>
        <Portrait
          image={photo.image}
          alt={photo.alt}
          caption={photo.caption}
          meta={photo.meta}
          sizes="(max-width: 552px) 200px, (max-width: 900px) 260px, 380px"
          priority
          className={styles.portrait}
        />
        <div className={styles.text}>
          <div className={styles.head}>
            <div className={styles.intro}>
              <p className={styles.greet}>{greeting}</p>
              <h1 className={styles.name}>{name}</h1>
            </div>
            <ul className={styles.links}>
              {links.map((link) => (
                <li key={link.href}>
                  <IconLink href={link.href} icon={link.icon} label={link.label} newTabLabel={newTabLabel} />
                </li>
              ))}
            </ul>
          </div>
          <span className={styles.rule} aria-hidden="true" />
          <MorphText phrases={phrases} className={styles.morph} />
        </div>
      </div>

      <div className={styles.cue}>
        <ScrollCue target={scroll.target} label={scroll.label} ariaLabel={scroll.ariaLabel} />
      </div>
    </section>
  );
}
