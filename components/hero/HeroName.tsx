import { cssVars } from "@/lib/cx";
import { NAME_LINES } from "./nameGlyphs";
import styles from "./HeroName.module.css";

/**
 * The pen, in ms: each line is written in `line` ms, the second starting `stagger` ms after the first;
 * a letter gets time in proportion to its outline's length (and some overlap with its neighbours, so
 * the hand never stops), and fills in shortly after its outline closes.
 */
const PEN = { line: 780, stagger: 640, overlap: 1.7, minLetter: 200, fillAfter: 0.65, fill: 360 };

/** When the last letter has filled in, from the start of the writing (HeroIntro reads it from `data-written`). */
const WRITTEN = PEN.stagger * (NAME_LINES.length - 1) + PEN.line + PEN.fill;

interface HeroNameProps {
  /** The name as text, for screen readers ("Matheus Freitas"). */
  name: string;
  className?: string;
}

/**
 * The name as handwriting (Parisienne outlines, components/hero/nameGlyphs.ts), one SVG per line,
 * sized in em so the parent's font-size sets its scale. At rest the letters are simply filled. In the
 * intro (`<html data-intro="draw">`) a pen draws each letter's outline, left to right, and the ink
 * fills in behind it.
 */
export function HeroName({ name, className }: HeroNameProps) {
  return (
    <h1 className={className}>
      <span className="sr-only">{name}</span>
      <span className={styles.art} aria-hidden="true" data-intro-name="" data-written={WRITTEN}>
        {NAME_LINES.map((line, l) => {
          const [x, y, w, h] = line.viewBox;
          const total = line.glyphs.reduce((sum, glyph) => sum + glyph.length, 0);
          let before = 0;
          return (
            <span key={line.text} className={styles.line} data-hole="name">
              <svg
                className={styles.svg}
                viewBox={`${x} ${y} ${w} ${h}`}
                style={cssVars({ "--w": `${w / 1000}em`, "--h": `${h / 1000}em` })}
              >
                {line.glyphs.map((glyph, i) => {
                  const start = l * PEN.stagger + (before / total) * PEN.line;
                  const draw = Math.max(PEN.minLetter, (glyph.length / total) * PEN.line * PEN.overlap);
                  before += glyph.length;
                  return (
                    <path
                      key={i}
                      className={styles.glyph}
                      d={glyph.d}
                      pathLength={1}
                      style={cssVars({
                        "--d": `${Math.round(start)}ms`,
                        "--t": `${Math.round(draw)}ms`,
                        "--f": `${Math.round(start + draw * PEN.fillAfter)}ms`,
                      })}
                    />
                  );
                })}
              </svg>
            </span>
          );
        })}
      </span>
    </h1>
  );
}
