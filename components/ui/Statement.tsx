"use client";

import { Fragment, useRef } from "react";
import { useInView } from "@/hooks/useInView";
import { cssVars, cx } from "@/lib/cx";
import { SectionLabel } from "./SectionLabel";
import styles from "./Statement.module.css";

interface StatementProps {
  /** Plain text: it is split into words for the word-by-word reveal. */
  children: string;
  /** Words set in italic (i18n `statementHighlight`), matched ignoring case and trailing punctuation. */
  highlight?: string[];
  /** Left-aligned (default) or centred on the page. */
  align?: "start" | "center";
  /** Draws the SectionLabel above: index + label. */
  label?: string;
  index?: string;
  /** Id of the label, for widgets named by the short label rather than the whole sentence. */
  labelId?: string;
  /** Id of the heading, for the section's aria-labelledby. */
  headingId?: string;
  as?: "h1" | "h2" | "p";
  /**
   * Two lines, broken right after the first highlighted word, at every width: each line kept whole
   * (no wrapping), the type shrinking on narrow screens so the longer one fits.
   */
  breakAfterHighlight?: boolean;
  /** Marks provisional copy (fg-2). */
  placeholder?: boolean;
  note?: string;
  className?: string;
}

function normalize(word: string): string {
  return word.toLowerCase().replace(/[.,;:!?]+$/, "");
}

/** Width of a line of the display face, in em per character: a little generous, so a whole line never overflows. */
const EM_PER_CHAR = 0.46;

/** Large opening sentence, revealed word by word when it enters the screen ([data-in] also sparks
    the SectionLabel's tick once). */
export function Statement({
  children,
  highlight = [],
  align = "start",
  label,
  index,
  labelId,
  headingId,
  as: Tag = "h2",
  breakAfterHighlight = false,
  placeholder = false,
  note,
  className,
}: StatementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const marked = highlight.map(normalize);
  const words = children.split(/\s+/).filter(Boolean);

  // Where the sentence breaks in two (0: it doesn't), and how wide its longer line is, in em.
  const cut = breakAfterHighlight ? words.findIndex((word) => marked.includes(normalize(word))) + 1 : 0;
  const split = cut > 0 && cut < words.length;
  const lines = split ? [words.slice(0, cut), words.slice(cut)] : [words];
  const measure = split ? Math.max(...lines.map((line) => line.join(" ").length)) * EM_PER_CHAR : undefined;

  const word = (text: string, i: number) => (
    <Fragment key={i}>
      <span className={cx(styles.word, marked.includes(normalize(text)) && styles.hl)} style={cssVars({ "--i": i })}>
        {text}
      </span>
      {i < words.length - 1 ? " " : null}
    </Fragment>
  );

  return (
    <div
      ref={ref}
      data-in={inView ? "" : undefined}
      className={cx(
        styles.stmt,
        align === "center" && styles.center,
        split && styles.lines,
        inView && styles.in,
        placeholder && styles.placeholder,
        className,
      )}
    >
      {label ? (
        <SectionLabel index={index} id={labelId} className={styles.label}>
          {label}
        </SectionLabel>
      ) : null}
      <Tag className={styles.text} id={headingId} style={measure ? cssVars({ "--measure": measure.toFixed(2) }) : undefined}>
        {split
          ? lines.map((line, l) => (
              <span key={l} className={styles.line}>
                {line.map((text, k) => word(text, (l ? cut : 0) + k))}
              </span>
            ))
          : words.map(word)}
      </Tag>
      {note ? <p className={styles.note}>{note}</p> : null}
    </div>
  );
}
