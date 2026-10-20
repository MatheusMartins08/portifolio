/**
 * Geometry of the arc between two projects side by side: out of the first screenshot's right edge, near
 * its top, across the gutter into the empty pocket above the second (the grid's offset), and down onto
 * the second's top edge. A stepped leader along that curve — short runs with sharp kinks, mostly
 * alternating sides, broken finely along every run — with a twig or two off the kinks. Same fractal
 * primitives as the other bolts; pure and seeded.
 */

import { hash, jag, lengths, toPath, type Point } from "@/lib/geometry/lightning";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ArcStroke {
  d: string;
  /** 0 trunk, 1 twig. */
  level: 0 | 1;
  /** Drawn from t0 to t1: px along the arc, from its start. */
  t0: number;
  t1: number;
}

export interface Arc {
  strokes: ArcStroke[];
  /** The trunk alone, for the charge pulse. */
  trunk: string;
  /** Where the last stroke is done, px along the arc. */
  length: number;
  /** Top of the arc and the foot of its reading span, px in the drawing: the scroll reads in y. */
  top: number;
  bottom: number;
}

/** Rough length of one kinked run, px. */
const STEP = 26;
/** Furthest a kink strays from the curve, px. */
const CAP = 7;
/** How far the ends tuck in under the screenshots, px: the cards hide the joins. */
const TUCK = 6;
/** The pocket above the second card must be at least this tall, px. */
const MIN_POCKET = 48;

/** Point at `t` on the quadratic curve a → c → b, and its unit normal. */
function along(a: Point, c: Point, b: Point, t: number): { at: Point; normal: Point } {
  const u = 1 - t;
  const at: Point = [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
  const dx = 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0]);
  const dy = 2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1]);
  const len = Math.hypot(dx, dy) || 1;
  return { at, normal: [-dy / len, dx / len] };
}

/** The arc from `from` (left, higher) to `to` (right, offset down); null when they are not laid out so. */
export function drawArc(from: Rect, to: Rect, seed = 31): Arc | null {
  if (to.x <= from.x + from.width || to.y - from.y < MIN_POCKET) return null;
  const rand = (salt: number, k = 0) => hash(seed, salt, k, 71);

  const start: Point = [from.x + from.width - TUCK, from.y + 26];
  const end: Point = [to.x + to.width * 0.15, to.y + TUCK];
  // The bend: run right first, then come down onto the card.
  const bend: Point = [end[0], start[1] + (end[1] - start[1]) * 0.15];

  const steps = Math.max(3, Math.round((Math.abs(end[0] - start[0]) + Math.abs(end[1] - start[1])) / STEP));
  const course: Point[] = [start];
  let side = rand(1) < 0.5 ? -1 : 1;
  for (let k = 1; k < steps; k++) {
    if (rand(10, k) < 0.8) side = -side;
    const { at, normal } = along(start, bend, end, (k + (rand(20, k) - 0.5) * 0.4) / steps);
    const off = side * CAP * (0.4 + 0.6 * rand(30, k));
    course.push([at[0] + normal[0] * off, at[1] + normal[1] * off]);
  }
  course.push(end);

  const points: Point[] = [start];
  const kinks: number[] = [];
  for (let k = 1; k < course.length; k++) {
    points.push(...jag(course[k - 1], course[k], { seed, salt: 100 + k, cap: 2.4, rough: 0.22, minSeg: 4 }).slice(1));
    if (k < course.length - 1) kinks.push(points.length - 1);
  }
  const run = lengths(points);
  const length = run[run.length - 1];
  const strokes: ArcStroke[] = [{ d: toPath(points), level: 0, t0: 0, t1: length }];

  // ---- a twig or two, off kinks in the middle stretch, opening downward ----
  const twigs = rand(200) < 0.5 ? 1 : 2;
  for (let w = 0; w < twigs && kinks.length > 2; w++) {
    const index = kinks[1 + Math.floor(rand(210, w) * (kinks.length - 2))];
    const fork = points[index];
    const out = rand(220, w) < 0.5 ? -1 : 1;
    const angle = ((25 + 25 * rand(230, w)) * Math.PI) / 180;
    const reach = 10 + 8 * rand(240, w);
    const tip: Point = [fork[0] + out * Math.sin(angle) * reach, fork[1] + Math.cos(angle) * reach];
    const twig = jag(fork, tip, { seed, salt: 250 + w, cap: 2, rough: 0.3, minSeg: 3 });
    const twigRun = lengths(twig);
    strokes.push({ d: toPath(twig), level: 1, t0: run[index], t1: run[index] + twigRun[twigRun.length - 1] });
  }

  return {
    strokes,
    trunk: strokes[0].d,
    length: Math.max(...strokes.map((stroke) => stroke.t1)),
    top: start[1] - 40,
    bottom: end[1] + 140,
  };
}
