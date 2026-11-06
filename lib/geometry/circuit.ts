/**
 * The About section's circuit board, as pure geometry: from the measured layout (the lines of text, the
 * blocks, the section's sentence) to everything drawn on the board — the bolt that strikes J1, the live
 * trace routed past every block to J2 (with its features), and the faint mesh around the text. No DOM:
 * the About's Circuit component measures, calls planBoard, and draws.
 *
 * - The trace is routed on an 8px lattice, straight or at 45°, turning 45° at a time (PCB corners), never
 *   nearer than ROOM to a line of text.
 * - On a notebook it is worked like a board's: a step over a ring on the longest horizontal run, a
 *   differential pair on the longest diagonal, a change of layer (dashed, under the board) on the longest
 *   vertical. On a phone it weaves from edge to edge through loose waypoints, with short spurs off it.
 * - Everything is seeded: a given layout always gets the same board.
 */

import { hash, jag, lengths, pointAt, toPath, type Point } from "./lightning";

/** A box relative to the board's top-left corner, px. */
export interface Rect {
  x: number;
  y: number;
  r: number;
  b: number;
}

export interface BlockInput {
  /** The block's own box, and its title's line boxes (the label with its ref). */
  box: Rect;
  title: Rect[];
  /** Top of its first line of text and foot of its last. */
  top: number;
  bottom: number;
}

export interface BoardInput {
  width: number;
  height: number;
  /** Every line box of the blocks' text: what nothing may draw over. */
  text: Rect[];
  /** The line boxes of the section's sentence (above the board: negative y). */
  sentence: Rect[];
  blocks: BlockInput[];
  /** Designators for the mesh's silkscreen (R4, C12…). */
  silk: string[];
}

/**
 * Something on the board that charges as the energy passes `L` (px along the trace):
 * - rod: J1, the lightning rod; pad: a block's pad (it lights block `block`); ground: J2;
 * - via: a corner's via (`big`: one of the layer change's); ring: the ring under the step;
 * - spur: a dead end off the trace (phones), from its junction `pts[0]` to its via.
 */
export interface Mark {
  kind: "rod" | "pad" | "ground" | "via" | "ring" | "spur";
  at: Point;
  L: number;
  block?: number;
  big?: boolean;
  pts?: Point[];
}

export interface Bolt {
  trunk: string;
  points: Point[];
  /** Each branch as its base and its tip; `at`: when it starts growing, as a share of the fall. */
  branches: { d: string; at: number; tip: boolean }[];
}

export interface Board {
  mobile: boolean;
  /** The live trace from J1 to J2, its path and length. */
  points: Point[];
  d: string;
  len: number;
  marks: Mark[];
  /** The pair's second line, lit from La to Lb along the trace. */
  pair: { d: string; La: number; Lb: number } | null;
  /** The stretch under the board, from A down to B, lit from La to Lb. */
  layer: { A: Point; B: Point; La: number; Lb: number } | null;
  bolt: Bolt;
  /** Where the bolt starts (its top) and the lowest it reaches, board px. */
  boltTop: number;
  boltBottom: number;
  /** J1's label: under it when the trace leaves sideways, beside it when it goes down. */
  rodLabel: "below" | "beside";
  mesh: { d: string; vias: Point[]; labels: { x: number; y: number; t: string }[] };
  /** Closest approach of the trace and its features to the text, px (for checking). */
  clearance: number;
  /** For headAt: depth of the reading line → length along the trace. */
  K: number[];
  L: number[];
}

/** Up to this board width, the phone layout (one column, the trace weaving edge to edge): the board's
    widest in that layout, --container-narrow (AboutBoard.module.css). */
export const PHONE_BOARD = 760;

const SEED = 47;
const GRID = 8;
/** Breathing room between any line of text and the trace, px. */
const ROOM = { desk: 18, phone: 12 };

const between = (lo: number, hi: number, t: number) => lo + (hi - lo) * t;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const rotate = ([x, y]: Point, a: number): Point => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const unit = ([x, y]: Point): Point => {
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
};
const toward = (a: Point, b: Point): Point => unit([b[0] - a[0], b[1] - a[1]]);

