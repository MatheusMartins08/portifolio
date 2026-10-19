/**
 * Primitives for lightning-like lines, shared by the Hero backdrop (components/hero/contours.ts) and the
 * scroll-drawn bolts (components/lightning/bolt.ts): seeded noise, fractal breaks, and polyline helpers.
 */

export type Point = [number, number];

/** Stable pseudo-random value in [0, 1) for integer coordinates. */
export function hash(seed: number, i: number, j = 0, k = 0): number {
  let h = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ Math.imul(i, 0x27d4eb2d), 0xc2b2ae35);
  h = Math.imul(h ^ Math.imul(j, 0x165667b1), 0x27d4eb2f);
  h = Math.imul(h ^ Math.imul(k, 0x9e3779b1), 0x85ebca6b);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

interface JagOptions {
  seed: number;
  salt: number;
  /** Bound on the first offset; every level shrinks it, keeping the line in its lane. */
  cap: number;
  /** Offset of a midpoint, as a share of its stretch. */
  rough?: number;
  /** Shortest straight stretch: below it, no more breaks (the fine serration). */
  minSeg?: number;
  /** Refuses a displaced midpoint (it falls back onto the straight line), e.g. inside a clear space. */
  accept?: (point: Point) => boolean;
}

/**
 * Fractal line from a to b, a and b included: midpoint displacement, the offset proportional to the
 * stretch and capped, so it is jagged at every scale, like lightning.
 */
export function jag(a: Point, b: Point, { seed, salt, cap, rough = 0.2, minSeg = 8, accept }: JagOptions): Point[] {
  const out: Point[] = [a];
  const split = (p: Point, q: Point, depth: number, id: number) => {
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const len = Math.hypot(dx, dy);
    if (len < minSeg || depth > 9) {
      out.push(q);
      return;
    }
    const t = 0.4 + 0.2 * hash(seed, salt, id, 2);
    const off = (2 * hash(seed, salt, id, 1) - 1) * Math.min(len * rough, cap * 0.6 ** depth);
    let m: Point = [p[0] + dx * t - (dy / len) * off, p[1] + dy * t + (dx / len) * off];
    if (accept && !accept(m)) m = [p[0] + dx * t, p[1] + dy * t];
    split(p, m, depth + 1, id * 2);
    split(m, q, depth + 1, id * 2 + 1);
  };
  split(a, b, 0, 1);
  return out;
}

/** Running length at every point of a polyline. */
export function lengths(points: Point[]): number[] {
  const out = [0];
  for (let i = 1; i < points.length; i++) {
    out.push(out[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  }
  return out;
}

/** Index of the first point at or past `at` px along a polyline (from its running lengths). */
export function pointAt(run: number[], at: number): number {
  const i = run.findIndex((v) => v >= at);
  return i < 0 ? run.length - 1 : i;
}

export const toPath = (points: Point[]) => "M" + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L");
