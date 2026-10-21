"use client";

import { Fragment, useRef } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SlideIcon } from "@/components/ui/SlideIcon";
import { useInView } from "@/hooks/useInView";
import { cssVars, cx } from "@/lib/cx";
import { RULE_PATH } from "./crack";
import { STRIKE_BOX, strike, strikeFoot } from "./strike";
import styles from "./MoreWork.module.css";

interface MoreWorkProps {
  /** Mono label above: "Isso é só o começo". */
  kicker: string;
  /** The link's text, revealed word by word. */
  cta: string;
  href: string;
  /** Screen-reader note for the new tab (i18n `a11y.newTab`). */
  newTabLabel: string;
}

/**
 * The projects' closing line, out to GitHub. When it comes into view a small bolt strikes it from above
 * (geometry in ./strike), a flash where it lands, the words light up one by one and the link's
 * underline (the cards' fractal rule) takes the charge. Hovering or focusing the link runs the charge
 * along it again and re-lights the bolt. With reduced motion it is all simply there, still.
 */
export function MoreWork({ kicker, cta, href, newTabLabel }: MoreWorkProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.6 });
  const words = cta.split(/\s+/).filter(Boolean);

  return (
    <div
      ref={ref}
      className={cx(styles.more, inView && styles.in)}
      style={cssVars({
        "--trunk": (strike.trunk + 1).toFixed(1),
        "--n": words.length,
        "--foot-x": `${(strikeFoot.x - STRIKE_BOX.width / 2).toFixed(1)}px`,
        "--foot-y": `${strikeFoot.y.toFixed(1)}px`,
      })}
    >
      <svg
        className={styles.strike}
        width={STRIKE_BOX.width}
        height={STRIKE_BOX.height}
        viewBox={`0 0 ${STRIKE_BOX.width} ${STRIKE_BOX.height}`}
        aria-hidden="true"
        focusable="false"
      >
        {strike.strokes.map((stroke, i) => (
          <g
            key={i}
            className={cx(styles.stroke, styles[`l${stroke.level}`])}
            style={cssVars({ "--t0": stroke.t0.toFixed(1), "--t1": stroke.t1.toFixed(1) })}
          >
            <path className={styles.edge} d={stroke.d} pathLength={1} transform="translate(.7 1.1)" />
            <path className={styles.core} d={stroke.d} pathLength={1} />
            <path className={styles.glow} d={stroke.d} pathLength={1} />
            <path className={styles.hot} d={stroke.d} pathLength={1} />
          </g>
        ))}
      </svg>
      <span className={styles.impact} aria-hidden="true" />

      <SectionLabel className={styles.kicker}>{kicker}</SectionLabel>

      <a className={styles.link} href={href} target="_blank" rel="noopener noreferrer">
        <span className={styles.text}>
          {words.map((word, i) => (
            <Fragment key={i}>
              <span className={styles.word} style={cssVars({ "--i": i })}>
                {word}
              </span>
              {i < words.length - 1 ? " " : null}
            </Fragment>
          ))}
          <span className={styles.rule} aria-hidden="true">
            <svg viewBox="0 0 600 6" preserveAspectRatio="none">
              <path d={RULE_PATH} pathLength={1} className={styles.charge} />
              {/* The first run, on the strike; then one more on every hover or focus. */}
              <path d={RULE_PATH} pathLength={1} className={styles.head} />
              <path d={RULE_PATH} pathLength={1} className={styles.rehead} />
            </svg>
          </span>
        </span>
        <SlideIcon name="arrow-up-right" size={20} className={styles.icon} />
        <span className="sr-only"> {newTabLabel}</span>
      </a>
    </div>
  );
}