/** Seeded random sequence in [0, 1). */
function mulberry(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------------- the bolt */

/** Fine breaks along every stretch of a polyline. */
function serrate(corners: Point[], salt: number, cap: number): Point[] {
  const out: Point[] = [corners[0]];
  for (let i = 1; i < corners.length; i++) {
    out.push(...jag(corners[i - 1], corners[i], { seed: SEED, salt: salt * 977 + i, cap, rough: 0.26, minSeg: 3 }).slice(1));
  }
  return out;
}

/** The main channel, a to b: short steps, each turned off course a little; then serrated. */
function channel(a: Point, b: Point, salt: number): Point[] {
  const step = clamp(Math.hypot(b[0] - a[0], b[1] - a[1]) / 9, 9, 22);
  const corners: Point[] = [a];
  let p = a;
  for (let i = 0; i < 400 && Math.hypot(b[0] - p[0], b[1] - p[1]) > step * 1.3; i++) {
    const d = rotate(toward(p, b), (hash(SEED, 20 + salt * 2, i) - 0.5) * 1.5);
    const len = step * (0.6 + 0.8 * hash(SEED, 21 + salt * 2, i));
    p = [p[0] + d[0] * len, p[1] + d[1] * len];
    corners.push(p);
  }
  corners.push(b);
  return serrate(corners, salt, 3);
}

/** A branch: steps out from `start` along `dir`, drooping and wavering; then serrated. */
function wire(start: Point, dir: Point, length: number, droop: number, salt: number): Point[] {
  const step = clamp(length / 8, 5, 14);
  const corners: Point[] = [start];
  let p = start;
  let d = dir;
  for (let i = 0, run = 0; run < length && i < 200; i++) {
    d = unit([d[0], d[1] + droop]);
    const dd = rotate(d, (hash(SEED, salt, i, 1) - 0.5) * 1.3);
    const len = step * (0.6 + 0.8 * hash(SEED, salt, i, 2));
    p = [p[0] + dd[0] * len, p[1] + dd[1] * len];
    corners.push(p);
    run += len;
  }
  return serrate(corners, salt, 1.8);
}

/**
 * The bolt onto J1: a wandering, serrated main channel and a few wiry branches off its upper part,
 * leaving sideways and drooping, finer towards their tips (as the Hero's strike). `ok` refuses points
 * (text, off the edge): a branch stops where it would touch one. `inward`: the side most branches leave
 * to (0: alternating).
 */
function strike(from: Point, to: Point, ok: (p: Point) => boolean, inward: number): Bolt {
  const trunk = channel(from, to, 1);
  const run = lengths(trunk);
  const total = run[run.length - 1];
  const drop = to[1] - from[1];
  const branches: Bolt["branches"] = [];
  const add = (pts: Point[], at: number) => {
    let cut = pts.findIndex((p) => !ok(p));
    if (cut === -1) cut = pts.length;
    if (cut < 3) return null;
    const line = pts.slice(0, cut);
    const own = lengths(line);
    const mid = Math.max(1, pointAt(own, own[own.length - 1] * 0.55));
    branches.push({ d: toPath(line.slice(0, mid + 1)), at, tip: false });
    branches.push({ d: toPath(line.slice(mid)), at: at + 0.12, tip: true });
    return line;
  };
  let side = inward || 1;
  [0.14, 0.36, 0.58].forEach((share, k) => {
    const i = Math.min(trunk.length - 2, Math.max(1, pointAt(run, total * share)));
    const heading = toward(trunk[Math.max(0, i - 4)], trunk[Math.min(trunk.length - 1, i + 4)]);
    const s = inward === 0 ? side : k === 1 ? -inward : inward;
    const angle = Math.sign(s) * between(0.9, 1.25, hash(SEED, 12, k));
    const length = drop * between(0.45, 0.7, hash(SEED, 13, k)) * (1 - 0.35 * share);
    const line = add(wire(trunk[i], rotate(heading, angle), length, 0.05, 100 + k), share);
    side = -side;
    if (line && hash(SEED, 14, k) < 0.7) {
      const own = lengths(line);
      const j = Math.min(line.length - 2, Math.max(1, pointAt(own, own[own.length - 1] * 0.45)));
      const h2 = toward(line[Math.max(0, j - 2)], line[Math.min(line.length - 1, j + 2)]);
      add(wire(line[j], rotate(h2, (hash(SEED, 15, k) < 0.5 ? -1 : 1) * 0.6), drop * 0.22, 0.06, 300 + k), share + 0.1);
    }
  });
  return { trunk: toPath(trunk), points: trunk, branches };
}

/* ---------------------------------------------------------------- against the text */

const inside = (p: Point, r: Rect, pad: number) => p[0] > r.x - pad && p[0] < r.r + pad && p[1] > r.y - pad && p[1] < r.b + pad;

/** Closest approach of any of the polylines to any of the rects, px (sampled every 2px). */
function closest(polys: Point[][], rects: Rect[]): number {
  let best = Infinity;
  for (const points of polys) {
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const c = points[i];
      const n = Math.ceil(Math.hypot(c[0] - a[0], c[1] - a[1]) / 2) + 1;
      for (let j = 0; j <= n; j++) {
        const x = a[0] + ((c[0] - a[0]) * j) / n;
        const y = a[1] + ((c[1] - a[1]) * j) / n;
        for (const r of rects) {
          const dx = Math.max(r.x - x, 0, x - r.r);
          const dy = Math.max(r.y - y, 0, y - r.b);
          best = Math.min(best, Math.hypot(dx, dy));
        }
      }
    }
  }
  return best;
}

