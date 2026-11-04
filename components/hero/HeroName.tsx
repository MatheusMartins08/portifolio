import { cssVars } from "@/lib/cx";
import { NAME_LINES } from "./nameGlyphs";
import { NAME_PEN, PEN_WRITTEN } from "./namePen";
import styles from "./HeroName.module.css";

/** How far a letter's mask reaches past the line's box, units: room for the pen's round ends. */
const BLEED = 120;

interface HeroNameProps {
  /** The name as text, for screen readers ("Matheus Freitas"). */
  name: string;
  className?: string;
}

/**
 * The name as handwriting (Parisienne outlines, components/hero/nameGlyphs.ts), one SVG per line,
 * sized in em so the parent's font-size sets its scale. At rest the letters are simply filled. In the
 * intro (`<html data-intro="draw">`) a pen writes them: each letter is masked by the strokes a hand
 * would make to write it (components/hero/namePen.ts) — along the middle of its ink, in writing order,
 * each at its own pace — so the ink appears where the pen passes. Each t is crossed and the i dotted
 * (`data-pen-dot`) as soon as the letter is written; HeroIntro reads when the pen lifts from `data-written`.
 */
export function HeroName({ name, className }: HeroNameProps) {
  return (
    <h1 className={className}>
      <span className="sr-only">{name}</span>
      <span className={styles.art} aria-hidden="true" data-intro-name="" data-written={PEN_WRITTEN}>
        {NAME_LINES.map((line, l) => {
          const [x, y, w, h] = line.viewBox;
          const maskId = (g: number) => `hero-name-pen-${l}-${g}`;
          return (
            <span key={line.text} className={styles.line} data-hole="name">
              <svg
                className={styles.svg}
                viewBox={`${x} ${y} ${w} ${h}`}
                style={cssVars({ "--w": `${w / 1000}em`, "--h": `${h / 1000}em` })}
              >
                <defs>
                  {NAME_PEN[l].map((pen, g) => (
                    <mask
                      key={g}
                      id={maskId(g)}
                      className={styles.mask}
                      maskUnits="userSpaceOnUse"
                      x={x - BLEED}
                      y={y - BLEED}
                      width={w + 2 * BLEED}
                      height={h + 2 * BLEED}
                    >
                      {pen.runs.map((run, r) => (
                        <path
                          key={r}
                          className={styles.pen}
                          d={run.d}
                          pathLength={1}
                          strokeWidth={pen.width}
                          data-pen-dot={run.dot ? "" : undefined}
                          style={cssVars({ "--d": `${run.delay}ms`, "--t": `${run.duration}ms`, "--ease": run.ease })}
                        />
                      ))}
                    </mask>
                  ))}
                </defs>
                {line.glyphs.map((glyph, g) => (
                  <path key={g} className={styles.glyph} d={glyph.d} style={cssVars({ "--m": `url(#${maskId(g)})` })} />
                ))}
              </svg>
            </span>
          );
        })}
      </span>
    </h1>
  );
}
