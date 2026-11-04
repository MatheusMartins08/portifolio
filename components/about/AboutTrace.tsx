"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { cssVars, cx } from "@/lib/cx";
import { hash, jag, lengths, toPath, type Point } from "@/lib/geometry/lightning";
import styles from "./AboutTrace.module.css";

/** How far past the section's foot the bolt runs out, px. */
const RAIL = { after: 96 };
/**
 * The bolt's shape, after a photograph of real lightning.
 * - Trunk: almost straight on the whole, with a slow drift (`wander`) and a constant fine tremor —
 *   short runs (`step`) ending in small kinks (`kink`), each broken again by fine fractal breaks.
 * - Branches grow where the trunk kinks, on the outside of the bend, every `gap` px (±). They leave at
 *   a wide angle, lean the way the bolt travels and curve back towards it (`bend`) as they go, crinkled
 *   all along. Long near the bolt's start, shorter towards its end (`decay`); near the end one runs
 *   almost alongside the trunk, as if it split (`split`).
 * - Branches branch again, up to `levels` deep, finer and dimmer each time.
 * - Every branch is grown in the free space only: it stops just short (`clearance`) of the title and
 *   of every module's content, and of the viewport's edges. Inside the sheet that leaves the modules'
 *   padding and empty stretches, so branches stay short there; past the sheet's edge they run longer.
 */
const SHAPE = {
  seed: 31,
  step: 24,
  kink: 6,
  wander: { size: 9, every: 260 },
  fine: { cap: 2.6, rough: 0.25, minSeg: 5 },
  branch: {
    first: 50,
    gap: [72, 120],
    angle: [0.6, 1.05],
    length: [50, 140],
    decay: 0.55,
    bend: 0.3,
    step: 9,
    kink: 4,
    levels: 3,
    subAt: [0.22, 0.78],
    subLength: [0.32, 0.6],
    subAngle: [0.35, 0.8],
    min: [22, 12, 8],
    split: { at: 0.45, angle: 0.28, length: 0.75 },
  },
  clearance: 10,
  /** A branch draws while the head covers this many times its length: a beat behind the trunk. */
  pace: 1.5,
};

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

/** Where an element's text actually is (a block is wider than its words), in stage px. */
function textBoxIn(el: HTMLElement, stage: HTMLElement): Box {
  const range = document.createRange();
  range.selectNodeContents(el);
  const rect = range.getBoundingClientRect();
  const origin = stage.getBoundingClientRect();
  return { x: rect.left - origin.left, y: rect.top - origin.top, w: rect.width, h: rect.height };
}

/** The pieces of the page the bolt runs past (marked `data-trace` in the stage). */
interface Parts {
  /** The section title: no branch crosses it. */
  title: HTMLElement | null;
  /** What the modules sit in (`data-trace="sheet"`): the bolt starts at its top-left corner, runs down
      its left edge and leaves down its far edge. */
  sheet: HTMLElement;
  /** Every module, in reading order: each takes a pulse as the head reaches it. */
  modules: HTMLElement[];
  /** The closing module: the bolt turns along its top. */
  end: HTMLElement;
  /** Other content no branch crosses (`data-trace="block"`: headings outside the modules). */
  blocks: HTMLElement[];
}

/** Stroke weight of a branch piece: thicker at a branch's fork than at its tip; deeper branches thinner still. */
type Weight = "major" | "minor" | "fine";

interface Branch {
  d: string;
  weight: Weight;
  /** When it starts drawing, as a share of the trunk drawn, and how much of the trunk the head covers while it draws. */
  fork: number;
  span: number;
}

interface Trace {
  width: number;
  height: number;
  trunk: string;
  branches: Branch[];
  /** Per point of the trunk: the depth of the reading line (px below the stage top) at which the head reaches it, and its length along the trunk. */
  at: number[];
  run: number[];
  /** Depths at which the head reaches each module, and lights the closing one. */
  marks: { modules: number[]; end: number };
}