/* ---------------------------------------------------------------- the router */

type Cell = [number, number];

const DIRS: Cell[] = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const dirOf = (a: Cell | Point, b: Cell | Point) => DIRS.findIndex(([x, y]) => x === Math.sign(b[0] - a[0]) && y === Math.sign(b[1] - a[1]));
const snap = ([x, y]: Point): Cell => [Math.round(x / GRID), Math.round(y / GRID)];

interface Lattice {
  cols: number;
  rows: number;
  /** Within ROOM of text: never entered. */
  blocked: Uint8Array;
  /** Near text: entered at a small cost (so the trace keeps to the middle of the free space). */
  close: Uint8Array;
  /** Taken by the trace already laid (and its band). */
  used: Uint8Array;
}

function lattice(width: number, height: number, text: Rect[], room: number): Lattice {
  const cols = Math.floor(width / GRID) + 1;
  const rows = Math.floor(height / GRID) + 1;
  const n = cols * rows;
  const blocked = new Uint8Array(n);
  const close = new Uint8Array(n);
  const paint = (arr: Uint8Array, r: Rect, pad: number) => {
    for (let y = Math.max(0, Math.ceil((r.y - pad) / GRID)); y <= Math.min(rows - 1, Math.floor((r.b + pad) / GRID)); y++) {
      for (let x = Math.max(0, Math.ceil((r.x - pad) / GRID)); x <= Math.min(cols - 1, Math.floor((r.r + pad) / GRID)); x++) {
        const dx = Math.max(r.x - x * GRID, 0, x * GRID - r.r);
        const dy = Math.max(r.y - y * GRID, 0, y * GRID - r.b);
        if (Math.hypot(dx, dy) < pad) arr[y * cols + x] = 1;
      }
    }
  };
  text.forEach((r) => {
    paint(blocked, r, room);
    paint(close, r, room + 18);
  });
  return { cols, rows, blocked, close, used: new Uint8Array(n) };
}

const free = (G: Lattice, c: number, r: number) =>
  c >= 0 && r >= 0 && c < G.cols && r < G.rows && !G.blocked[r * G.cols + c] && !G.used[r * G.cols + c];

/**
 * Cheapest octilinear path from cell a to cell b: straight or at 45°, turning 45° at a time; paying for
 * every turn, for climbing (the energy runs down the page), and for running close to text. `startDir`:
 * the way it is already heading (8: none).
 */
