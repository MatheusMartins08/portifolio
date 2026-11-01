/**
 * Geometry of the arcs that jump across the gap between the Hero photo and its hairline frame
 * (PortraitArcs): a short bolt from the photo's edge to the hairline, slanting along the side so it is
 * more than the gap's width, sometimes with a small fork; or, at a corner, one cutting across it. In the
 * hairline's box: the photo sits `outset` px inside it, the 1px line runs on its edge. Pure functions,
 * seeded: `spot` picks where it strikes and how it slants, `take` how it breaks there (a new take, same
 * spot: the arc crackles).
 */

import { hash, jag, toPath, type Point } from "@/lib/geometry/lightning";

interface GapInput {
  /** The hairline's box, px: the photo plus `outset` on every side. */
  width: number;
  height: number;
  outset: number;
  spot: number;
  take: number;
}

/** Arcs keep this far from the corners, px, where the gap turns. */
const MARGIN = 12;
/** How far along the side the arc lands from where it leaves the photo, px (plus up to DRIFT_SPREAD). */
const DRIFT = 8;
const DRIFT_SPREAD = 10;
/** The hairline is 1px: its centre line. */
const INSET = 0.5;

export function drawGapArc({ width, height, outset, spot, take }: GapInput): string {
  const w = width - 2 * outset;
  const h = height - 2 * outset;
  const spans = [w, h, w, h].map((len) => Math.max(0, len - 2 * MARGIN));
  const total = spans.reduce((sum, len) => sum + len, 0);
  if (!total) return "";

  // A side, weighted by its length, and a point along it: top, right, bottom, left.
  let at = hash(spot, 1) * total;
  let s = 0;
  while (s < 3 && at > spans[s]) at -= spans[s++];
  const len = s % 2 ? h : w;
  /** A point `u` px along side s from the photo's corner, `d` px in from the box's edge. */
  const point = (u: number, d: number): Point =>
    s === 0 ? [outset + u, d] : s === 1 ? [width - d, outset + u] : s === 2 ? [outset + u, height - d] : [d, outset + u];

  const sign = hash(spot, 2) < 0.5 ? -1 : 1;
  const u0 = MARGIN + at;
  const u1 = Math.min(len, Math.max(0, u0 + sign * (DRIFT + DRIFT_SPREAD * hash(spot, 3))));
  const main = jag(point(u0, outset), point(u1, INSET), { seed: take, salt: spot, cap: 2.5, rough: 0.35, minSeg: 3 });

  // Half the time, a small fork off its middle, toward the hairline, not quite reaching it.
  if (hash(spot, 4) < 0.5) return toPath(main);
  const mid = main[Math.floor(main.length / 2)];
  const uMid = s % 2 ? mid[1] - outset : mid[0] - outset;
  const fork = jag(mid, point(uMid + sign * (4 + 2 * hash(spot, 5)), outset * 0.3), { seed: take, salt: spot + 1, cap: 1.5, rough: 0.35, minSeg: 2 });
  return `${toPath(main)} ${toPath(fork)}`;
}

interface CornerInput extends GapInput {
  /** The photo's corner radius, px: the hairline follows it, grown by `outset`. */
  round: number;
  /** Which corner: 0 top left, 1 top right, 2 bottom right, 3 bottom left. */
  corner: 0 | 1 | 2 | 3;
}

/** How far past the photo's corner the corner arc leaves its edge, px (plus up to LEAVE_SPREAD). */
const LEAVE = 3;
const LEAVE_SPREAD = 6;

/**
 * An arc across the gap at a corner: it leaves the photo's edge just past its corner, on one of the two
 * sides (`spot` picks which), and lands on the hairline's rounded corner leaning to the other side, so it
 * cuts across on the slant; half the time with a small fork back along the curve, not quite reaching it.
 */
export function drawCornerArc({ width, height, outset, spot, take, round, corner }: CornerInput): string {
  if (!width || !height) return "";
  /** A point `x` px in from the corner's vertical edge of the box and `y` px in from its horizontal one. */
  const point = (x: number, y: number): Point => [corner === 1 || corner === 2 ? width - x : x, corner >= 2 ? height - y : y];
  // The hairline's corner: a quarter circle about (c, c), at 0° on the vertical side, at 90° on the horizontal one.
  const c = Math.max(INSET, round > 0 ? round + outset : 0);
  const onCurve = (deg: number): Point => {
    const a = (deg * Math.PI) / 180;
    return point(c - (c - INSET) * Math.cos(a), c - (c - INSET) * Math.sin(a));
  };

  const leave = outset + LEAVE + LEAVE_SPREAD * hash(spot, 1);
  const fromTop = hash(spot, 3) < 0.5;
  // Off the horizontal edge it lands toward the vertical side, and the other way round.
  const deg = fromTop ? 10 + 35 * hash(spot, 2) : 45 + 35 * hash(spot, 2);
  const main = jag(fromTop ? point(leave, outset) : point(outset, leave), onCurve(deg), { seed: take, salt: spot, cap: 2.5, rough: 0.35, minSeg: 3 });

  if (hash(spot, 4) < 0.5) return toPath(main);
  const mid = main[Math.floor(main.length / 2)];
  const [tx, ty] = onCurve(90 - deg);
  const fork = jag(mid, [mid[0] + 0.7 * (tx - mid[0]), mid[1] + 0.7 * (ty - mid[1])], { seed: take, salt: spot + 1, cap: 1.5, rough: 0.35, minSeg: 2 });
  return `${toPath(main)} ${toPath(fork)}`;
}
