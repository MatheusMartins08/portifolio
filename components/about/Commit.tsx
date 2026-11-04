"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useInView } from "@/hooks/useInView";
import type { ImageAsset } from "@/lib/content/assets";
import { cssVars, cx } from "@/lib/cx";
import styles from "./Commit.module.css";

interface CommitProps {
  /** Conventional-commit type ("feat"), the same in every language. */
  type: string;
  title: string;
  /** The commit's description: a short block of the About text, shown when opened. */
  body: string;
  /** Short hash, 7 hex digits. */
  hash: string;
  author: string;
  avatar: ImageAsset;
  /** The verb and when ("commitou hoje"). */
  committed: string;
  /** Place in the log, for the entrance's stagger. */
  index: number;
  /** The oldest commit, at the foot: the bolt (AboutTrace) turns along its top and lights it. */
  end?: boolean;
  /** Open from the start (the newest, so the log shows what its "…" hides). */
  open?: boolean;
}

/**
 * One row of the commit log: its dot on the rail, the message (a button: the whole row opens and
 * closes the description, like GitHub's "…"), author and when, the short hash. Rises in once on entering
 * the screen; the bolt passing it (AboutTrace) sets `data-pulse` and the dot lights, once.
 */
export function Commit({ type, title, body, hash, author, avatar, committed, index, end = false, open: openAtFirst = false }: CommitProps) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const [open, setOpen] = useState(openAtFirst);
  const bodyId = useId();

  return (
    <li
      ref={ref}
      className={cx(styles.commit, open && styles.open)}
      data-trace="module"
      data-end={end ? "" : undefined}
      data-in={inView ? "" : undefined}
      style={cssVars({ "--i": index })}
    >
      <span className={styles.node} aria-hidden="true" />
      <div className={styles.inner} data-trace="inner">
        <div className={styles.row}>
          <h4 className={styles.title}>
            <button type="button" className={styles.toggle} aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen(!open)}>
              <span className={styles.type}>{type}:</span> {title}
              <span className={styles.more} aria-hidden="true">
                <Icon name="dots" size={14} strokeWidth={2.6} />
              </span>
            </button>
          </h4>
          <p className={styles.meta}>
            <Image src={avatar.src} width={20} height={20} alt="" className={styles.avatar} />
            <span>
              <span className={styles.author}>{author}</span> {committed}
            </span>
          </p>
          <span className={styles.hash} aria-hidden="true">
            {hash}
          </span>
        </div>
        <div className={styles.body} id={bodyId}>
          <div>
            <p>{body}</p>
          </div>
        </div>
      </div>
    </li>
  );
}
