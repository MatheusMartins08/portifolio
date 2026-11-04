/**
 * The intro's lightning strike (A02): one bolt falling from above the viewport to the Hero's ground (the
 * viewport's foot), by way of the name's highest point, drawn like a photographed bolt — a bright main
 * channel that wanders but keeps its way down, and long, wiry branches spreading out to the sides, finer
 * and fainter towards their tips. Built on the shared fractal break (`jag`), like every other bolt on
 * the site; pure and seeded, so a given viewport always gets the same bolt.
 * - Channel: short steps, each turned off the way to the next target by up to ±0.75 rad (the tortuous
 *   path), every step broken again finely (the serration).
 * - Branches: off the upper two-thirds, leaving almost sideways and drooping a little as they go, long
 *   at the top and shorter lower down; lower down one runs beside the channel towards the ground, like a
 *   fork. Each may branch again, up to three levels.
 * Every piece knows when it starts growing (`at`, a share of the head's fall), and every branch comes as
 * its base and its tip (`tip`), so it can thin out towards the end.
 */

import { hash, jag, lengths, pointAt, toPath, type Point } from "@/lib/geometry/lightning";

export interface StrikeBranch {
  d: string;
  /** 1 forks off the channel, 2 off a branch, 3 off that. */
  level: 1 | 2 | 3;
  /** The outer half of a branch: finer and fainter. */
  tip: boolean;
  /** When it starts growing, as a share of the head's fall (0 → 1). */
  at: number;
}

export interface Strike {
  width: number;
  height: number;
  trunk: string;
  branches: StrikeBranch[];
}

interface StrikeInput {
  /** Viewport size, px: the bolt is drawn in a fixed, full-viewport layer, and reaches its foot. */
  width: number;
  height: number;
  /** The point it passes through on its way down (the name's highest point). */
  x: number;
  y: number;
  seed?: number;
}

const between = (lo: number, hi: number, t: number) => lo + (hi - lo) * t;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const rotate = ([x, y]: Point, a: number): Point => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const unit = ([x, y]: Point): Point => {
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
};
const toward = (a: Point, b: Point): Point => unit([b[0] - a[0], b[1] - a[1]]);

/** Fine breaks along every stretch of a polyline. */
function serrate(corners: Point[], seed: number, salt: number, cap: number): Point[] {
  const out: Point[] = [corners[0]];
  for (let i = 1; i < corners.length; i++) {
    out.push(...jag(corners[i - 1], corners[i], { seed, salt: salt * 977 + i, cap, rough: 0.26, minSeg: 3 }).slice(1));
  }
  return out;
}

/** A stretch of the main channel, a to b: short steps, each turned off course a little; then serrated. */
function channel(a: Point, b: Point, seed: number, salt: number): Point[] {
  const step = clamp(Math.hypot(b[0] - a[0], b[1] - a[1]) / 22, 12, 32);
  const corners: Point[] = [a];
  let p = a;
  for (let i = 0; i < 400 && Math.hypot(b[0] - p[0], b[1] - p[1]) > step * 1.3; i++) {
    const d = rotate(toward(p, b), (hash(seed, 20 + salt * 2, i) - 0.5) * 1.5);
    const len = step * (0.6 + 0.8 * hash(seed, 21 + salt * 2, i));
    p = [p[0] + d[0] * len, p[1] + d[1] * len];
    corners.push(p);
  }
  corners.push(b);
  return serrate(corners, seed, salt, 3.6);
}

/** A branch: steps out from `start` along `dir`, drooping (`droop` per step) and wavering; then serrated. */
function wire(start: Point, dir: Point, length: number, droop: number, seed: number, salt: number): Point[] {
  const step = clamp(length / 12, 7, 20);
  const corners: Point[] = [start];
  let p = start;
  let d = dir;
  for (let i = 0, run = 0; run < length && i < 200; i++) {
    d = unit([d[0], d[1] + droop]);
    const dd = rotate(d, (hash(seed, salt, i, 1) - 0.5) * 1.3);
    const len = step * (0.6 + 0.8 * hash(seed, salt, i, 2));
    p = [p[0] + dd[0] * len, p[1] + dd[1] * len];
    corners.push(p);
    run += len;
  }
  return serrate(corners, seed, salt, 2.2);
}

