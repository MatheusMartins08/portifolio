import type { ReactNode } from "react";
import type { SectionId } from "@/lib/content/site";
import styles from "./Section.module.css";

interface SectionProps {
  id: SectionId;
  labelledBy?: string;
  children?: ReactNode;
}

/** Page section: vertical rhythm and the centered container with gutter. Every section sits on the
    same black, so the page reads as one continuous piece; space does the separating. */
export function Section({ id, labelledBy, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={styles.section}>
      <div className={styles.inner}>{children}</div>
    </section>
  );
}