const between = ([lo, hi]: number[], t: number) => lo + (hi - lo) * t;
const rotate = ([x, y]: Point, a: number): Point => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const unit = (a: Point, b: Point): Point => {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
};

/** A kink of the trunk: the point's index and the side it was pushed to (`stretch`, `local`: which stretch, and which kink of it). */
interface Kink {
  index: number;
  side: number;
  stretch?: number;
  local?: number;
}

/**
 * A trunk stretch from a to b: a slow drift plus short kinked runs, then fine breaks. `salt` keeps
 * every stretch its own. Also says where the kinks are (indexes into the returned points, `a` being 0).
 * The kinks sit at fixed distances from `a`, so a stretch that grows keeps its shape and only gains
 * kinks at its end.
 */
function leader(a: Point, b: Point, salt: number): { points: Point[]; kinks: Kink[] } {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / len, dy / len];
  const phase = hash(SHAPE.seed, salt, 0, 9) * Math.PI * 2;
  const corners: Array<{ p: Point; side: number }> = [{ p: a, side: 0 }];
  let side = hash(SHAPE.seed, salt, 0) < 0.5 ? -1 : 1;
  for (let i = 1; i < 1000; i++) {
    const d = (i + (hash(SHAPE.seed, salt, i, 1) - 0.5) * 0.5) * SHAPE.step;
    if (d > len - SHAPE.step * 0.5) break;
    if (hash(SHAPE.seed, salt, i, 2) < 0.75) side = -side;
    // The drift fades in and out at the ends, so the stretch still meets its corners.
    const fade = Math.min(1, d / 60, (len - d) / 60);
    const drift = SHAPE.wander.size * Math.sin((d * Math.PI * 2) / SHAPE.wander.every + phase) * fade;
    const off = side * SHAPE.kink * (0.3 + 0.7 * hash(SHAPE.seed, salt, i, 3)) + drift;
    corners.push({ p: [a[0] + ux * d - uy * off, a[1] + uy * d + ux * off], side });
  }
  corners.push({ p: b, side: 0 });
  const points: Point[] = [a];
  const kinks: Kink[] = [];
  for (let i = 1; i < corners.length; i++) {
    points.push(...jag(corners[i - 1].p, corners[i].p, { ...SHAPE.fine, seed: SHAPE.seed, salt: salt * 97 + i }).slice(1));
    if (i < corners.length - 1) kinks.push({ index: points.length - 1, side: corners[i].side });
  }
  return { points, kinks };
}

/**
 * A branch from `from`, leaving `dir` at `angle` to `side` and curving back towards it as it goes;
 * crinkled (short kinked runs, fine breaks). Cut short where `free` says no: only the part before the
 * first blocked point is kept.
 */
function grow(from: Point, dir: Point, side: number, angle: number, length: number, salt: number, free: (p: Point) => boolean): Point[] {
  const B = SHAPE.branch;
  const steps = Math.max(2, Math.round(length / B.step));
  const corners: Point[] = [from];
  let p = from;
  for (let s = 1; s <= steps; s++) {
    const d = rotate(dir, side * angle * (1 - B.bend * (s / steps)));
    const kink = (hash(SHAPE.seed, salt, s) - 0.5) * 2 * B.kink;
    p = [p[0] + d[0] * (length / steps) - d[1] * kink, p[1] + d[1] * (length / steps) + d[0] * kink];
    corners.push(p);
  }
  const out: Point[] = [from];
  for (let i = 1; i < corners.length; i++) {
    for (const q of jag(corners[i - 1], corners[i], { cap: 1.8, rough: 0.28, minSeg: 3.5, seed: SHAPE.seed, salt: salt * 31 + i }).slice(1)) {
      if (!free(q)) return out;
      out.push(q);
    }
  }
  return out;
}

/**
 * The bolt's course, from the measured page. From the sheet's top-left corner down its left edge to the
 * closing module; along that module's top (the head takes the scroll of its height to cross it); then
 * down the sheet's far edge and out of the section. Branches grow as it goes, in the free space only —
 * mostly outside the sheet, in the page's margin.
 * The way down is planned module by module (a stretch each, with its own randomness and its own
 * branches), so a module that grows (a commit opened) only stretches the bolt beside it and moves the
 * rest down, instead of reshaping the whole bolt.
 */
