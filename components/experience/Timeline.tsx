"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tag, Tags } from "@/components/ui/Tag";
import { scrollParent } from "@/hooks/useInView";
import { cssVars, cx } from "@/lib/cx";
import styles from "./Timeline.module.css";

export interface TimelineEntry {
  id: string;
  title: string;
  org?: string;
  kind?: string;
  period?: string;
  place?: string;
  summary?: string;
  tags?: string[];
  /** Opened by "Ver atividades". */
  details?: string[];
  /** Shows the status dot with `currentLabel`. */
  current?: boolean;
  currentLabel?: string;
  /** A chapter not started yet: dashed, faded, with `kicker` instead of the period. */
  future?: boolean;
  kicker?: string;
}

interface TimelineProps {
  items: TimelineEntry[];
  moreLabel: string;
  lessLabel: string;
  /** Fraction of the viewport height where the rail fills up to and nodes light up. */
  trigger?: number;
  className?: string;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/**
 * Vertical timeline alternating left/right. The terracota fill follows the scroll up to a trigger at
 * 62% of the viewport; each node lights up when its centre passes the trigger, and the card enters in
 * four beats. Single column below 720px of container width.
 */
export function Timeline({ items, moreLabel, lessLabel, trigger = 0.62, className }: TimelineProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const parent = scrollParent(root);
    let raf = 0;

    // Progress and node states are written straight to the DOM (data attributes React does not own).
    function measure() {
      raf = 0;
      const rect = root!.getBoundingClientRect();
      const viewTop = parent ? parent.getBoundingClientRect().top : 0;
      const viewHeight = parent ? parent.clientHeight : window.innerHeight;
      const line = viewTop + viewHeight * trigger;
      const progress = rect.height ? clamp((line - rect.top) / rect.height, 0, 1) : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress.toFixed(4)})`;
      root!.querySelectorAll<HTMLElement>("[data-tl-item]").forEach((item) => {
        const node = item.querySelector("[data-tl-node]");
        if (!node) return;
        const box = node.getBoundingClientRect();
        item.toggleAttribute("data-active", box.top + box.height / 2 <= line);
        if (box.top < viewTop + viewHeight * 0.9) item.setAttribute("data-in", "");
      });
    }
    function schedule() {
      if (!raf) raf = requestAnimationFrame(measure);
    }

    measure();
    const target = parent ?? window;
    target.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Opening "Ver atividades" changes the height, and so the progress.
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    return () => {
      target.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items, trigger]);

  return (
    <div className={cx(styles.wrap, className)}>
      <div className={styles.tl} ref={rootRef}>
        <span className={styles.rail} aria-hidden="true">
          <span className={styles.fill} ref={fillRef} />
        </span>
        <ol className={styles.list}>
          {items.map((item, i) => (
            <TimelineItem
              key={item.id}
              item={item}
              index={i}
              side={i % 2 === 0 ? "left" : "right"}
              moreLabel={moreLabel}
              lessLabel={lessLabel}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}

interface TimelineItemProps {
  item: TimelineEntry;
  index: number;
  side: "left" | "right";
  moreLabel: string;
  lessLabel: string;
}

function TimelineItem({ item, index, side, moreLabel, lessLabel }: TimelineItemProps) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();

  return (
    <li
      data-tl-item=""
      className={cx(styles.item, side === "left" ? styles.left : styles.right, item.future && styles.future)}
      style={cssVars({ "--i": index })}
    >
      <span className={styles.node} data-tl-node="" aria-hidden="true" />
      <span className={styles.arm} aria-hidden="true" />
      <article className={styles.card}>
        {item.future ? (
          <p className={cx(styles.period, styles.s1)}>{item.kicker}</p>
        ) : (
          <p className={cx(styles.period, styles.s1)}>
            <span>{item.period}</span>
            {item.current ? (
              <StatusDot tone="open" size="sm" className={styles.status}>
                {item.currentLabel}
              </StatusDot>
            ) : null}
          </p>
        )}
        <h3 className={cx(styles.title, styles.s2)}>{item.title}</h3>
        {item.org ? (
          <p className={cx(styles.org, styles.s2)}>
            <strong>{item.org}</strong>
            {item.kind ? <span> · {item.kind}</span> : null}
          </p>
        ) : null}
        {item.place ? (
          <p className={cx(styles.place, styles.s3)}>
            <Icon name="pin" size={12} />
            {item.place}
          </p>
        ) : null}
        {item.summary ? <p className={cx(styles.summary, styles.s3)}>{item.summary}</p> : null}
        {item.tags?.length ? (
          <Tags className={styles.s4}>
            {item.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Tags>
        ) : null}
        {item.details?.length ? (
          <>
            <button
              type="button"
              className={cx(styles.more, styles.s4)}
              aria-expanded={open}
              aria-controls={detailsId}
              onClick={() => setOpen(!open)}
            >
              <span>{open ? lessLabel : moreLabel}</span>
              <Icon name="plus" size={14} className={styles.moreIcon} />
            </button>
            <div className={cx(styles.details, open && styles.detailsOpen)} id={detailsId}>
              <div>
                <ul>
                  {item.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : null}
      </article>
    </li>
  );
}
