/**
 * Geometry of the arcs that jump across the gap between the Hero photo and its hairline frame
 * (PortraitArcs): a short bolt from the photo's edge to the hairline, slanting along the side so it is
 * more than the gap's width, sometimes with a small fork. In the hairline's box: the photo sits `outset`
 * px inside it, the 1px line runs on its edge. Pure function, seeded: `spot` picks where it strikes
 * (unless `place` says) and how it slants, `take` how it breaks there (a new take, same spot: the arc
 * crackles).
 */

import { hash, jag, toPath, type Point } from "@/lib/geometry/lightning";

interface GapInput {
  /** The hairline's box, px: the photo plus `outset` on every side. */
  width: number;
  height: number;
  outset: number;
  spot: number;
  take: number;
  /** Where it strikes, instead of where `spot` picks: a side (0 top, 1 right, 2 bottom, 3 left) and
     how far along it, 0–1, between the corners' margins. */
  place?: { side: 0 | 1 | 2 | 3; at: number };
}

/** Arcs keep this far from the corners, px, where the gap turns. */
const MARGIN = 12;
/** How far along the side the arc lands from where it leaves the photo, px (plus up to DRIFT_SPREAD). */
const DRIFT = 8;
const DRIFT_SPREAD = 10;
/** The hairline is 1px: its centre line. */
const INSET = 0.5;

export function drawGapArc({ width, height, outset, spot, take, place }: GapInput): string {
  const w = width - 2 * outset;
  const h = height - 2 * outset;
  const spans = [w, h, w, h].map((len) => Math.max(0, len - 2 * MARGIN));
  const total = spans.reduce((sum, len) => sum + len, 0);
  if (!total) return "";

  // A side, weighted by its length, and a point along it: top, right, bottom, left (or the given place).
  let at = hash(spot, 1) * total;
  let s = 0;
  if (place) {
    s = place.side;
    at = place.at * spans[s];
  } else {
    while (s < 3 && at > spans[s]) at -= spans[s++];
  }
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