function plan(stage: HTMLElement, { title, sheet, modules, end, blocks: extra }: Parts): Trace | null {
  const width = stage.offsetWidth;
  const height = stage.offsetHeight;
  if (!width || !height || !modules.length) return null;
  const s = boxIn(sheet, stage);
  const e = boxIn(end, stage);
  const m = modules.map((el) => boxIn(el, stage));
  const section = stage.closest("section");
  const origin = stage.getBoundingClientRect();
  // Branches may reach up to the very top of the section (the stage sits below its top padding).
  const top = section ? section.getBoundingClientRect().top - origin.top + 2 : -64;
  // On the sheet's left edge (its 1px border).
  const x0 = s.x + 0.5;
  const y0 = s.y + 0.5;
  const turn = e.y - 0.5;
  const far = s.x + s.w - 0.5;
  const bottom = height + RAIL.after;

  // ---- free space: off every piece of content (with clearance), inside the viewport and the section ----
  const content = [...modules.flatMap((el) => Array.from(el.querySelectorAll<HTMLElement>('[data-trace="inner"] > *'))), ...extra];
  const blocks: Box[] = [...(title ? [textBoxIn(title, stage)] : []), ...content.map((el) => boxIn(el, stage))].map((b) => ({
    x: b.x - SHAPE.clearance,
    y: b.y - SHAPE.clearance,
    w: b.w + SHAPE.clearance * 2,
    h: b.h + SHAPE.clearance * 2,
  }));
  const left = -origin.left + 6;
  const right = document.documentElement.clientWidth - origin.left - 6;
  const free = ([x, y]: Point) =>
    x > left && x < right && y > top && y < bottom && !blocks.some((b) => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h);

  // Each stretch knows how the reading-line depth maps onto it: on the way down, a point is reached
  // when the line is at its height; across the closing module, its height of scroll is spread over the
  // crossing; below it, everything is shifted by that height.
  const span = e.h;
  const across = (x: number) => turn + ((x - x0) / (far - x0)) * span;
  // The way down, cut at every module's top.
  const cuts = [...new Set(m.map((b) => b.y))].filter((y) => y > y0 + 12 && y < turn - 12).sort((a, b) => a - b);
  const downs = [y0, ...cuts, turn];
  const stretches: Array<{ from: Point; to: Point; depth: (p: Point) => number }> = [
    ...downs.slice(1).map((y, i) => ({ from: [x0, downs[i]] as Point, to: [x0, y] as Point, depth: ([, py]: Point) => Math.min(py, turn) })),
    { from: [x0, turn], to: [far, turn], depth: ([x]) => across(x) },
    { from: [far, turn], to: [far, bottom], depth: ([, y]) => Math.max(y, turn) + span },
  ];

  const points: Point[] = [stretches[0].from];
  const at: number[] = [stretches[0].depth(stretches[0].from)];
  const owner: number[] = [0];
  const kinks: Kink[] = [];
  stretches.forEach((s, i) => {
    const { points: run, kinks: own } = leader(s.from, s.to, i + 1);
    const base = points.length - 1;
    for (const p of run.slice(1)) {
      points.push(p);
      // Monotonic, whatever the kinks did.
      at.push(Math.max(s.depth(p), at[at.length - 1]));
      owner.push(i);
    }
    kinks.push(...own.map((k, j) => ({ index: base + k.index, side: k.side, stretch: i, local: j })));
  });
  const run = lengths(points);
  const total = run[run.length - 1] || 1;

  // ---- branches ----
  const B = SHAPE.branch;
  const branches: Branch[] = [];
  const WEIGHTS: Weight[] = ["major", "minor", "fine"];
  /** The trunk's direction of travel around a point. */
  const heading = (i: number): Point => unit(points[Math.max(0, i - 4)], points[Math.min(points.length - 1, i + 4)]);

  /**
   * Grows a branch and, recursively, its own branches. `travel` is the way the whole bolt goes there:
   * no branch turns back against it. `at0`: when it starts drawing (share of the trunk).
   */
  const spread = (from: Point, dir: Point, side: number, angle: number, length: number, level: number, at0: number, travel: Point, salt: number) => {
    // Never back up the bolt: if leaning that far would point against its travel, lean the other way.
    const lean = rotate(dir, side * angle);
    if (lean[0] * travel[0] + lean[1] * travel[1] < 0.05) side = -side;
    const line = grow(from, dir, side, angle, length, salt, free);
    const grown = lengths(line);
    const len = grown[grown.length - 1];
    if (line.length < 3 || len < B.min[level - 1]) return;
    const spanAll = (len * SHAPE.pace) / total;
    if (level === 1) {
      // Thicker at the fork, thinner towards the tip.
      const cut = Math.floor(line.length * 0.5);
      branches.push({ d: toPath(line.slice(0, cut + 1)), weight: "major", fork: at0, span: spanAll * 0.5 });
      branches.push({ d: toPath(line.slice(cut)), weight: "minor", fork: at0 + spanAll * 0.5, span: spanAll * 0.5 });
    } else {
      branches.push({ d: toPath(line), weight: WEIGHTS[Math.min(level, 2)], fork: at0, span: spanAll });
    }
    if (level >= B.levels) return;
    // One or two branches of its own (one, deeper down), on either side, further down its length.
    const count = level === 1 ? (hash(SHAPE.seed, salt, 70) < 0.65 ? 2 : 1) : hash(SHAPE.seed, salt, 71) < 0.55 ? 1 : 0;
    for (let c = 0; c < count; c++) {
      const share = between(B.subAt, hash(SHAPE.seed, salt, 72 + c));
      const i = Math.min(line.length - 2, Math.max(1, Math.floor((line.length - 1) * share)));
      const subDir = unit(line[i - 1], line[Math.min(line.length - 1, i + 2)]);
      const subSide = c === 0 ? side : -side;
      spread(
        line[i],
        subDir,
        subSide,
        between(B.subAngle, hash(SHAPE.seed, salt, 74 + c)),
        len * between(B.subLength, hash(SHAPE.seed, salt, 76 + c)),
        level + 1,
        at0 + (grown[i] * SHAPE.pace) / total,
        travel,
        salt * 7 + c + 1,
      );
    }
  };

  // Branches, stretch by stretch: the first `first` px into the bolt (half that into each later
  // stretch, so a short one still gets one), then every `gap` px. Their randomness is keyed by the
  // stretch and the kink's place in it, so a stretch that changes leaves the others' branches alone.
  const stretchStart = stretches.map((_, i) => run[Math.max(0, owner.indexOf(i) - 1)] ?? 0);
  let due = B.first;
  let current = -1;
  kinks.forEach((kink) => {
    const along = run[kink.index];
    const stretch = kink.stretch ?? 0;
    const key = stretch * 100 + (kink.local ?? 0);
    if (stretch !== current) {
      current = stretch;
      due = stretchStart[stretch] + (stretch === 0 ? B.first : B.first * 0.5);
    }
    if (along < due || along > total - 30) return;
    const travel = unit(stretches[owner[kink.index]].from, stretches[owner[kink.index]].to);
    // The kink pushed the trunk to `side`; the outside of the bend is that side. (In screen space, with
    // y down, rotating the heading by a positive angle turns it the same way a positive kink pushes.)
    spread(
      points[kink.index],
      heading(kink.index),
      kink.side,
      between(B.angle, hash(SHAPE.seed, 52, key)),
      between(B.length, hash(SHAPE.seed, 53, key)) * (1 - B.decay * (along / total)),
      1,
      along / total,
      travel,
      300 + key,
    );
    due = along + between(B.gap, hash(SHAPE.seed, 50, key));
  });

  // Near the end, the trunk splits: one branch runs almost alongside it, long.
  const final = stretches[stretches.length - 1];
  const finalFrom = run[points.findIndex((_, i) => owner[i] === stretches.length - 1)] ?? total * 0.8;
  const splitAt = finalFrom + (total - finalFrom) * B.split.at;
  const si = run.findIndex((v) => v >= splitAt);
  if (si > 0) {
    spread(
      points[si],
      heading(si),
      hash(SHAPE.seed, 80) < 0.5 ? -1 : 1,
      B.split.angle,
      (total - splitAt) * B.split.length,
      1,
      splitAt / total,
      unit(final.from, final.to),
      999,
    );
  }

  const marks = {
    modules: m.map((b, i) => (modules[i] === end ? turn : Math.max(y0, b.y + 8))),
    end: across(x0 + (far - x0) * 0.45),
  };
  return { width, height, trunk: toPath(points), branches, at, run, marks };
}

