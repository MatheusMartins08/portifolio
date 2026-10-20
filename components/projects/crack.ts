/**
 * Geometry of the project card's lightning: the crack the second screenshot comes in through, and the
 * charged rule under the card. Same fractal as the bolts; computed once at module load and seeded, so
 * server and client draw the same lines.
 */

import { jag, toPath } from "@/lib/geometry/lightning";

/** Where the polygon's left side sits, % of the media: well clear of the crack at either end. */
const LEFT = -60;
/** Clearance past the media's edge, %, so the spark's glow is out of sight at rest. */
const CLEAR = 3;

/** The crack, top to bottom, in % of the media: leaning a little, jagged at every scale. */
const CRACK = jag([54, 0], [46, 100], { seed: 17, salt: 1, cap: 6, rough: 0.22, minSeg: 5 });
const xs = CRACK.map(([x]) => x);
const SHIFT_OFF = -(Math.max(...xs) + CLEAR);
const SHIFT_ON = 100 - Math.min(...xs) + CLEAR;

/** Everything left of the crack moved by `shift`: the same points either way, so clip-path can tween. */
function polygon(shift: number): string {
  const points = CRACK.map(([x, y]) => `${(x + shift).toFixed(2)}% ${y.toFixed(2)}%`);
  return `polygon(${LEFT}% 0%, ${points.join(", ")}, ${LEFT}% 100%)`;
}

export const crack = {
  /** clip-path of the second screenshot: hidden (crack past the left edge) and shown (past the right). */
  off: polygon(SHIFT_OFF),
  on: polygon(SHIFT_ON),
  /** The crack's lit edge, in a 0 0 100 100 box; moved by the same shifts, as translateX in %. */
  d: toPath(CRACK),
  sparkOff: `${SHIFT_OFF.toFixed(2)}%`,
  sparkOn: `${SHIFT_ON.toFixed(2)}%`,
};

/** The charged rule: a faint fractal break along a 600×6 box, stretched to the card's width. */
export const RULE_PATH = toPath(jag([0, 3], [600, 3], { seed: 29, salt: 1, cap: 1.5, rough: 0.2, minSeg: 10 }));
