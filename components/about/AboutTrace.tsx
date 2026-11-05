"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { cssVars } from "@/lib/cx";
import { hash, jag, lengths, toPath, type Point } from "@/lib/geometry/lightning";
import styles from "./AboutTrace.module.css";

/**
 * The bolt's shape between two marks of the rail: one broken line, no branches — irregular, never a wave.
 * - Corners at uneven runs (`step`: short and long), each one jumping sideways (`jump`) from the last: a
 *   random walk that drifts for a few runs, then snaps back, held within `reach` px of the rail; less
 *   within `ease` px of either end, so it leaves and meets the marks centred.
 * - Fine breaks between the corners (`fine`), as in every bolt on the site.
 * - It stops `clear` px short of each mark's ring, so it never runs over a mark.
 * At most ~8px off the rail: well clear of the boxes, which sit 24–32px to its right.
 */
const SHAPE = {
  seed: 47,
  step: [7, 22],
  jump: [1.5, 6],
  reach: 6,
  ease: 12,
  fine: { cap: 1.8, rough: 0.28, minSeg: 3.5 },
  clear: 4,
  /** Length of the bright head at the drawing edge, px. */
  tip: 6,
};

const between = ([lo, hi]: number[], t: number) => lo + (hi - lo) * t;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The element's box in stage px, from layout offsets (entrance transforms do not move it). */
function boxIn(el: HTMLElement, stage: HTMLElement): Box {
  let x = 0;
  let y = 0;
  for (let node: HTMLElement | null = el; node && node !== stage; node = node.offsetParent as HTMLElement | null) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/**
 * The bolt from a down to b (straight below it). `salt` keeps every stretch its own; the corners sit at
 * fixed distances from `a`, so a stretch that grows (a commit opened beside it) keeps its shape and
 * only gains corners at its foot.
 */
function stretch(a: Point, b: Point, salt: number): Point[] {
  const len = b[1] - a[1];
  const corners: Point[] = [a];
  let d = 0;
  let off = 0;
  for (let i = 1; i < 1000; i++) {
    d += between(SHAPE.step, hash(SHAPE.seed, salt, i, 1));
    if (d > len - SHAPE.step[0]) break;
    // Either way at random — but far out, mostly back towards the rail.
    let dir = hash(SHAPE.seed, salt, i, 2) < 0.5 ? -1 : 1;
    if (Math.abs(off) > SHAPE.reach / 2 && Math.sign(off) === dir && hash(SHAPE.seed, salt, i, 4) < 0.7) dir = -dir;
    off = Math.max(-SHAPE.reach, Math.min(SHAPE.reach, off + dir * between(SHAPE.jump, hash(SHAPE.seed, salt, i, 3))));
    const fade = Math.min(1, d / SHAPE.ease, (len - d) / SHAPE.ease);
    corners.push([a[0] + off * fade, a[1] + d]);
  }
  corners.push(b);
  const points: Point[] = [a];
  for (let i = 1; i < corners.length; i++) {
    points.push(...jag(corners[i - 1], corners[i], { ...SHAPE.fine, seed: SHAPE.seed, salt: salt * 97 + i }).slice(1));
  }
  return points;
}

interface Stretch {
  d: string;
  /** Where it starts and how tall it is (stage px): the reading line draws it from y0 to y0 + h. */
  y0: number;
  h: number;
  /** The head's length, as a share of the stretch. */
  tip: number;
}

interface Trace {
  width: number;
  height: number;
  stretches: Stretch[];
  /** Depths (px below the stage top) at which the reading line reaches each mark, and the rail's foot. */
  marks: number[];
  end: number;
}

/**
 * The bolt's course, from the measured log: from each mark on the rail (`data-trace="node"`) down to the
 * next, stopping short of both rings; from the last mark straight down to the foot of the last box.
 */
function plan(stage: HTMLElement): Trace | null {
  const width = stage.offsetWidth;
  const height = stage.offsetHeight;
  const nodes = Array.from(stage.querySelectorAll<HTMLElement>('[data-trace="node"]'));
  if (!width || !height || !nodes.length) return null;
  const marks = nodes.map((el) => boxIn(el, stage));
  // GitHub's commit mark: a ring of radius 5 (+ half its 2px stroke) on the icon's 24px grid.
  const ring = (b: Box) => (b.h * 6) / 24;
  const stretches: Stretch[] = [];
  marks.forEach((m, i) => {
    const next = marks[i + 1];
    const x = m.x + m.w / 2;
    const y0 = m.y + m.h / 2 + ring(m) + SHAPE.clear;
    const y1 = next ? next.y + next.h / 2 - ring(next) - SHAPE.clear : height;
    if (y1 - y0 < SHAPE.step[1]) return;
    const points = stretch([x, y0], [x, y1], i + 1);
    const run = lengths(points);
    stretches.push({ d: toPath(points), y0, h: y1 - y0, tip: Math.min(0.25, SHAPE.tip / (run[run.length - 1] || 1)) });
  });
  return { width, height, stretches, marks: marks.map((m) => m.y + m.h / 2), end: height };
}

/**
 * A05 — Electric Trace Reveal, as the log's rail: between GitHub's commit marks runs a broken bolt,
 * dim at rest, that the scroll lights from the top down — each stretch drawn as the reading line passes
 * it, each mark lit (`data-pulse`) as the line reaches it, and the oldest commit (`[data-end]`) lit
 * (`data-lit`) when the bolt gets to the rail's foot. Once each, so scrolling back never flickers. With
 * reduced motion the bolt is simply there, whole, and the CSS shows everything lit.
 */
export function AboutTrace() {
  const rootRef = useRef<SVGSVGElement>(null);
  const [trace, setTrace] = useState<Trace | null>(null);
  const fired = useRef({ marks: [] as boolean[], end: false });

  // ---- course: from the measured log, again when it resizes (a commit opened) or the fonts arrive ----
  useEffect(() => {
    const stage = rootRef.current?.parentElement;
    if (!stage) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      setTrace(plan(stage));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(stage);
    document.fonts.ready.then(schedule);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  // ---- the head: follows the reading line; what it reaches lights up, once ----
  useScrollProgress(
    rootRef,
    (depth) => {
      const root = rootRef.current;
      const stage = root?.parentElement;
      if (!root || !stage || !trace) return;
      root.style.setProperty("--d", depth.toFixed(1));
      const done = fired.current;
      const nodes = stage.querySelectorAll<HTMLElement>('[data-trace="node"]');
      trace.marks.forEach((mark, i) => {
        if (!done.marks[i] && depth >= mark) {
          done.marks[i] = true;
          nodes[i]?.setAttribute("data-pulse", "");
        }
      });
      if (!done.end && depth >= trace.end) {
        done.end = true;
        stage.querySelector<HTMLElement>("[data-end]")?.setAttribute("data-lit", "");
      }
    },
    { enabled: trace !== null },
  );

  return (
    <svg
      ref={rootRef}
      className={styles.trace}
      width={trace?.width ?? 0}
      height={trace?.height ?? 0}
      viewBox={trace ? `0 0 ${trace.width} ${trace.height}` : undefined}
      aria-hidden="true"
    >
      {trace?.stretches.map((s, i) => (
        <g
          key={i}
          className={styles.stretch}
          style={cssVars({ "--y0": s.y0.toFixed(1), "--h": s.h.toFixed(1), "--t": s.tip.toFixed(4) })}
        >
          <path className={styles.track} d={s.d} />
          <path className={styles.glow} d={s.d} pathLength={1} />
          <path className={styles.core} d={s.d} pathLength={1} />
          <path className={styles.head} d={s.d} pathLength={1} />
        </g>
      ))}
    </svg>
  );
}
