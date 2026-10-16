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
  greeting: string;
  /** "Matheus Freitas": split at the first space into the two lines of the name. */
  name: string;
  /** Icon links beside the name, centred on it (beside the photo when it stacks on top). */
  links: Array<{ label: string; href: string; icon: IconName }>;
  newTabLabel: string;
  phrases: string[];
  /** `hover`: the second photo that cross-fades in over the first. */
  photo: {
    image: ImageAsset;
    alt: string;
    hover?: { image: ImageAsset; alt: string };
  };
  scroll: { target: string; label: string; ariaLabel: string };
}

/** First fold (fits a short laptop viewport down to the scroll cue): portrait · greeting + two-line name + morphing phrase · icon links, centred on each other; scroll cue below. */
export function Hero({ id, greeting, name, links, newTabLabel, phrases, photo, scroll }: HeroProps) {
  const space = name.indexOf(" ");
  const first = space < 0 ? name : name.slice(0, space);
  const last = space < 0 ? "" : name.slice(space + 1);

  return (
    // Full-width stage: the art spans the viewport while the section keeps its own width and layout.
    <div className={styles.stage}>
      <HeroBackdrop phrases={phrases} />
      <section id={id} className={styles.hero}>
        <div className={styles.grid}>
          <Portrait
            image={photo.image}
            alt={photo.alt}
            hover={photo.hover}
            sizes="(max-width: 552px) 200px, (max-width: 900px) 260px, (min-width: 1680px) 600px, 470px"
            priority
            intro
            className={styles.portrait}
          />
          <div className={styles.text}>
            <p className={styles.greet} data-hole="text">{greeting}</p>
            <h1 className={styles.name}>
              {/* Read once as a whole; the visual name is split into letters for the hover. */}
              <span className="sr-only">{name}</span>
              <span className={styles.nameArt} aria-hidden="true">
                <span className={styles.first} data-hole="name" data-energy="sweep">{first}</span>
                {last ? (
                  <span className={styles.last} data-hole="name">
                    {Array.from(last).map((ch, i) => (
                      // .letter is the still hover target; .glyph is what lifts, so the letter never slips from under the cursor.
                      <span key={i} className={styles.letter} style={cssVars({ "--i": i })} data-energy="wave">
                        <span className={styles.glyph}>{ch}</span>
                      </span>
                    ))}
                  </span>
                ) : null}
              </span>
            </h1>
            <span className={styles.rule} aria-hidden="true" />
            <MorphText phrases={phrases} className={styles.morph} data-hole="phrase" />
          </div>
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
    </div>
  );
}