function astar(G: Lattice, a: Cell, b: Cell, startDir = 8): { cells: Cell[]; cost: number } | null {
  const { cols, rows, blocked, close, used } = G;
  const n = cols * rows;
  const g = new Float32Array(n * 9).fill(Infinity);
  const came = new Int32Array(n * 9).fill(-1);
  const done = new Uint8Array(n * 9);
  const goal = b[1] * cols + b[0];
  const h = (c: number, r: number) => {
    const dx = Math.abs(c - b[0]);
    const dy = Math.abs(r - b[1]);
    return Math.max(dx, dy) + 0.414 * Math.min(dx, dy);
  };
  // binary heap of [f, state]
  const heap: [number, number][] = [];
  const push = (f: number, s: number) => {
    heap.push([f, s]);
    let i = heap.length - 1;
    while (i) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  if (a[0] < 0 || a[1] < 0 || a[0] >= cols || a[1] >= rows || b[0] < 0 || b[1] < 0 || b[0] >= cols || b[1] >= rows) return null;
  const s0 = (a[1] * cols + a[0]) * 9 + startDir;
  g[s0] = 0;
  push(h(a[0], a[1]), s0);
  while (heap.length) {
    const [, s] = pop();
    if (done[s]) continue;
    done[s] = 1;
    const cell = (s / 9) | 0;
    const dir = s % 9;
    const c = cell % cols;
    const r = (cell / cols) | 0;
    if (cell === goal) {
      const path: Cell[] = [];
      for (let t = s; t !== -1; t = came[t]) {
        const k = (t / 9) | 0;
        path.push([k % cols, (k / cols) | 0]);
      }
      return { cells: path.reverse(), cost: g[s] };
    }
    for (let nd = 0; nd < 8; nd++) {
      if (dir !== 8) {
        const diff = (nd - dir + 8) % 8;
        if (diff !== 0 && diff !== 1 && diff !== 7) continue;
      }
      const [dx, dy] = DIRS[nd];
      const nc = c + dx;
      const nr = r + dy;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      const next = nr * cols + nc;
      if (next !== goal && (blocked[next] || used[next])) continue;
      if (dx && dy && (blocked[r * cols + nc] || blocked[nr * cols + c])) continue;
      const cost = (dx && dy ? 1.414 : 1) * (dy < 0 ? 4 : 1) + (dir !== 8 && nd !== dir ? 3 : 0) + (close[next] ? 0.8 : 0);
      const ns = next * 9 + nd;
      const ng = g[s] + cost;
      if (ng < g[ns]) {
        g[ns] = ng;
        came[ns] = s;
        push(ng + h(nc, nr), ns);
      }
    }
  }
  return null;
}

/** Lattice cells → corners in px; then the two ends moved onto the exact points A and B, along the
    neighbouring run, so every angle stays 0/45/90°. */
function corners(cells: Cell[], A: Point, B: Point): Point[] {
  const kept: Cell[] = [cells[0]];
  for (let i = 1; i < cells.length - 1; i++) {
    const a = cells[i - 1];
    const b = cells[i];
    const c = cells[i + 1];
    if (b[0] - a[0] !== c[0] - b[0] || b[1] - a[1] !== c[1] - b[1]) kept.push(b);
  }
  kept.push(cells[cells.length - 1]);
  const px: Point[] = kept.map(([c, r]) => [c * GRID, r * GRID]);
  const sgn = (u: Point, v: Point): Point => [Math.sign(v[0] - u[0]), Math.sign(v[1] - u[1])];
  const cross = (u: Point, v: Point) => u[0] * v[1] - u[1] * v[0];
  const pin = (end: number, q: number, prev: number, target: Point) => {
    const d = sgn(px[q], px[end]);
    const p = sgn(px[prev], px[q]);
    const k = cross(p, d);
    if (k) {
      const t = cross([target[0] - px[q][0], target[1] - px[q][1]], d) / k;
      px[q] = [px[q][0] + t * p[0], px[q][1] + t * p[1]];
    }
    px[end] = target;
  };
  if (px.length >= 4) {
    pin(px.length - 1, px.length - 2, px.length - 3, B);
    pin(0, 1, 2, A);
  } else if (px.length === 3) {
    pin(2, 1, 0, B);
    px[0] = A;
  } else return [A, B];
  return px;
}

/** Takes the cells (and their neighbours) for the trace, its `keepEnds` cells at each end aside. */
function reserve(G: Lattice, cells: Cell[], keepEnds = 2) {
  for (let i = keepEnds; i < cells.length - keepEnds; i++) {
    const [c, r] = cells[i];
    for (let y = r - 1; y <= r + 1; y++) {
      for (let x = c - 1; x <= c + 1; x++) {
        if (x >= 0 && y >= 0 && x < G.cols && y < G.rows) G.used[y * G.cols + x] = 1;
      }
    }
  }
}

/* ---------------------------------------------------------------- the trace */

interface Plan {
  kind: Mark["kind"];
  /** Index of its point on the trace (rod, pad, ground, via). */
  i?: number;
  L?: number;
  at?: Point;
  block?: number;
  big?: boolean;
  pts?: Point[];
}

/** Cumulative length L and the reading-line depth K at every point of the trace. */
function measure(points: Point[]) {
  const L = [0];
  const K = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    L.push(L[i - 1] + Math.hypot(dx, dy));
    // horizontal runs take a little scrolling too, so the head never jumps across them
    K.push(K[i - 1] + Math.max(Math.abs(dy), 0.35 * Math.abs(dx)));
  }
  const y0 = points[0][1];
  const yN = Math.max(...points.map((q) => q[1]));
  const kN = K[K.length - 1] || 1;
  return { L, K: K.map((k) => y0 + (k * (yN - y0)) / kN) };
}

/** How far along the trace the energy is when the reading line is `depth` px below the board's top. */
export function headAt(board: Board, depth: number): number {
  const { K, L } = board;
  if (depth <= K[0]) return 0;
  for (let i = 1; i < K.length; i++) {
    if (depth < K[i]) {
      const span = K[i] - K[i - 1];
      return span < 1e-6 ? L[i] : L[i - 1] + ((depth - K[i - 1]) / span) * (L[i] - L[i - 1]);
    }
  }
  return board.len;
}

/** A via on every real bend of the trace (not where a mark already is). */
function addVias(points: Point[], marks: Plan[]) {
  const taken = new Set(marks.filter((m) => m.i !== undefined).map((m) => m.i));
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1];
    const b = points[i];
    const c = points[i + 1];
    const cross = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
    if (Math.abs(cross) > 1 && !taken.has(i) && Math.hypot(b[0] - a[0], b[1] - a[1]) > 6 && Math.hypot(c[0] - b[0], c[1] - b[1]) > 6) {
      marks.push({ kind: "via", i });
    }
  }
}

/**
 * A notebook's trace, worked like a board's — one feature per kind of run, each only where it clears the text:
 * - the longest horizontal run makes a step: up at 45°, across, down at 45°, away from the text, over a
 *   ring sitting where the run would have gone;
 * - the longest diagonal becomes a differential pair: the trace opens into two lines at 45°, runs as two,
 *   and closes again;
 * - the longest vertical run changes layer: a via, the trace dashed underneath the board, a via back.
 */
