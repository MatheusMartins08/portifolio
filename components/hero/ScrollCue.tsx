"use client";

import { useEffect, useState } from "react";
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

/**
 * Cue to the next section: a small label and a hairline with a drop of light running down it. Once the
 * visitor has scrolled, the drop stops: the cue has done its job and the page stays calm.
 */
export function ScrollCue({ target, label, ariaLabel, className }: ScrollCueProps) {
  const [still, setStill] = useState(false);

  useEffect(() => {
    if (still) return;
    const onScroll = () => {
      if (window.scrollY > 40) setStill(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [still]);

  function go() {
    document.querySelector(target)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }

  return (
    // Accessible name starts with the visible label (WCAG 2.5.3): "Rolar — Ir para Sobre mim".
    <button type="button" className={cx(styles.cue, still && styles.still, className)} onClick={go}>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.drop} />
      </span>
      <span className={styles.label}>{label}</span>
      <span className="sr-only"> — {ariaLabel}</span>
    </button>
  );
}
