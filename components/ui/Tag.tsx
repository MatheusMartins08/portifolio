import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Tag.module.css";

interface TagProps {
  /** default = hairline outline (stacks); quiet = service label; accent = at most one per group. */
  tone?: "default" | "quiet" | "accent";
  className?: string;
  children: ReactNode;
}

/** Near-square mono tag for technologies and categories. */
export function Tag({ tone = "default", className, children }: TagProps) {
  return <span className={cx(styles.tag, tone !== "default" && styles[tone], className)}>{children}</span>;
}

/** Wrapping row of tags. */
export function Tags({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx(styles.tags, className)}>{children}</div>;
}
