"use client";

import { prefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cx } from "@/lib/cx";
import styles from "./ScrollCue.module.css";

interface ScrollCueProps {
  /** Selector of the next section: "#sobre". */
  target: string;
  /** Visible label (i18n `hero.scrollLabel`). */
  label: string;
  /** Accessible name (i18n `hero.scrollAria`). */
  ariaLabel: string;
  className?: string;
}

/** A small broken bolt, pointing down: a few sharp zigzags in a 16 × 44 box. */
const BOLT = "M9 1L6 12l4 2-5 13 4 2-4 14";

/**
 * Cue to the next section: the label over a small, dark bolt, the whole thing floating gently up and
 * down while a beam of light runs down the bolt, over and over.
 */
export function ScrollCue({ target, label, ariaLabel, className }: ScrollCueProps) {
  function go() {
    document.querySelector(target)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }

  return (
    // Accessible name starts with the visible label (WCAG 2.5.3): "Rolar — Ir para Sobre mim".
    <button type="button" className={cx(styles.cue, className)} onClick={go}>
      <span className={styles.label}>{label}</span>
      <span className="sr-only"> — {ariaLabel}</span>
      <svg className={styles.bolt} viewBox="0 0 16 44" aria-hidden="true">
        <path className={styles.rest} d={BOLT} />
        <path className={styles.beam} d={BOLT} pathLength={1} />
      </svg>
    </button>
  );
}
