import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./SectionLabel.module.css";

interface SectionLabelProps {
  /** Section number in terracota-ink: "01". */
  index?: string;
  /** Extends a hairline to the edge. */
  rule?: boolean;
  as?: "p" | "h2" | "h3" | "span";
  id?: string;
  className?: string;
  children: ReactNode;
}

/** Mono uppercase label that opens a section: "01 / SOBRE". */
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
    </Tag>
  );
}
