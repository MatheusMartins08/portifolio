"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { EdgeLight } from "@/components/ui/EdgeLight";
import { Icon } from "@/components/ui/Icon";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tag, Tags } from "@/components/ui/Tag";
import { scrollParent } from "@/hooks/useInView";
import { cssVars, cx } from "@/lib/cx";
import { drawChannel, drawTwig, type Channel } from "./channel";
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

/** Half the width of the bolt's drawing, px: room for its kinks, twigs and glow either side of the rail. */
const BOLT_HALF = 40;
/** Container width where the timeline turns into one column (the CSS @container query). */
const ONE_COLUMN = 720;
/** Length of the lit head at the drawing edge, px. */
const HEAD = 28;

interface Layout {
  stops: number[];
  height: number;
  cap: number;
  twoSided: boolean;
}

/**
 * Vertical timeline alternating left/right. A lightning bolt is the rail (geometry in ./channel): through
 * every node, drawn by the scroll up to a trigger at 62% of the viewport, a lit head at its edge; each
 * node lights up — with a brief charge — when its centre passes the trigger, its arm a twig to the card,
 * and the card enters in four beats. Single column below 720px of container width.
 */
export function Timeline({ items, moreLabel, lessLabel, trigger = 0.62, className }: TimelineProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const seed = items.length * 13 + 7;
  const bolt = useMemo(() => (layout ? drawChannel({ ...layout, seed }) : null), [layout, seed]);
  // The scroll handler reads the current bolt (to turn depth into drawn length) and is re-run when it changes.
  const boltRef = useRef<Channel | null>(null);
  const redrawRef = useRef<() => void>(() => {});
  useEffect(() => {
    boltRef.current = bolt;
    redrawRef.current();
  }, [bolt]);

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
      // The head sits at the trigger line: its depth into the timeline, as a share of the bolt's length.
      const depth = clamp(line - rect.top, 0, rect.height);
      const bolt = boltRef.current;
      const progress = bolt ? bolt.shareAt(depth) : rect.height ? depth / rect.height : 0;
      root!.style.setProperty("--p", progress.toFixed(4));
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

    // Where the bolt has to pass: the node centres. Only re-read when the timeline's size changes.
    let key = "";
    function lay() {
      const rect = root!.getBoundingClientRect();
      const stops = Array.from(root!.querySelectorAll("[data-tl-node]"), (node) => {
        const box = node.getBoundingClientRect();
        return Math.round(box.top + box.height / 2 - rect.top);
      });
      const height = Math.round(rect.height);
      const oneColumn = root!.clientWidth <= ONE_COLUMN;
      const next = `${stops.join(",")}|${height}|${oneColumn}`;
      if (next === key) return;
      key = next;
      setLayout({ stops, height, cap: oneColumn ? 7 : 14, twoSided: !oneColumn });
    }

    redrawRef.current = schedule;
    lay();
    measure();
    const target = parent ?? window;
    // Only follow the scroll around the timeline; entering and leaving, one reading settles it.
    let watching = false;
    const listen = (on: boolean) => {
      if (on) {
        target.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
      } else {
        target.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
      }
    };
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === watching) return;
        watching = entry.isIntersecting;
        listen(watching);
        schedule();
      },
      { root: parent, rootMargin: "25% 0px" },
    );
    near.observe(root);
    // Opening "Ver atividades" changes the height: the bolt's course, and the progress.
    const observer = new ResizeObserver(() => {
      lay();
      schedule();
    });
    observer.observe(root);
    return () => {
      listen(false);
      near.disconnect();
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items, trigger]);

  return (
    <div className={cx(styles.wrap, className)}>
      <div className={styles.tl} ref={rootRef}>
        {bolt && layout ? (
          <svg
            className={styles.bolt}
            width={BOLT_HALF * 2}
            height={layout.height}
            viewBox={`${-BOLT_HALF} 0 ${BOLT_HALF * 2} ${layout.height}`}
            style={cssVars({ "--bolt-half": `${BOLT_HALF}px`, "--head": Math.min(0.2, HEAD / bolt.length).toFixed(4) })}
            aria-hidden="true"
          >
            {/* A light edge just below the line, the slight carved feel of the other bolts. */}
            <path className={styles.boltEdge} d={bolt.d} pathLength={1} transform="translate(.6 1)" />
            <path className={styles.boltCore} d={bolt.d} pathLength={1} />
            <path className={styles.boltGlow} d={bolt.d} pathLength={1} />
            <path className={styles.boltHot} d={bolt.d} pathLength={1} />
            {bolt.twigs.map((twig, i) => (
              <g key={i} className={styles.twig} style={cssVars({ "--a": twig.a.toFixed(4), "--b": twig.b.toFixed(4) })}>
                <path className={styles.boltEdge} d={twig.d} pathLength={1} transform="translate(.5 .8)" />
                <path className={styles.boltCore} d={twig.d} pathLength={1} />
              </g>
            ))}
          </svg>
        ) : null}
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
  const twig = useMemo(() => drawTwig(index + 3), [index]);

  return (
    <li
      data-tl-item=""
      className={cx(styles.item, side === "left" ? styles.left : styles.right, item.future && styles.future)}
      style={cssVars({ "--i": index })}
    >
      <span className={styles.node} data-tl-node="" aria-hidden="true" />
      <span className={styles.arm} aria-hidden="true">
        <svg className={styles.armSvg} viewBox="0 0 30 10" preserveAspectRatio="none">
          <path className={styles.armBase} d={twig} />
          <path className={styles.armLit} d={twig} pathLength={1} />
        </svg>
      </span>
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
        <EdgeLight />
      </article>
    </li>
  );
}