function enrich(points: Point[], marks: Plan[], text: Rect[], room: number) {
  const p = points;
  const segs = p.slice(0, -1).map((a, i) => {
    const dx = p[i + 1][0] - a[0];
    const dy = p[i + 1][1] - a[1];
    // a pad fitted onto a run may tilt it by a pixel: still a straight run
    const kind = Math.abs(dy) < 2.5 ? "h" : Math.abs(dx) < 2.5 ? "v" : Math.abs(Math.abs(dx) - Math.abs(dy)) < 2.5 ? "d" : "";
    return { i, len: Math.hypot(dx, dy), kind };
  });
  const longest = (kind: string, min: number) => segs.filter((s) => s.kind === kind && s.len >= min).sort((a, b) => b.len - a.len);
  const insert: Record<number, Point[]> = {};
  let step: { seg: number; ring: Point } | null = null;
  let pair: { seg: number; pts: Point[] } | null = null;
  let layer: { seg: number; A: Point; B: Point } | null = null;

  for (const s of longest("h", 150)) {
    const a0 = p[s.i];
    const b0 = p[s.i + 1];
    const dir = Math.sign(b0[0] - a0[0]);
    const y = a0[1];
    const rise = 15;
    const flat = 34;
    const mid = a0[0] + dir * s.len * 0.5;
    for (const side of [-1, 1]) {
      const pts: Point[] = [
        [mid - dir * (flat / 2 + rise), y],
        [mid - dir * (flat / 2), y + side * rise],
        [mid + dir * (flat / 2), y + side * rise],
        [mid + dir * (flat / 2 + rise), y],
      ];
      if (closest([[a0, ...pts, b0]], text) >= room) {
        insert[s.i] = pts;
        step = { seg: s.i, ring: [mid, y] };
        break;
      }
    }
    if (step) break;
  }

  for (const s of longest("d", 120)) {
    if (insert[s.i]) continue;
    const a0 = p[s.i];
    const b0 = p[s.i + 1];
    const u: Point = [(b0[0] - a0[0]) / s.len, (b0[1] - a0[1]) / s.len];
    const n: Point = [-u[1], u[0]];
    const o = 5;
    const lerp = (t: number): Point => [a0[0] + (b0[0] - a0[0]) * t, a0[1] + (b0[1] - a0[1]) * t];
    const A = lerp(0.12);
    const B = lerp(0.88);
    const line = (k: number): Point[] => [
      A,
      [A[0] + (u[0] + k * n[0]) * o, A[1] + (u[1] + k * n[1]) * o],
      [B[0] + (k * n[0] - u[0]) * o, B[1] + (k * n[1] - u[1]) * o],
      B,
    ];
    const one = line(1);
    const two = line(-1);
    if (closest([one, two], text) >= room) {
      insert[s.i] = one;
      pair = { seg: s.i, pts: two };
      break;
    }
  }

  for (const s of longest("v", 110)) {
    if (insert[s.i]) continue;
    const a0 = p[s.i];
    const dy = p[s.i + 1][1] - a0[1];
    const A: Point = [a0[0], a0[1] + dy * 0.26];
    const B: Point = [a0[0], a0[1] + dy * 0.74];
    if (Math.abs(B[1] - A[1]) < 50) continue;
    insert[s.i] = [A, B];
    layer = { seg: s.i, A, B };
    break;
  }

  const out: Point[] = [];
  const map: number[] = [];
  p.forEach((q, i) => {
    map[i] = out.length;
    out.push(q);
    if (insert[i]) out.push(...insert[i]);
  });
  marks.forEach((m) => {
    if (m.i !== undefined) m.i = map[m.i];
  });
  return {
    points: out,
    // the step's flat runs from its second point to its third
    step: step ? { flat: map[step.seg] + 2, ring: step.ring } : null,
    pair: pair ? { from: map[pair.seg] + 1, to: map[pair.seg] + 4, pts: pair.pts } : null,
    layer: layer ? { from: map[layer.seg] + 1, to: map[layer.seg] + 2, A: layer.A, B: layer.B } : null,
  };
}

/**
 * Spurs (phones): short dead ends off the trace, as on a real board. Off a straight run, at 45° or 90° to
 * it, two to four steps, sometimes bending once; only through free lattice (never near text, never
 * touching the trace or another spur). Each ends on a small via.
 */
