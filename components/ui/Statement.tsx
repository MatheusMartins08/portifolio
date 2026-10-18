"use client";

import { Fragment, useRef } from "react";
import { useInView } from "@/hooks/useInView";
import { cssVars, cx } from "@/lib/cx";
import { SectionLabel } from "./SectionLabel";
import styles from "./Statement.module.css";

interface StatementProps {
  /** Plain text: it is split into words for the word-by-word reveal. */
  children: string;
  /** Words painted terracota-strong (i18n `statementHighlight`), matched ignoring case and trailing punctuation. */
  highlight?: string[];
  /** Draws the SectionLabel above: index + label. */
  label?: string;
  index?: string;
  /** Id of the label, for widgets named by the short label rather than the whole sentence. */
  labelId?: string;
  /** Id of the heading, for the section's aria-labelledby. */
  headingId?: string;
  as?: "h1" | "h2" | "p";
  /** Marks provisional copy (ink-2). */
  placeholder?: boolean;
  note?: string;
  className?: string;
}

function normalize(word: string): string {
  return word.toLowerCase().replace(/[.,;:!?]+$/, "");
}

/** Large opening sentence, revealed word by word when it enters the screen. */
export function Statement({
  children,
  highlight = [],
  label,
  index,
  labelId,
  headingId,
  as: Tag = "h2",
  placeholder = false,
  note,
  className,
}: StatementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const marked = highlight.map(normalize);
  const words = children.split(/\s+/).filter(Boolean);

  return (
    <div ref={ref} className={cx(styles.stmt, inView && styles.in, placeholder && styles.placeholder, className)}>
      {label ? (
        <SectionLabel index={index} id={labelId} className={styles.label}>
          {label}
        </SectionLabel>
      ) : null}
      <Tag className={styles.text} id={headingId}>
        {words.map((word, i) => (
          <Fragment key={i}>
            <span className={cx(styles.word, marked.includes(normalize(word)) && styles.hl)} style={cssVars({ "--i": i })}>
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </Tag>
      {note ? <p className={styles.note}>{note}</p> : null}
    </div>
  );
}
