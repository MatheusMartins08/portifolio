import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./StatusDot.module.css";

interface StatusDotProps {
  /** open = available (terracota, pulsing); busy = grey, still; away = empty ring. */
  tone?: "open" | "busy" | "away";
  /** sm = 6px dot, for compact labels such as the timeline's "Atual". */
  size?: "md" | "sm";
  className?: string;
  /** The sentence carries the meaning — the colour is never alone. */
  children?: ReactNode;
}

export function StatusDot({ tone = "open", size = "md", className, children }: StatusDotProps) {
  return (
    <span className={cx(styles.status, styles[tone], size === "sm" && styles.sm, className)}>
      <span className={styles.dot} aria-hidden="true" />
      {children ? <span>{children}</span> : null}
    </span>
  );
}
