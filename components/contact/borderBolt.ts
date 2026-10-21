/**
 * Geometry of the spark that circles the contact dialog (BorderSpark): its border as one closed line of
 * lightning. The rounded rectangle on the border's centre line, clockwise from the top-left corner, every
 * straight side broken by the same fractal as the bolts and the corners' arcs jittered a little, so it
 * crackles within a couple of px of the border. Pure function, seeded: the same box gives the same line.
 */

import { hash, jag, lengths, toPath, type Point } from "@/lib/geometry/lightning";

interface BorderInput {
  width: number;
  height: number;
  /** Corner radii, px, clockwise from the top left (the phone sheet rounds only the top two). */
  radii: [number, number, number, number];
  seed: number;
}

/** How far the line strays from the border, px: only the spark's stretch is ever drawn, so it can zigzag
   like a small bolt and still read as riding the border. */
const CAP = 2.4;
/** A side is broken in stretches of about this length, px, each one its own fractal: jag's breaks shrink
   at every level, so one break across a whole 900px side would leave the fine scale nearly straight. */
const STRETCH = 24;
/** Shortest straight stretch, px: the fine serration. */
const MIN_SEG = 5;
/** The border is 1px: its centre line. */
const INSET = 0.5;

/** Points on a corner's arc, from angle a0 to a1 (radians, y down), its ends excluded. */
function corner(cx: number, cy: number, r: number, a0: number, a1: number, seed: number, salt: number): Point[] {
  const steps = Math.max(2, Math.ceil(r / 3));
  const out: Point[] = [];
  for (let s = 1; s < steps; s++) {
    const a = a0 + ((a1 - a0) * s) / steps;
    const rr = r + (2 * hash(seed, salt, s) - 1) * CAP * 0.6;
    out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return out;
}

/** A straight side, a to b included: anchors every STRETCH px nudged off the border, a fractal between each pair. */
function side(a: Point, b: Point, seed: number, s: number): Point[] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (len < 1) return [a, b];
  const n = Math.max(1, Math.round(len / STRETCH));
  const anchors: Point[] = [];
  for (let k = 0; k <= n; k++) {
    // The ends stay on the border, where the corners join.
    const off = k === 0 || k === n ? 0 : (2 * hash(seed, 20 + s, k) - 1) * CAP * 0.5;
    anchors.push([a[0] + (dx * k) / n - (dy / len) * off, a[1] + (dy * k) / n + (dx / len) * off]);
  }
  const out: Point[] = [a];
  for (let k = 0; k < n; k++) {
    const salt = 1000 * (s + 1) + k;
    out.push(...jag(anchors[k], anchors[k + 1], { seed, salt, cap: CAP, rough: 0.35, minSeg: MIN_SEG }).slice(1));
  }
  return out;
}

export function drawBorderBolt({ width, height, radii, seed }: BorderInput): { d: string; length: number } {
  const [tl, tr, br, bl] = radii.map((r) => Math.max(0, r - INSET));
  const left = INSET;
  const top = INSET;
  const right = width - INSET;
  const bottom = height - INSET;
  const q = Math.PI / 2;

  // Each side, then the corner that follows it, clockwise.
  const sides: Array<[Point, Point]> = [
    [[left + tl, top], [right - tr, top]],
    [[right, top + tr], [right, bottom - br]],
    [[right - br, bottom], [left + bl, bottom]],
    [[left, bottom - bl], [left, top + tl]],
  ];
  const corners = [
    () => corner(right - tr, top + tr, tr, -q, 0, seed, 11),
    () => corner(right - br, bottom - br, br, 0, q, seed, 12),
    () => corner(left + bl, bottom - bl, bl, q, 2 * q, seed, 13),
    () => corner(left + tl, top + tl, tl, 2 * q, 3 * q, seed, 14),
  ];

  const points: Point[] = [];
  sides.forEach(([a, b], s) => {
    points.push(...side(a, b, seed, s));
    points.push(...corners[s]());
  });
  points.push(points[0]);

  const run = lengths(points);
  return { d: `${toPath(points)}Z`, length: run[run.length - 1] };
}