export function drawStrike({ width, height, x, y, seed = 7 }: StrikeInput): Strike {
  const drop = height + 48;
  // Enters a little to one side of the name's top and reaches the ground a little to one side of it
  // again, so it falls at a slant and keeps breaking its way down.
  const from: Point = [x + (hash(seed, 1) - 0.45) * Math.min(160, width * 0.12), -40];
  const ground: Point = [x + (hash(seed, 4) - 0.5) * Math.min(260, width * 0.3), height + 8];
  const trunk = [...channel(from, [x, y], seed, 1), ...channel([x, y], ground, seed, 2).slice(1)];
  const run = lengths(trunk);
  const total = run[run.length - 1];
  const branches: StrikeBranch[] = [];

  /** Adds a branch (as base and tip) and maybe its own branches. `at`: when it starts, share of the fall. */
  const grow = (start: Point, dir: Point, length: number, level: 1 | 2 | 3, at: number, salt: number) => {
    const line = wire(start, dir, length, level === 1 ? 0.018 : 0.03, seed, salt);
    const own = lengths(line);
    const mid = Math.max(1, pointAt(own, own[own.length - 1] * 0.5));
    branches.push({ d: toPath(line.slice(0, mid + 1)), level, tip: false, at });
    branches.push({ d: toPath(line.slice(mid)), level, tip: true, at: at + own[mid] / total });
    if (level === 3) return;
    const count = level === 1 ? (hash(seed, salt, 40) < 0.6 ? (hash(seed, salt, 39) < 0.25 ? 2 : 1) : 0) : hash(seed, salt, 41) < 0.25 ? 1 : 0;
    for (let c = 0; c < count; c++) {
      const i = Math.min(line.length - 2, Math.max(1, pointAt(own, own[own.length - 1] * between(0.2, 0.8, hash(seed, salt, 42 + c)))));
      const heading = toward(line[Math.max(0, i - 2)], line[Math.min(line.length - 1, i + 2)]);
      const side = hash(seed, salt, 44 + c) < 0.5 ? -1 : 1;
      grow(
        line[i],
        rotate(heading, side * between(0.35, 0.8, hash(seed, salt, 46 + c))),
        length * between(0.25, 0.5, hash(seed, salt, 48 + c)),
        (level + 1) as 2 | 3,
        at + own[i] / total,
        salt * 7 + c + 1,
      );
    }
  };

  // Long branches off the upper two-thirds, leaving almost sideways, alternating (mostly) sides; long
  // at the top, shorter lower down, never much wider than the screen.
  const count = 4 + Math.floor(hash(seed, 2) * 3);
  const reach = Math.min(drop, width * 1.2);
  let side = hash(seed, 3) < 0.5 ? -1 : 1;
  for (let k = 0; k < count; k++) {
    const share = 0.05 + 0.57 * ((k + hash(seed, 10, k)) / count);
    const i = Math.min(trunk.length - 2, Math.max(1, pointAt(run, total * share)));
    const heading = toward(trunk[Math.max(0, i - 6)], trunk[Math.min(trunk.length - 1, i + 6)]);
    if (hash(seed, 11, k) < 0.8) side = -side;
    grow(
      trunk[i],
      rotate(heading, side * between(1.0, 1.4, hash(seed, 12, k))),
      reach * between(0.28, 0.5, hash(seed, 13, k)) * (1 - 0.5 * share),
      1,
      share,
      100 + k,
    );
  }
  // Lower down, a fork running down beside the channel towards the ground.
  const forkAt = between(0.58, 0.72, hash(seed, 30));
  const fi = Math.min(trunk.length - 2, pointAt(run, total * forkAt));
  const forkHeading = toward(trunk[Math.max(0, fi - 6)], trunk[Math.min(trunk.length - 1, fi + 6)]);
  grow(trunk[fi], rotate(forkHeading, (hash(seed, 31) < 0.5 ? -1 : 1) * between(0.22, 0.36, hash(seed, 32))), drop * 0.26, 1, forkAt, 900);

  return { width, height, trunk: toPath(trunk), branches };
}
