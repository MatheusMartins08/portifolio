import { Fragment, type ReactNode } from "react";
import { Circuit } from "./Circuit";
import styles from "./AboutBoard.module.css";

interface AboutBlock {
  /** Decorative designator beside the title ("U1"), the same in every language. */
  ref: string;
  title: string;
  /** The opening sentence, set large in the display face; then the rest, in the body face. */
  lead: string;
  rest: string;
  /** Phrases set a shade brighter, for a reader skimming (matched as written). */
  keys: string[];
}

interface AboutBoardProps {
  blocks: AboutBlock[];
  /** Id of the section's sentence, which the bolt comes down beside. */
  sentenceId: string;
  rod: string;
  ground: string;
  silk: string[];
}

/** The text with its key phrases wrapped (each phrase once, where it first appears). */
function marked(text: string, keys: string[]): ReactNode {
  const hits = keys
    .map((key) => ({ key, at: text.indexOf(key) }))
    .filter((hit) => hit.at >= 0)
    .sort((a, b) => a.at - b.at);
  const out: ReactNode[] = [];
  let from = 0;
  for (const { key, at } of hits) {
    if (at < from) continue;
    out.push(text.slice(from, at), <span key={at} className={styles.key}>{key}</span>);
    from = at + key.length;
  }
  out.push(text.slice(from));
  return out.map((part, i) => <Fragment key={i}>{part}</Fragment>);
}

/**
 * The About text as a circuit board: a few short blocks, each its own component on the board (a
 * designator, a title, an opening sentence in the display face, the rest), real text throughout. On a
 * notebook they step across a two-column grid; on a phone they stack, set in from either side in turn.
 * Circuit draws the board over them and lights each block as the energy reaches it — dim but readable
 * until then.
 */
export function AboutBoard({ blocks, sentenceId, rod, ground, silk }: AboutBoardProps) {
  return (
    <div className={styles.board}>
      {blocks.map((block) => (
        <article key={block.ref} className={styles.block} data-circuit="block">
          <h3 className={styles.title} data-circuit="title">
            <span className={styles.ref} aria-hidden="true">
              {block.ref}
            </span>
            <span className={styles.name}>{block.title}</span>
          </h3>
          <p className={styles.lead} data-circuit="text">
            {marked(block.lead, block.keys)}
          </p>
          <p className={styles.rest} data-circuit="text">
            {marked(block.rest, block.keys)}
          </p>
        </article>
      ))}
      <Circuit sentenceId={sentenceId} rod={rod} ground={ground} silk={silk} />
    </div>
  );
}
