"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { cssVars, cx } from "@/lib/cx";
import styles from "./Reveal.module.css";

interface RevealProps {
  /** Vary per section — never the same entrance for the whole site. */
  variant?: "up" | "fade" | "blur" | "clip" | "line";
  /** ms; chain 0, 90, 180… for label → title → content. */
  delay?: number;
  threshold?: number;
  as?: "div" | "section" | "li" | "span" | "article";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Scroll entrance wrapper. */
export function Reveal({ variant = "up", delay = 0, threshold = 0.15, as: Tag = "div", className, style, children }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold });
  return (
    <Tag
      ref={ref as never}
      className={cx(styles.reveal, styles[variant], inView && styles.in, className)}
      style={cssVars({ "--d": `${delay}ms` }, style)}
    >
      {children}
    </Tag>
  );
}
