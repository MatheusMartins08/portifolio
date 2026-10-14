import type { ReactNode } from "react";
import styles from "./CaseSection.module.css";

interface CaseSectionProps {
  id?: string;
  index: string;
  /** Fixed mono label on the left: Overview, Problem… */
  label: string;
  title?: string;
  children: ReactNode;
}

/** A case-study block: index and label sticky on the left, content on the right. */
export function CaseSection({ id, index, label, title, children }: CaseSectionProps) {
  return (
    <section className={styles.sec} id={id} aria-label={title ? undefined : label}>
      <div className={styles.side}>
        <span className={styles.idx}>{index}</span>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.main}>
        {title ? <h2 className={styles.title}>{title}</h2> : null}
        <div className={styles.body}>{children}</div>
      </div>
    </section>
  );
}
