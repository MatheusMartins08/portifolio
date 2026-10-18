/**
 * Geometry of the About lightning: one natural bolt down the middle of the section. A wandering trunk
 * from top to bottom, four branches breaking off diagonally to alternating sides, each with one or two
 * twigs, plus two short twigs off the trunk. Every stroke is fractal (midpoint displacement, the offset
 * proportional to the stretch), so it is jagged at every scale, like the real thing.
 *
 * Timing is length: a stroke is drawn from `t0` to `t1`, in px along the bolt from the top, so a branch
 * starts when the trunk's head passes its fork and grows at the same speed.
 * Pure function, seeded per stroke: the same size gives the same bolt, and resizing keeps its shape.
 */

import { hash } from "@/components/hero/contours";

type Point = [number, number];

/** 0 trunk, 1 branch, 2 twig: thinner at every level. */
export type Level = 0 | 1 | 2;

export interface LightningStroke {
  d: string;
  level: Level;
  /** Drawn from t0 to t1: px along the bolt, from the top of the trunk. */
  t0: number;
  t1: number;
}

export interface Lightning {
  strokes: LightningStroke[];
  /** Length of the trunk, px: the scroll maps the section's height onto it. */
  trunk: number;
}

interface LightningInput {
  width: number;
  height: number;
  seed?: number;
}

/** Shortest straight stretch: below it, no more breaks (the fine serration). */
const MIN_SEG = 8;
/** Offset of a midpoint, as a share of its stretch. */
const ROUGH = 0.2;
/** Branches break off at these shares of the trunk (± a little). */
const FORKS = [0.2, 0.38, 0.56, 0.74];
/** Branches and twigs stay this far inside the drawing. */
const MARGIN = 12;

const toPath = (points: Point[]) => "M" + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L");

/** Fractal line from a to b; `cap` bounds the first offset (each level shrinks it), keeping the line in its lane. */
function jag(a: Point, b: Point, seed: number, salt: number, cap: number): Point[] {
  const out: Point[] = [a];
  const split = (p: Point, q: Point, depth: number, id: number) => {
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const len = Math.hypot(dx, dy);
    if (len < MIN_SEG || depth > 9) {
      out.push(q);
      return;
    }
    const t = 0.4 + 0.2 * hash(seed, salt, id, 2);
    const off = (2 * hash(seed, salt, id, 1) - 1) * Math.min(len * ROUGH, cap * 0.6 ** depth);
    const m: Point = [p[0] + dx * t - (dy / len) * off, p[1] + dy * t + (dx / len) * off];
    split(p, m, depth + 1, id * 2);
    split(m, q, depth + 1, id * 2 + 1);
  };
  split(a, b, 0, 1);
  return out;
}

/** Running length at every point of a polyline. */
function lengths(points: Point[]): number[] {
  const out = [0];
  for (let i = 1; i < points.length; i++) {
    out.push(out[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  }
  return out;
}

/** Index of the first point at or past `at` px along the polyline. */
function pointAt(run: number[], at: number): number {
  const i = run.findIndex((v) => v >= at);
  return i < 0 ? run.length - 1 : i;
}

export function drawLightning({ width, height, seed = 23 }: LightningInput): Lightning {
  if (width <= 0 || height <= 0) return { strokes: [], trunk: 0 };
  const strokes: LightningStroke[] = [];
  const rand = (salt: number, k = 0) => hash(seed, salt, k, 41);

  // ---- trunk: down the middle, drifting a little to one side ----
  const cx = width / 2;
  const drift = (2 * rand(1) - 1) * width * 0.06;
  const trunk = jag([cx + drift * -0.3, 0], [cx + drift, height], seed, 1, width * 0.08);
  const trunkRun = lengths(trunk);
  const trunkLength = trunkRun[trunkRun.length - 1];
  strokes.push({ d: toPath(trunk), level: 0, t0: 0, t1: trunkLength });

  /** A stroke breaking off `from` (reached at time `t`), heading `angle` from straight down, toward `side`. */
  const offshoot = (from: Point, t: number, side: number, angle: number, length: number, level: Level, salt: number) => {
    // The horizontal reach stays inside the drawing.
    const room = side > 0 ? width - MARGIN - from[0] : from[0] - MARGIN;
    const reach = Math.min(length, Math.max(0, room) / Math.max(0.2, Math.sin(angle)));
    if (reach < MIN_SEG * 3) return null;
    const end: Point = [from[0] + side * Math.sin(angle) * reach, from[1] + Math.cos(angle) * reach];
    const points = jag(from, end, seed, salt, reach * 0.25);
    const run = lengths(points);
    strokes.push({ d: toPath(points), level, t0: t, t1: t + run[run.length - 1] });
    return { points, run };
  };

  // ---- branches, alternating sides, each with a twig or two that open further out ----
  let side = rand(2) < 0.5 ? -1 : 1;
  FORKS.forEach((share, b) => {
    const salt = 100 + b * 10;
    const at = pointAt(trunkRun, trunkLength * (share + (rand(salt) - 0.5) * 0.08));
    const angle = ((35 + 25 * rand(salt, 1)) * Math.PI) / 180;
    const branch = offshoot(
      trunk[at],
      trunkRun[at],
      side,
      angle,
      trunkLength * (0.15 + 0.13 * rand(salt, 2)),
      1,
      salt,
    );
    if (branch) {
      const total = branch.run[branch.run.length - 1];
      const twigs = rand(salt, 3) < 0.5 ? 1 : 2;
      for (let w = 0; w < twigs; w++) {
        const i = pointAt(branch.run, total * (0.4 + 0.3 * rand(salt, 4 + w)));
        // Alternately more sideways and more downward than the branch.
        const turn = ((15 + 15 * rand(salt, 6 + w)) * Math.PI) / 180;
        offshoot(
          branch.points[i],
          trunkRun[at] + branch.run[i],
          side,
          w === 0 ? Math.min(angle + turn, 1.4) : Math.max(angle - turn, 0.3),
          total * (0.3 + 0.2 * rand(salt, 8 + w)),
          2,
          salt + 1 + w,
        );
      }
    }
    side = -side;
  });

  // ---- two short twigs off the trunk ----
  [0.1, 0.86].forEach((share, w) => {
    const salt = 200 + w * 10;
    const at = pointAt(trunkRun, trunkLength * share);
    offshoot(
      trunk[at],
      trunkRun[at],
      rand(salt) < 0.5 ? -1 : 1,
      ((40 + 20 * rand(salt, 1)) * Math.PI) / 180,
      trunkLength * (0.04 + 0.03 * rand(salt, 2)),
      2,
      salt,
    );
  });

  return { strokes, trunk: trunkLength };
}