function spurs(G: Lattice, points: Point[], L: number[], rnd: () => number, chance: number): Plan[] {
  // the trace itself is taken
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4) + 1;
    const cells: Cell[] = [];
    for (let j = 0; j <= n; j++) cells.push(snap([a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n]));
    reserve(G, cells, 0);
  }
  const out: Plan[] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 56 || rnd() > chance) continue;
    const t = 0.3 + 0.4 * rnd();
    const c0 = snap([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    const p0: Point = [c0[0] * GRID, c0[1] * GRID];
    // the junction must sit on the run
    if (Math.abs((b[0] - a[0]) * (p0[1] - a[1]) - (b[1] - a[1]) * (p0[0] - a[0])) / len > 1) continue;
    const runDir = dirOf(a, b);
    if (runDir < 0) continue;
    const side = rnd() < 0.5 ? 1 : -1;
    let d = (runDir + side * (rnd() < 0.55 ? 2 : 1) + 8) % 8;
    const steps = 2 + Math.floor(rnd() * 3);
    const cells: Cell[] = [c0];
    let [c, r] = c0;
    for (let s = 0; s < steps; s++) {
      if (s === 2 && rnd() < 0.5) d = (d + (rnd() < 0.5 ? 1 : 7)) % 8;
      const nc = c + DIRS[d][0];
      const nr = r + DIRS[d][1];
      const ok = s === 0 ? nc >= 0 && nr >= 0 && nc < G.cols && nr < G.rows && !G.blocked[nr * G.cols + nc] : free(G, nc, nr);
      if (!ok) break;
      c = nc;
      r = nr;
      cells.push([c, r]);
    }
    if (cells.length < 3) continue;
    // the second step on must also clear the trace's own band
    if (cells.slice(2).some(([x, y]) => G.used[y * G.cols + x])) continue;
    reserve(G, cells, 1);
    out.push({ kind: "spur", L: L[i - 1] + Math.hypot(p0[0] - a[0], p0[1] - a[1]), pts: cells.map(([x, y]) => [x * GRID, y * GRID]) });
  }
  return out;
}

/* ---------------------------------------------------------------- the mesh */

/**
 * The faint board around the text: short traces on a 16px grid, straight or at 45°, kept off every line
 * of text, the live trace and its features, and the bolt; vias at their ends; a few designators in mono,
 * only where they touch no text.
 */
function mesh(input: BoardInput, mobile: boolean, keepOff: Point[][], bolt: Point[], labelsAt: Point[]): Board["mesh"] {
  const P = 16;
  const { width, height, text } = input;
  const cols = Math.ceil(width / P) + 1;
  const rows = Math.ceil(height / P) + 1;
  const used = new Uint8Array(cols * rows);
  const at = (c: number, r: number) => r * cols + c;
  const block = (x0: number, y0: number, x1: number, y1: number) => {
    for (let r = Math.max(0, Math.floor(y0 / P)); r <= Math.min(rows - 1, Math.ceil(y1 / P)); r++) {
      for (let c = Math.max(0, Math.floor(x0 / P)); c <= Math.min(cols - 1, Math.ceil(x1 / P)); c++) used[at(c, r)] = 1;
    }
  };
  const padX = mobile ? 10 : 12;
  const padY = mobile ? 6 : 8;
  text.forEach((t) => block(t.x - padX, t.y - padY, t.r + padX, t.b + padY));
  const along = (pts: Point[], pad: number) => {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4) + 1;
      for (let j = 0; j <= n; j++) {
        const x = a[0] + ((b[0] - a[0]) * j) / n;
        const y = a[1] + ((b[1] - a[1]) * j) / n;
        block(x - pad, y - pad, x + pad, y + pad);
      }
    }
  };
  keepOff.forEach((pts, i) => along(pts, i === 0 ? (mobile ? 10 : 14) : 10));
  along(bolt, 14);
  labelsAt.forEach(([x, y]) => block(x - 14, y - 14, x + 36, y + 14));

  const rnd = mulberry(mobile ? 23 : 11);
  let d = "";
  const vias: Cell[] = [];
  const tries = Math.floor((cols * rows) / (mobile ? 2.5 : 4));
  for (let t = 0; t < tries; t++) {
    let c = Math.floor(rnd() * cols);
    let r = Math.floor(rnd() * rows);
    if (used[at(c, r)]) continue;
    let di = Math.floor(rnd() * 4) * 2;
    let since = 0;
    const pts: Cell[] = [[c, r]];
    used[at(c, r)] = 1;
    const max = (mobile ? 3 : 5) + Math.floor(rnd() * (mobile ? 12 : 22));
    for (let s = 0; s < max; s++) {
      since++;
      if (since > 2 && rnd() < 0.18) {
        di = (di + (rnd() < 0.5 ? 1 : 7)) % 8;
        since = 0;
      }
      const nc = c + DIRS[di][0];
      const nr = r + DIRS[di][1];
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows || used[at(nc, nr)]) break;
      if (DIRS[di][0] && DIRS[di][1] && used[at(c + DIRS[di][0], r)] && used[at(c, r + DIRS[di][1])]) break;
      c = nc;
      r = nr;
      used[at(c, r)] = 1;
      pts.push([c, r]);
    }
    if (pts.length < 3) continue;
    const simple: Cell[] = [pts[0]];
    for (let k = 1; k < pts.length - 1; k++) {
      const a = pts[k - 1];
      const b = pts[k];
      const e = pts[k + 1];
      if (b[0] - a[0] !== e[0] - b[0] || b[1] - a[1] !== e[1] - b[1]) simple.push(b);
    }
    simple.push(pts[pts.length - 1]);
    d += "M" + simple.map(([x, y]) => `${x * P} ${y * P}`).join("L");
    vias.push(pts[pts.length - 1]);
    if (rnd() < 0.5) vias.push(pts[0]);
  }
  const labels: Board["mesh"]["labels"] = [];
  const names = input.silk;
  for (let i = 0, guard = 0; labels.length < (mobile ? 5 : names.length) && i < names.length && vias.length && guard < 200; guard++) {
    const v = vias[Math.floor(rnd() * vias.length)];
    const x = v[0] * P + 6;
    const y = v[1] * P - 6;
    const box = { x: x - 2, y: y - 10, r: x + 26, b: y + 3 };
    if (box.r > width - 4 || box.x < 4) continue;
    if (text.some((t) => box.x < t.r + 6 && box.r > t.x - 6 && box.y < t.b + 6 && box.b > t.y - 6)) continue;
    labels.push({ x, y, t: names[i++] });
  }
  return { d, vias: vias.map(([x, y]) => [x * P, y * P]), labels };
}

