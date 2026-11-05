"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useInView } from "@/hooks/useInView";
import type { ImageAsset } from "@/lib/content/assets";
import { cssVars, cx } from "@/lib/cx";
import styles from "./Commit.module.css";

/** How long the check stays on the copy button, ms. */
const COPIED_FOR = 1500;

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
  /** The copy button's name ("Copiar hash"; the hash follows it) and what it announces once done. */
  copy: string;
  copied: string;
  /** Place in the log, for the entrance's stagger. */
  index: number;
  /** The oldest commit, at the foot of the rail: lights up once the bolt (AboutTrace) gets there. */
  end?: boolean;
  /** Open from the start (the newest, so the log shows what its "…" hides). */
  open?: boolean;
}

/**
 * One row of the commit log: the message (a button: the whole row opens and closes the description,
 * like GitHub's "…"), author and when, then the short hash with GitHub's two buttons — copy (it does
 * copy the hash) and browse (`<>`, only a picture here). Rises in once on entering the screen.
 */
export function Commit({
  type,
  title,
  body,
  hash,
  author,
  avatar,
  committed,
  copy,
  copied,
  index,
  end = false,
  open: openAtFirst = false,
}: CommitProps) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const [open, setOpen] = useState(openAtFirst);
  /** Copies made (0: none showing): each one restarts the check's moment. */
  const [copies, setCopies] = useState(0);
  const bodyId = useId();

  useEffect(() => {
    if (!copies) return;
    const id = window.setTimeout(() => setCopies(0), COPIED_FOR);
    return () => window.clearTimeout(id);
  }, [copies]);

  const copyHash = () => {
    // No clipboard (an insecure context): nothing to do.
    navigator.clipboard?.writeText(hash).then(
      () => setCopies((n) => n + 1),
      () => {},
    );
  };

  return (
    <li
      ref={ref}
      className={cx(styles.commit, open && styles.open)}
      data-end={end ? "" : undefined}
      data-in={inView ? "" : undefined}
      style={cssVars({ "--i": index })}
    >
      <div className={styles.inner}>
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
          <div className={styles.actions}>
            <span className={styles.hash} aria-hidden="true">
              {hash}
            </span>
            <button type="button" className={cx(styles.action, styles.copy)} aria-label={`${copy} ${hash}`} onClick={copyHash}>
              <Icon name={copies ? "check" : "copy"} size={16} />
            </button>
            <span className={styles.action} aria-hidden="true">
              <Icon name="code" size={16} />
            </span>
            <span className="sr-only" aria-live="polite">
              {copies ? copied : ""}
            </span>
          </div>
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
