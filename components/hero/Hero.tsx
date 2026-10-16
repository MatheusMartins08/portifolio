import type { IconName } from "@/components/ui/Icon";
import { IconLink } from "@/components/ui/IconLink";
import type { ImageAsset } from "@/lib/content/assets";
import { cssVars } from "@/lib/cx";
import { HeroBackdrop } from "./HeroBackdrop";
import { MorphText } from "./MorphText";
import { Portrait } from "./Portrait";
import { ScrollCue } from "./ScrollCue";
import styles from "./Hero.module.css";

interface HeroProps {
  id: string;
  /** Mono ruler above the fold: left · middle · right. */
  meta: [string, string, string];
  greeting: string;
  /** "Matheus Freitas": split at the first space into the two lines of the name. */
  name: string;
  /** Icon links beside the name, centred on it (beside the photo when it stacks on top). */
  links: Array<{ label: string; href: string; icon: IconName }>;
  newTabLabel: string;
  phrases: string[];
  /** `hover`: the second photo and caption that cross-fade in over the first. */
  photo: {
    image: ImageAsset;
    alt: string;
    caption: string;
    meta: string;
    hover?: { image: ImageAsset; alt: string; caption: string };
  };
  scroll: { target: string; label: string; ariaLabel: string };
}

/** First fold (fits a short laptop viewport down to the scroll cue): mono ruler, portrait left, greeting + two-line name + icon links + morphing phrase right, scroll cue below. */
export function Hero({ id, meta, greeting, name, links, newTabLabel, phrases, photo, scroll }: HeroProps) {
  const space = name.indexOf(" ");
  const first = space < 0 ? name : name.slice(0, space);
  const last = space < 0 ? "" : name.slice(space + 1);

  return (
    // Full-width stage: the art spans the viewport while the section keeps its own width and layout.
    <div className={styles.stage}>
      <HeroBackdrop phrases={phrases} />
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
            hover={photo.hover}
            sizes="(max-width: 552px) 200px, (max-width: 900px) 260px, 470px"
            priority
            intro
            className={styles.portrait}
          />
          <div className={styles.text}>
            <p className={styles.greet} data-hole="text">{greeting}</p>
            <div className={styles.head}>
              <h1 className={styles.name}>
                {/* Read once as a whole; the visual name is split into letters for the hover. */}
                <span className="sr-only">{name}</span>
                <span className={styles.nameArt} aria-hidden="true">
                  <span className={styles.first} data-hole="name">{first}</span>
                  {last ? (
                    <span className={styles.last} data-hole="name">
                      {Array.from(last).map((ch, i) => (
                        // .letter is the still hover target; .glyph is what lifts, so the letter never slips from under the cursor.
                        <span key={i} className={styles.letter} style={cssVars({ "--i": i })}>
                          <span className={styles.glyph}>{ch}</span>
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
              </h1>
              <ul className={styles.links}>
                {links.map((link, i) => (
                  <li key={link.href} style={cssVars({ "--i": i })}>
                    <IconLink href={link.href} icon={link.icon} label={link.label} newTabLabel={newTabLabel} size="lg" />
                  </li>
                ))}
              </ul>
            </div>
            <span className={styles.rule} aria-hidden="true" />
            <MorphText phrases={phrases} className={styles.morph} data-hole="phrase" />
          </div>
        </div>

        <div className={styles.cue}>
          <ScrollCue target={scroll.target} label={scroll.label} ariaLabel={scroll.ariaLabel} />
        </div>
      </section>
    </div>
  );
}
