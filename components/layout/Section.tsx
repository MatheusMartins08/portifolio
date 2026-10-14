import type { ReactNode } from "react";
import type { SectionId } from "@/lib/content/site";
import styles from "./Section.module.css";

interface SectionProps {
  id: SectionId;
  /** Page background: sand (default) or sand-2 for the alternating sections. */
  tone?: "sand" | "sand-2";
  labelledBy?: string;
  children?: ReactNode;
}

/** Page section: background band, vertical rhythm and the centered container with gutter. */
export function Section({ id, tone = "sand", labelledBy, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`${styles.section} ${tone === "sand-2" ? styles.sand2 : styles.sand}`}
    >
      <div className={styles.inner}>{children}</div>
    </section>
  );
}
