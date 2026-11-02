"use client";

import { useId, useRef, type ReactNode } from "react";
import { EdgeLight } from "@/components/ui/EdgeLight";
import { useInView } from "@/hooks/useInView";
import { cssVars, cx } from "@/lib/cx";
import styles from "./AboutModule.module.css";

interface AboutModuleProps {
  /** "01.1"…: the section's index, then the module's place in it. */
  index: string;
  label: string;
  /** A short fact at the head's right end, in mono ("desde 2024", "UTC−3"). */
  meta?: ReactNode;
  /** The last module: the bolt turns along its top and lights it (AboutTrace). */
  end?: boolean;
  /** Phones: head and content on one line, no meta (a thin strip, for the status). */
  strip?: boolean;
  /** ms after it enters the screen, so modules side by side come in one after the other. */
  delay?: number;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}

/**
 * One cell of the About sheet: a head (tick, index, label, meta) over its content. The content rises in
 * once on entering the screen; hovering lights the border around the pointer (EdgeLight). The bolt
 * passing it (AboutTrace) sets `data-pulse`: the tick lights, once.
 */
export function AboutModule({ index, label, meta, end = false, strip = false, delay = 0, className, innerClassName, children }: AboutModuleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.2 });
  const id = useId();

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={id}
      className={cx(styles.cell, strip && styles.strip, className)}
      data-trace="module"
      data-end={end ? "" : undefined}
      data-in={inView ? "" : undefined}
      style={cssVars({ "--d": `${delay}ms` })}
    >
      <div className={cx(styles.inner, innerClassName)} data-trace="inner">
        <div className={styles.head}>
          <span className={styles.tick} aria-hidden="true" />
          <span className={styles.index} aria-hidden="true">
            {index}
          </span>
          <h3 className={styles.label} id={id}>
            {label}
          </h3>
          {meta ? <span className={styles.meta}>{meta}</span> : null}
        </div>
        {children}
      </div>
      <EdgeLight inset />
    </div>
  );
}
