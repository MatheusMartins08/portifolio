/**
 * Geometry of the Experience timeline's lightning: a bolt down the rail that crosses the exact centre of
 * every node, so it reads as the current running from one stop of the career to the next. Between two
 * stops it is a stepped leader — short runs with sharp kinks, mostly alternating sides — broken finely
 * along every run, with now and then a short twig off a kink (never many: the services bolts branch,
 * this one runs). And the twig each card's arm becomes. Same fractal primitives as the other bolts;
 * pure and seeded.
 */

import { hash, jag, lengths, pointAt, toPath, type Point } from "@/lib/geometry/lightning";

/** Rough length of one kinked run, px. */
const STEP = 38;

interface ChannelInput {
  /** Centres of the nodes, px from the top of the rail. */
  stops: number[];
  height: number;
  /** Furthest the trunk strays from the rail, px. */
  cap: number;
  /** Twigs may break off to the left too (not in the single column, where the rail hugs the edge). */
  twoSided: boolean;
  seed?: number;
}

export interface ChannelTwig {
  d: string;
  /** Drawn from share `a` of the trunk's length, over a share `b`: at the trunk's own pace. */
  a: number;
  b: number;
}

export interface Channel {
  d: string;
  length: number;
  twigs: ChannelTwig[];
  /** Share of the trunk's length drawn once its head is `y` px down: the scroll reads in y. */
  shareAt: (y: number) => number;
}

export function drawChannel({ stops, height, cap, twoSided, seed = 7 }: ChannelInput): Channel | null {
  if (height <= 0) return null;
  const rand = (salt: number, k = 0) => hash(seed, salt, k, 61);
  const inside = ([x]: Point) => Math.abs(x) <= cap;
  const anchors = [0, ...stops.filter((y) => y > 1 && y < height - 1).sort((a, b) => a - b), height];

  const points: Point[] = [[0, 0]];
  const forks: Array<{ at: Point; index: number; gap: number }> = [];
  let side = rand(1) < 0.5 ? -1 : 1;
  for (let s = 1; s < anchors.length; s++) {
    const ya = anchors[s - 1];
    const span = anchors[s] - ya;
    if (span < 12) {
      points.push([0, anchors[s]]);
      continue;
    }
    // The kinks between two stops; the stops themselves sit on the rail.
    const steps = Math.max(2, Math.round(span / STEP));
    const course: Point[] = [[0, ya]];
    for (let k = 1; k < steps; k++) {
      if (rand(10 + s, k) < 0.8) side = -side;
      const y = ya + span * ((k + (rand(20 + s, k) - 0.5) * 0.5) / steps);
      course.push([side * cap * (0.4 + 0.6 * rand(30 + s, k)), y]);
    }
    course.push([0, anchors[s]]);
    for (let k = 1; k < course.length; k++) {
      points.push(...jag(course[k - 1], course[k], { seed, salt: 100 + s * 16 + k, cap: cap * 0.3, rough: 0.22, minSeg: 4, accept: inside }).slice(1));
      if (k < course.length - 1) forks.push({ at: course[k], index: points.length - 1, gap: s });
    }
  }
  const run = lengths(points);
  const length = run[run.length - 1];

  // ---- a few short twigs: at most one per gap between stops, about every other gap, off a kink, outward ----
  const twigs: ChannelTwig[] = [];
  for (let s = 1; s < anchors.length; s++) {
    const candidates = forks.filter((f) => f.gap === s && (twoSided || f.at[0] > 0));
    if (!candidates.length || rand(200 + s) < 0.5) continue;
    const fork = candidates[Math.floor(rand(210 + s) * candidates.length)];
    const out = fork.at[0] >= 0 ? 1 : -1;
    const angle = ((30 + 25 * rand(220 + s)) * Math.PI) / 180;
    const reach = 12 + 10 * rand(230 + s);
    const end: Point = [fork.at[0] + out * Math.sin(angle) * reach, fork.at[1] + Math.cos(angle) * reach];
    const twig = jag(fork.at, end, { seed, salt: 240 + s, cap: 2.5, rough: 0.3, minSeg: 3 });
    const twigRun = lengths(twig);
    twigs.push({ d: toPath(twig), a: run[fork.index] / length, b: twigRun[twigRun.length - 1] / length });
  }

  const ys = points.map(([, y]) => y);
  const shareAt = (y: number) => {
    if (y <= 0) return 0;
    if (y >= height) return 1;
    const i = Math.max(1, pointAt(ys, y));
    const t = (y - ys[i - 1]) / Math.max(1e-6, ys[i] - ys[i - 1]);
    return (run[i - 1] + (run[i] - run[i - 1]) * Math.min(1, Math.max(0, t))) / length;
  };

  return { d: toPath(points), length, twigs, shareAt };
}

/** An arm's twig, from the node side (x = 0) out to the card (x = 30), in a 30×10 box around y = 5. */
export function drawTwig(seed: number): string {
  const rand = (salt: number) => hash(seed, salt, 0, 67);
  const flip = rand(1) < 0.5 ? -1 : 1;
  const course: Point[] = [
    [0, 5],
    [8 + 3 * rand(2), 5 + flip * (1.5 + 1.5 * rand(3))],
    [16 + 3 * rand(4), 5 - flip * (1 + 1.5 * rand(5))],
    [23 + 2 * rand(6), 5 + flip * (0.5 + 1 * rand(7))],
    [30, 5],
  ];
  const points: Point[] = [course[0]];
  for (let k = 1; k < course.length; k++) {
    points.push(...jag(course[k - 1], course[k], { seed, salt: 10 + k, cap: 1.2, rough: 0.25, minSeg: 3 }).slice(1));
  }
  return toPath(points);
}
