/**
 * Geometry of the bolt that strikes the projects' closing line (MoreWork): the same natural bolt as the
 * scroll-drawn ones (./bolt in components/lightning), small. Computed once at module load and seeded, so
 * server and client draw the same lines.
 */

import { drawLightning } from "@/components/lightning/bolt";

/** The bolt's box, px: it sits in the padding above the closing line. */
export const STRIKE_BOX = { width: 168, height: 88 } as const;

/** Seed 22: a trunk that forks to both sides near the top, readable at this size. */
export const strike = drawLightning({ ...STRIKE_BOX, seed: 22 });

/** Where the trunk lands (its last point), for the impact flash. */
export const strikeFoot = (() => {
  const [x, y] = strike.strokes[0].d.split("L").pop()!.split(" ").map(Number);
  return { x, y };
})();
