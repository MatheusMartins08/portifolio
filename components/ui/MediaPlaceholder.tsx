import { cx } from "@/lib/cx";
import styles from "./MediaPlaceholder.module.css";

interface MediaPlaceholderProps {
  /** hatch = photo placeholder; ui = abstract interface, for screenshots. */
  variant?: "hatch" | "ui";
  /** Optional mono tag in the corner. */
  label?: string;
  className?: string;
}

/** Discreet placeholder for media that does not exist yet — easy to swap for the real image. */
export function MediaPlaceholder({ variant = "hatch", label, className }: MediaPlaceholderProps) {
  return (
    <div className={cx(styles.ph, variant === "ui" && styles.ui, className)} aria-hidden="true">
      {variant === "ui" ? (
        <div className={styles.frame}>
          <i />
          <i />
          <i />
          <i />
        </div>
      ) : null}
      {label ? <span className={styles.label}>{label}</span> : null}
    </div>
  );
}
