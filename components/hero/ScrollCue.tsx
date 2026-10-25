"use client";

import { Icon } from "@/components/ui/Icon";
import { prefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cx } from "@/lib/cx";
import styles from "./ScrollCue.module.css";

interface ScrollCueProps {
  /** Selector of the next section: "#sobre". */
  target: string;
  /** Visible mono label (i18n `hero.scrollLabel`). */
  label: string;
  /** Accessible name (i18n `hero.scrollAria`). */
  ariaLabel: string;
  className?: string;
}

/** Cue to the next section: SCROLL label, rail with a white drop and a ring with an arrow, floating gently. */
export function ScrollCue({ target, label, ariaLabel, className }: ScrollCueProps) {
  function go() {
    document.querySelector(target)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }

  return (
    // Accessible name starts with the visible label (WCAG 2.5.3): "Scroll — Ir para Sobre mim".
    <button type="button" className={cx(styles.cue, className)} onClick={go}>
      <span className={styles.label}>{label}</span>
      <span className="sr-only"> — {ariaLabel}</span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.drop} />
      </span>
      <span className={styles.ring} aria-hidden="true">
        <Icon name="arrow-down" size={14} className={styles.arrow} />
      </span>
    </button>
  );
}
