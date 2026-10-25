/**
 * The intro's lightning strike (A02): one bolt falling from above the viewport onto a point just over
 * the centred name, with two short branches. Built on the shared fractal break (`jag`), like every
 * other bolt on the site; pure and seeded, so a given viewport always gets the same bolt.
 */

import { hash, jag, lengths, pointAt, toPath, type Point } from "@/lib/geometry/lightning";

export interface Strike {
  width: number;
  height: number;
  trunk: string;
  twigs: string[];
}

interface StrikeInput {
  /** Viewport size, px: the bolt is drawn in a fixed, full-viewport layer. */
  width: number;
  height: number;
  /** Where it lands. */
  x: number;
  y: number;
  seed?: number;
}

export function drawStrike({ width, height, x, y, seed = 7 }: StrikeInput): Strike {
  const drop = Math.max(80, y + 24);
  // Enters a little to one side of where it lands, so it falls at a slight slant.
  const from: Point = [x + (hash(seed, 1) - 0.35) * Math.min(160, width * 0.12), -24];
  const trunk = jag(from, [x, y], { seed, salt: 1, cap: Math.min(64, drop * 0.09), rough: 0.24, minSeg: 9 });
  const run = lengths(trunk);
  const total = run[run.length - 1];

  // Two branches off the upper half, one to each side, angled down and out.
  const twigs = [0.34, 0.58].map((share, i) => {
    const at = trunk[pointAt(run, total * share)];
    const side = i % 2 === 0 ? -1 : 1;
    const length = drop * (0.12 + 0.08 * hash(seed, i, 2));
    const angle = (0.45 + 0.35 * hash(seed, i, 3)) * side;
    const end: Point = [at[0] + Math.sin(angle) * length, at[1] + Math.cos(angle) * length];
    return toPath(jag(at, end, { seed, salt: 10 + i, cap: length * 0.18, rough: 0.26, minSeg: 6 }));
  });

  return { width, height, trunk: toPath(trunk), twigs };
}
