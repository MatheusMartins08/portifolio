import type { ReactNode } from "react";
import { EdgeLight } from "@/components/ui/EdgeLight";
import { cx } from "@/lib/cx";
import styles from "./InfoCard.module.css";

interface InfoCardProps {
  /** Mono uppercase label: STATUS, RESUME, LOCATION… */
  label: string;
  /** Small mono note on the right of the label. */
  aside?: string;
  /** paper (default), sand (sand-2), deep (sand-3), ink. */
  tone?: "paper" | "sand" | "deep" | "ink";
  /** row: content on the left, label + aside on the right (the wide Status card). */
  layout?: "stack" | "row";
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Small auxiliary card (bento around the terminal): mono label, content, optional footer; its border lights up around the pointer. */
export function InfoCard({ label, aside, tone = "paper", layout = "stack", footer, className, children }: InfoCardProps) {
  return (
    <div className={cx(styles.info, styles[tone], layout === "row" && styles.row, className)}>
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        {aside ? <span className={styles.aside}>{aside}</span> : null}
      </div>
      <div className={styles.body}>{children}</div>
      {footer ? <div className={styles.foot}>{footer}</div> : null}
      <EdgeLight />
    </div>
  );
}

/** The card's main datum: "Belo Horizonte". */
export function InfoValue({ children }: { children: ReactNode }) {
  return <span className={styles.big}>{children}</span>;
}

/** Complement under the main datum: "Minas Gerais, Brasil". */
export function InfoNote({ children }: { children: ReactNode }) {
  return <span className={styles.muted}>{children}</span>;
}