/** Length along the trunk at a reading depth (linear between points). */
function lengthAt({ at, run }: Trace, depth: number): number {
  if (depth <= at[0]) return 0;
  for (let i = 1; i < at.length; i++) {
    if (depth <= at[i]) {
      const span = at[i] - at[i - 1];
      return run[i - 1] + (span ? (depth - at[i - 1]) / span : 1) * (run[i] - run[i - 1]);
    }
  }
  return run[run.length - 1];
}

/**
 * A05 — Electric Trace Reveal. A bolt drawn by the scroll down the About log's rail: a
 * stepped, broken trunk with branches growing off it as its head passes. Each module takes one short
 * pulse (`data-pulse` on `[data-trace="module"]`) and the closing one lights up (`data-lit` on the
 * module marked `data-end`) — once each, so scrolling back never flickers. With reduced motion the bolt
 * is simply there, whole, and the CSS shows everything lit.
 */
export function AboutTrace() {
  const rootRef = useRef<SVGSVGElement>(null);
  const [trace, setTrace] = useState<Trace | null>(null);
  const fired = useRef({ modules: [] as boolean[], end: false });

  // ---- course: from the measured layout, again when the stage resizes or the fonts arrive ----
  useEffect(() => {
    const stage = rootRef.current?.parentElement;
    if (!stage) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const modules = Array.from(stage.querySelectorAll<HTMLElement>('[data-trace="module"]'));
      const end = modules.find((el) => el.hasAttribute("data-end"));
      const sheet = stage.querySelector<HTMLElement>('[data-trace="sheet"]');
      if (!end || !sheet) return;
      const blocks = Array.from(stage.querySelectorAll<HTMLElement>('[data-trace="block"]'));
      setTrace(plan(stage, { title: stage.querySelector<HTMLElement>("h2"), sheet, modules, end, blocks }));
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
      const total = trace.run[trace.run.length - 1] || 1;
      root.style.setProperty("--k", (lengthAt(trace, depth) / total).toFixed(4));
      const done = fired.current;
      const modules = stage.querySelectorAll<HTMLElement>('[data-trace="module"]');
      trace.marks.modules.forEach((mark, i) => {
        if (!done.modules[i] && depth >= mark) {
          done.modules[i] = true;
          modules[i]?.setAttribute("data-pulse", "");
        }
      });
      if (!done.end && depth >= trace.marks.end) {
        done.end = true;
        stage.querySelector<HTMLElement>('[data-trace="module"][data-end]')?.setAttribute("data-lit", "");
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
      {trace ? (
        <>
          {trace.branches.map((branch, i) => (
            <g
              key={i}
              className={cx(styles.branch, styles[branch.weight])}
              style={cssVars({ "--f": branch.fork.toFixed(4), "--s": branch.span.toFixed(4) })}
            >
              <path className={styles.glow} d={branch.d} pathLength={1} />
              <path className={styles.core} d={branch.d} pathLength={1} />
            </g>
          ))}
          <g className={styles.trunk}>
            <path className={styles.glow} d={trace.trunk} pathLength={1} />
            <path className={styles.core} d={trace.trunk} pathLength={1} />
            <path className={styles.head} d={trace.trunk} pathLength={1} />
          </g>
        </>
      ) : null}
    </svg>
  );
}
