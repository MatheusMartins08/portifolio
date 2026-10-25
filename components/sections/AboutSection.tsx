import { Fragment, type ReactNode } from "react";
import { AboutTrace } from "@/components/about/AboutTrace";
import { Section } from "@/components/layout/Section";
import { Statement } from "@/components/ui/Statement";
import { StatusDot } from "@/components/ui/StatusDot";
import { cssVars } from "@/lib/cx";
import { sectionIndex, site } from "@/lib/content/site";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./AboutSection.module.css";

/** Wraps the earliest occurrence of any highlight phrase, repeatedly; `--i` counts them for the glint's stagger. */
function markText(text: string, highlight: string[], counter: { i: number }): ReactNode {
  const out: ReactNode[] = [];
  let rest = text;
  while (rest) {
    let at = -1;
    let phrase = "";
    for (const candidate of highlight) {
      const i = candidate ? rest.indexOf(candidate) : -1;
      if (i >= 0 && (at < 0 || i < at)) {
        at = i;
        phrase = candidate;
      }
    }
    if (at < 0) {
      out.push(rest);
      break;
    }
    if (at > 0) out.push(rest.slice(0, at));
    out.push(
      <strong key={out.length} className={styles.hl} style={cssVars({ "--i": counter.i++ })}>
        {phrase}
      </strong>,
    );
    rest = rest.slice(at + phrase.length);
  }
  return out.map((part, i) => <Fragment key={i}>{part}</Fragment>);
}

/**
 * About, laid out like a magazine page: the centred title; notes in the margin (Location, Available
 * for, Status) beside the text in two columns, opened by a drop cap; the closing sentence as a pull
 * quote between two rules. A fine line (AboutTrace, A05) is drawn by the scroll down the margin's rule,
 * lighting each note as it passes, then along the quote's top rule: the text gains contrast, the quote
 * lights up.
 */
export async function AboutSection() {
  const t = await getDictionary();
  const { paragraphs, highlight, cards } = t.about;
  const counter = { i: 0 };
  const body = paragraphs.slice(0, -1);
  const closing = paragraphs[paragraphs.length - 1];

  const notes = [
    { label: cards.labels.location, value: cards.locationCity, note: cards.locationRegion },
    { label: cards.labels.availableFor, value: cards.availableFor, note: cards.availableWhere },
  ];

  return (
    <Section id="sobre" labelledBy="sobre-title">
      <div className={styles.stage}>
        <AboutTrace />

        <Statement
          align="center"
          label={t.about.label}
          index={sectionIndex("sobre")}
          highlight={t.about.statementHighlight}
          headingId="sobre-title"
        >
          {t.about.statement}
        </Statement>

        <div className={styles.page}>
          <dl className={styles.margin} data-trace="rail">
            {notes.map((item) => (
              <div key={item.label} className={styles.note} data-trace="note">
                <span className={styles.node} aria-hidden="true" />
                <dt className={styles.label}>{item.label}</dt>
                <dd className={styles.value}>{item.value}</dd>
                <dd className={styles.small}>{item.note}</dd>
              </div>
            ))}
            <div className={styles.note} data-trace="note">
              <span className={styles.node} aria-hidden="true" />
              <dt className={styles.label}>{cards.labels.status}</dt>
              <dd className={styles.status}>
                <StatusDot tone={site.status}>{cards.status}</StatusDot>
              </dd>
            </div>
          </dl>

          <div className={styles.text} data-trace="text">
            {body.map((paragraph, i) => (
              <p key={i} className={i === 0 ? styles.drop : undefined}>
                {markText(paragraph, highlight, counter)}
              </p>
            ))}
          </div>

          <blockquote className={styles.quote} data-trace="quote">
            <p>{closing}</p>
          </blockquote>
        </div>
      </div>
    </Section>
  );
}
