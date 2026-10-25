import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./SectionLabel.module.css";

interface SectionLabelProps {
  /** Section number in white: "01". */
  index?: string;
  /** Extends the hairline to the edge instead of the short tick. */
  rule?: boolean;
  as?: "p" | "h2" | "h3" | "span";
  id?: string;
  className?: string;
  children: ReactNode;
}

/** Small uppercase label that opens a section: "01 / SOBRE ——". The tick after it carries a spark
    once when an ancestor gets [data-in] (Statement sets it as the title enters the screen). */
export function SectionLabel({ index, rule = false, as: Tag = "p", id, className, children }: SectionLabelProps) {
  return (
    <Tag className={cx(styles.label, rule && styles.rule, className)} id={id}>
      {index != null ? <span className={styles.index}>{index}</span> : null}
      {index != null ? (
        <span className={styles.sep} aria-hidden="true">
          /
        </span>
      ) : null}
      <span>{children}</span>
      <span className={styles.tick} aria-hidden="true" />
    </Tag>
  );
}
