"use client";

import { Fragment, useRef } from "react";
import { EdgeLight } from "@/components/ui/EdgeLight";
import { Icon } from "@/components/ui/Icon";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SlideIcon } from "@/components/ui/SlideIcon";
import { useInView } from "@/hooks/useInView";
import { cssVars, cx } from "@/lib/cx";
import styles from "./MoreWork.module.css";

interface MoreWorkProps {
  /** Mono label above: "Isso é só o começo". */
  kicker: string;
  /** The line under it, revealed word by word. */
  line: string;
  href: string;
  /** The card's title: "GitHub". */
  label: string;
  /** "@MatheusMartins08". */
  handle: string;
  /** Mono note beside the commit graph: "main · em construção". */
  status: string;
  /** Screen-reader note for the new tab (i18n `a11y.newTab`). */
  newTabLabel: string;
}

/** The commit graph, in a 92×12 box: commits along one line, the last one HEAD; hovering pushes `NEXT`. */
const COMMITS = [6, 26, 46];
const HEAD = 66;
const NEXT = 86;
const Y = 6;

/**
 * The projects' closing line and a card out to GitHub, floating slowly over a shadow that stays on the
 * ground. On entering, the label and the words light up in sequence and the card rises in. Hovering or
 * focusing it lifts it, lights its border around the pointer (EdgeLight), tilts the mark and pushes a
 * new commit onto the graph, HEAD moving to it. With reduced motion it is all simply there, still.
 */
export function MoreWork({ kicker, line, href, label, handle, status, newTabLabel }: MoreWorkProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.4 });
  const words = line.split(/\s+/).filter(Boolean);

  return (
    <div ref={ref} className={cx(styles.more, inView && styles.in)} style={cssVars({ "--n": words.length })}>
      <SectionLabel className={styles.kicker}>{kicker}</SectionLabel>

      <p className={styles.line}>
        {words.map((word, i) => (
          <Fragment key={i}>
            <span className={styles.word} style={cssVars({ "--i": i })}>
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </p>

      <div className={styles.dock}>
        <span className={styles.ground} aria-hidden="true" />
        <div className={styles.float}>
          <a className={styles.card} href={href} target="_blank" rel="noopener noreferrer">
            <span className={styles.mark}>
              <Icon name="github" size={22} />
            </span>
            <span className={styles.name}>
              <span className={styles.title}>{label}</span>{" "}
              <span className={styles.handle}>{handle}</span>
            </span>
            <SlideIcon name="arrow-up-right" size={18} className={styles.icon} />
            <span className={styles.log} aria-hidden="true">
              <svg className={styles.graph} width={92} height={12} viewBox="0 0 92 12" focusable="false">
                <path className={styles.trunk} d={`M${COMMITS[0]} ${Y}H${HEAD}`} />
                <path className={styles.push} d={`M${HEAD} ${Y}H${NEXT}`} pathLength={1} />
                {COMMITS.map((x) => (
                  <circle key={x} className={styles.commit} cx={x} cy={Y} r={2.5} />
                ))}
                <g className={styles.haloNow}>
                  <circle className={styles.halo} cx={HEAD} cy={Y} r={6} />
                </g>
                <g className={styles.haloNext}>
                  <circle className={styles.halo} cx={NEXT} cy={Y} r={6} />
                </g>
                <circle className={styles.head} cx={HEAD} cy={Y} r={2.5} />
                <circle className={styles.next} cx={NEXT} cy={Y} r={2.5} />
              </svg>
              <span className={styles.status}>{status}</span>
            </span>
            <span className="sr-only"> {newTabLabel}</span>
            <EdgeLight />
          </a>
        </div>
      </div>
    </div>
  );
}