/* ---------------------------------------------------------------- the board */

/**
 * The whole board, from the measured layout.
 * - J1 sits at the top left of the board; the bolt comes down beside the sentence's last line onto it
 *   (below the sentence on a phone, where it fills the width).
 * - Each block has a pad by its title: on a notebook either just left of the title or just after it,
 *   whichever makes the cleaner way on (judged with the next leg too); on a phone left and right in turn.
 * - On a phone the trace is sent through a few loose waypoints — a jog in each side run, two staggered
 *   points across each gap — so every crossing breaks differently.
 */
export function planBoard(input: BoardInput): Board | null {
  const { width: W, height: H, text, blocks } = input;
  if (!W || !H || !blocks.length) return null;
  const mobile = W <= PHONE_BOARD;
  const room = mobile ? ROOM.phone : ROOM.desk;
  const rnd = mulberry(mobile ? 91 : 37);

  const items = blocks.map((block, i) => {
    const t = block.title[0] ?? { x: block.box.x, y: block.box.y, r: block.box.x, b: block.box.y + 18 };
    const ty = (t.y + t.b) / 2;
    const tx = Math.min(...block.title.map((r) => r.x), t.x);
    const tr = Math.max(...block.title.map((r) => r.r), t.r);
    const pads: Point[] = mobile ? [i % 2 ? [block.box.r + 22, ty] : [block.box.x - 22, ty]] : [[tx - 24, ty], [tr + 24, ty]];
    return { ...block, pads };
  });

  const G = lattice(W, H, text, room);
  const points: Point[] = [];
  const marks: Plan[] = [];
  const mark = (m: Plan) => marks.push({ ...m, i: points.length - 1 });

  const j1: Point = mobile ? [24, 32] : [items[0].pads[0][0], 34];
  points.push(j1);
  mark({ kind: "rod" });
  let at = j1;
  let dir = 8;

  const onwards = (t: Point, next: Point[] | undefined) => {
    if (!next) return 0;
    let best = Infinity;
    for (const n of next) {
      const f = astar(G, snap(t), snap(n));
      if (f) best = Math.min(best, f.cost);
    }
    return best === Infinity ? 1e6 : best;
  };
  const go = (cells: Cell[], from: Point, to: Point) => {
    reserve(G, cells);
    points.push(...corners(cells, from, to).slice(1));
    const n = cells.length;
    dir = n > 1 ? dirOf(cells[n - 2], cells[n - 1]) : 8;
    at = to;
  };
  /** A loose waypoint: passed through, not marked; skipped if the router can't reach it cleanly. */
  const pass = (pt: Point) => {
    const c = snap(pt);
    if (!free(G, c[0], c[1])) return;
    const found = astar(G, snap(at), c, dir);
    if (!found || found.cells.length < 3) return;
    go(found.cells, at, [c[0] * GRID, c[1] * GRID]);
  };
  const leg = (targets: Point[], next?: Point[]) => {
    let best: { cells: Cell[]; t: Point; total: number } | null = null;
    for (const t of targets) {
      const found = astar(G, snap(at), snap(t), dir);
      if (!found) continue;
      const total = found.cost + onwards(t, next);
      if (!best || total < best.total) best = { cells: found.cells, t, total };
    }
    if (best) go(best.cells, at, best.t);
    else {
      // no clean way (should not happen): straight to the pad
      points.push(targets[0]);
      at = targets[0];
    }
    dir = 8; // a pad is a junction: the way on may leave in any direction
  };

  const last = items[items.length - 1];
  const j2: Point = mobile ? [items.length % 2 ? 24 : W - 24, last.box.b + 44] : [last.box.x - 24, last.box.b + 44];
  items.forEach((it, i) => {
    if (mobile && i > 0) {
      const prev = items[i - 1];
      const fromLeft = i % 2 === 1;
      // a jog off the side run, somewhere down it
      if (prev.bottom - prev.pads[0][1] > 70) pass([fromLeft ? 8 : W - 8, between(prev.pads[0][1] + 24, prev.bottom - 24, rnd())]);
      // across the gap: two staggered points at different heights
      const top = prev.bottom + room + 8;
      const bottom = it.top - room - 8;
      if (bottom - top > 16) {
        const y1 = between(top, top + (bottom - top) * 0.6, rnd());
        const y2 = between(y1, bottom, rnd());
        const xa = between(0.22, 0.42, rnd()) * W;
        const xb = between(0.56, 0.8, rnd()) * W;
        pass([fromLeft ? xa : W - xa, y1]);
        pass([fromLeft ? xb : W - xb, y2]);
      }
    }
    leg(it.pads, items[i + 1]?.pads ?? [j2]);
    mark({ kind: "pad", block: i });
  });
  if (mobile && last.bottom - last.pads[0][1] > 70) pass([items.length % 2 ? 8 : W - 8, between(last.pads[0][1] + 24, last.bottom - 24, rnd())]);
  leg([j2]);
  mark({ kind: "ground" });
  addVias(points, marks);

  // the notebook's features (they add points: marks are re-indexed)
  let route = points;
  let step: { flat: number; ring: Point } | null = null;
  let pairPlan: { from: number; to: number; pts: Point[] } | null = null;
  let layerPlan: { from: number; to: number; A: Point; B: Point } | null = null;
  if (!mobile) {
    const worked = enrich(points, marks, text, room);
    route = worked.points;
    step = worked.step;
    pairPlan = worked.pair;
    layerPlan = worked.layer;
    if (layerPlan) marks.push({ kind: "via", i: layerPlan.from, big: true }, { kind: "via", i: layerPlan.to, big: true });
  }
  const { L, K } = measure(route);
  const len = L[L.length - 1];
  if (step) marks.push({ kind: "ring", at: step.ring, L: (L[step.flat] + L[step.flat + 1]) / 2 });
  const stubs = mobile ? spurs(G, route, L, rnd, 0.7) : [];
  marks.push(...stubs);

  const pair = pairPlan ? { d: toPath(pairPlan.pts), La: L[pairPlan.from], Lb: L[pairPlan.to] } : null;
  const layer = layerPlan ? { A: layerPlan.A, B: layerPlan.B, La: L[layerPlan.from], Lb: L[layerPlan.to] } : null;

  // the bolt: beside the sentence's last line on a notebook; below the sentence on a phone
  const said = input.sentence;
  const lastLine = said.length ? said.reduce((a, b) => (b.y > a.y ? b : a)) : null;
  const from: Point = lastLine ? (mobile ? [j1[0] + 8, lastLine.b + 10] : [j1[0] + 6, lastLine.y + 6]) : [j1[0] + 6, j1[1] - 120];
  const ok = (p: Point) =>
    p[0] > (mobile ? -12 : -60) && p[0] < W + (mobile ? 12 : 60) && !said.some((r) => inside(p, r, 8)) && !text.some((r) => inside(p, r, 8));
  const bolt = strike(from, [j1[0], j1[1] - 9], ok, mobile ? 1 : 0);

  const extras: Point[][] = [...stubs.map((s) => s.pts!), ...(pairPlan ? [pairPlan.pts] : [])];
  const groundAt = route[marks.find((m) => m.kind === "ground")!.i!];
  const next = route[1] ?? [j1[0], j1[1] + 1];

  return {
    mobile,
    points: route,
    d: toPath(route),
    len,
    marks: marks.map((m) => ({
      kind: m.kind,
      at: m.at ?? (m.pts ? m.pts[0] : route[m.i!]),
      L: m.L ?? L[m.i!],
      block: m.block,
      big: m.big,
      pts: m.pts,
    })),
    pair,
    layer,
    bolt,
    boltTop: from[1],
    boltBottom: Math.max(j1[1] + 12, ...bolt.points.map((q) => q[1])),
    rodLabel: Math.abs(next[0] - j1[0]) > Math.abs(next[1] - j1[1]) ? "below" : "beside",
    mesh: mesh(input, mobile, [route, ...extras], bolt.points, [j1, groundAt]),
    clearance: closest([route, ...extras], text),
    K,
    L,
  };
}
