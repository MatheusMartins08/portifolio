/**
 * Geometry of the Hero backdrop: angular, lightning-like lines that flow across the stage and are
 * deflected around the text, so the greeting, name and phrase sit in a clear space drawn for them.
 *
 * The lines are level sets of a stream function ψ = B · s(d):
 * - B is mostly the height (lines run sideways) plus a piecewise-linear term on an irregular, randomly
 *   triangulated lattice: inside each triangle B is linear, so every line is a chain of straight
 *   segments that break at sharp angles where it crosses a triangle edge.
 * - d is the distance to the clear space (a union of chamfered octagons, one per line of text, so its
 *   offsets keep sharp corners) and s(d) goes from 0 on its edge to 1 far away, like flow around a body:
 *   no line can cross the text, and the ones passing by are pressed against it.
 * Pure function: same input, same lines (seeded), so resizing redraws the same drawing.
 */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ContourInput {
  width: number;
  height: number;
  /** Text boxes to keep clear, in stage pixels. */
  boxes: Box[];
  /** Font size of the name, in px: the whole drawing scales with it. */
  unit: number;
  seed?: number;
}

/**
 * One stretch of line, oriented from where it enters (the stage edge, usually) towards the text.
 * Every line is cut at its point closest to the text, so its two halves meet there: drawn from their
 * starts, they enter from the edges and connect near the name. Closed loops stay whole.
 */
export interface ContourLine {
  d: string;
  /** Every third level is drawn thicker. */
  thick: boolean;
  length: number;
  /** Where the stretch starts. */
  start: [number, number];
  /** Distance from its meeting point to the clear space: small for the lines that wrap the text. */
  reach: number;
  /** The two halves of one line share it. */
  pair: number;
}

/** Stable pseudo-random value in [0, 1) for integer coordinates (also seeds the About bolt). */
export function hash(seed: number, i: number, j = 0, k = 0): number {
  let h = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ Math.imul(i, 0x27d4eb2d), 0xc2b2ae35);
  h = Math.imul(h ^ Math.imul(j, 0x165667b1), 0x27d4eb2f);
  h = Math.imul(h ^ Math.imul(k, 0x9e3779b1), 0x85ebca6b);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** Irregular lattice lines around an anchor: cell sizes vary between 0.6 and 1.4 of `size`. */
function lattice(seed: number, anchor: number, from: number, to: number, size: number): number[] {
  const after = [anchor];
  for (let i = 0; after[after.length - 1] < to + size; i++) after.push(after[after.length - 1] + size * (0.6 + 0.8 * hash(seed, i, 1)));
  const before: number[] = [];
  for (let i = 0, at = anchor; at > from - size; i++) {
    at -= size * (0.6 + 0.8 * hash(seed, i, 2));
    before.unshift(at);
  }
  return [...before, ...after];
}

/** Index of the cell of `lines` that holds v. */
function cellOf(lines: number[], v: number): number {
  let lo = 0;
  let hi = lines.length - 2;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lines[mid] <= v) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Douglas–Peucker: keeps the corners, drops the points the grid adds along straight runs. */
function simplify(points: Array<[number, number]>, tolerance: number): Array<[number, number]> {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack: Array<[number, number]> = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    let worst = 0;
    let at = -1;
    for (let i = a + 1; i < b; i++) {
      const off = Math.abs((bx - ax) * (ay - points[i][1]) - (ax - points[i][0]) * (by - ay)) / len;
      if (off > worst) {
        worst = off;
        at = i;
      }
    }
    if (worst > tolerance && at > 0) {
      keep[at] = 1;
      stack.push([a, at], [at, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

export function drawContours({ width, height, boxes, unit, seed = 11 }: ContourInput): ContourLine[] {
  if (!boxes.length || width <= 0 || height <= 0) return [];

  // ---- clear space: one chamfered octagon per line of text, a little irregular, plus a bridge over
  // each gap between consecutive lines (over their common width), so no line slips in between ----
  const sorted = [...boxes].sort((a, b) => a.y - b.y);
  const bridges: Box[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const a = sorted[i - 1];
    const b = sorted[i];
    const x0 = Math.max(a.x, b.x);
    const x1 = Math.min(a.x + a.w, b.x + b.w);
    if (x1 > x0 && b.y > a.y + a.h) bridges.push({ x: x0, y: a.y + a.h / 2, w: x1 - x0, h: b.y + b.h / 2 - (a.y + a.h / 2) });
  }
  const pieces = [...sorted, ...bridges].map((b, i) => {
    const padX = unit * (0.2 + 0.08 * hash(seed, i, 3));
    const padY = unit * (0.08 + 0.05 * hash(seed, i, 4));
    const hw = b.w / 2 + padX;
    const hh = b.h / 2 + padY;
    return { cx: b.x + b.w / 2, cy: b.y + b.h / 2, hw, hh, cut: hw + hh - Math.min(hw, hh) * (0.7 + 0.25 * hash(seed, i, 5)) };
  });
  const top = Math.min(...pieces.map((p) => p.cy - p.hh));
  const bottom = Math.max(...pieces.map((p) => p.cy + p.hh));
  const left = Math.min(...pieces.map((p) => p.cx - p.hw));
  const right = Math.max(...pieces.map((p) => p.cx + p.hw));
  const xc = (left + right) / 2;
  const yc = (top + bottom) / 2;
  const radius = (bottom - top) / 2;

  const distance = (x: number, y: number) => {
    let d = Infinity;
    for (const p of pieces) {
      const dx = Math.abs(x - p.cx);
      const dy = Math.abs(y - p.cy);
      d = Math.min(d, Math.max(dx - p.hw, dy - p.hh, (dx + dy - p.cut) * Math.SQRT1_2));
    }
    return d;
  };

  // ---- lightning term: linear inside each triangle of an irregular lattice anchored on the text ----
  const spacing = Math.min(84, Math.max(48, unit * 0.6));
  /** Values in line spacings: `amp` over a cell of `size` px sets how steep the breaks are. */
  const kinks = (salt: number, size: number, amp: number) => {
    const cols = lattice(seed + salt, xc, 0, width, size);
    const rows = lattice(seed + salt + 1, yc, 0, height, size * 0.85);
    const col0 = cols.indexOf(xc);
    const row0 = rows.indexOf(yc);
    const vertex = (i: number, j: number) => amp * (2 * hash(seed + salt, i - col0, j - row0, 6) - 1);
    return (x: number, y: number) => {
      const i = cellOf(cols, x);
      const j = cellOf(rows, y);
      const u = (x - cols[i]) / (cols[i + 1] - cols[i]);
      const v = (y - rows[j]) / (rows[j + 1] - rows[j]);
      const a = vertex(i, j);
      const b = vertex(i + 1, j);
      const c = vertex(i + 1, j + 1);
      const d = vertex(i, j + 1);
      // Each cell is split along one of its diagonals, at random.
      if (hash(seed + salt, i - col0, j - row0, 7) < 0.5) return u >= v ? a + (b - a) * u + (c - b) * v : a + (c - d) * u + (d - a) * v;
      return u + v <= 1 ? a + (b - a) * u + (d - a) * v : c + (d - c) * (1 - u) + (b - c) * (1 - v);
    };
  };
  // Broad diagonal sweeps plus short sharp breaks.
  const sweep = kinks(0, Math.max(320, unit * 4.2), 2.6);
  const bolt = kinks(10, Math.max(130, unit * 1.6), 1.5);

  const field = (x: number, y: number) => {
    const d = Math.max(0, distance(x, y));
    const near = radius / (radius + d);
    return ((y - yc) / spacing + sweep(x, y) + bolt(x, y)) * (1 - near * near);
  };

  // ---- marching squares on a fine grid, chained into polylines ----
  const step = 8;
  const nx = Math.ceil(width / step) + 1;
  const ny = Math.ceil(height / step) + 1;
  const values = new Float32Array(nx * ny);
  let lo = Infinity;
  let hi = -Infinity;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const v = field(i * step, j * step);
      values[j * nx + i] = v;
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
  }

  const lines: ContourLine[] = [];
  const stretch = (points: Array<[number, number]>, thick: boolean, pair: number, reach: number) => {
    let length = 0;
    for (let i = 1; i < points.length; i++) length += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    const d = "M" + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L");
    lines.push({ d, thick, length, start: points[0], reach, pair });
  };
  for (let k = Math.floor(lo); k <= Math.ceil(hi); k++) {
    const level = k + 0.5;
    const points = new Map<number, [number, number]>();
    const links = new Map<number, number[]>();
    const link = (a: number, b: number) => {
      for (const [from, to] of [[a, b], [b, a]]) {
        const list = links.get(from);
        if (list) list.push(to);
        else links.set(from, [to]);
      }
    };
    // Edge ids: horizontal edges 2·n, vertical edges 2·n + 1 (n = index of their first vertex).
    const edge = (i: number, j: number, vertical: boolean) => {
      const id = 2 * (j * nx + i) + (vertical ? 1 : 0);
      if (!points.has(id)) {
        const a = values[j * nx + i];
        const b = vertical ? values[(j + 1) * nx + i] : values[j * nx + i + 1];
        const t = (level - a) / (b - a);
        points.set(id, vertical ? [i * step, (j + t) * step] : [(i + t) * step, j * step]);
      }
      return id;
    };
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = values[j * nx + i] > level;
        const b = values[j * nx + i + 1] > level;
        const c = values[(j + 1) * nx + i + 1] > level;
        const d = values[(j + 1) * nx + i] > level;
        const crossed: number[] = [];
        if (a !== b) crossed.push(edge(i, j, false));
        if (b !== c) crossed.push(edge(i + 1, j, true));
        if (c !== d) crossed.push(edge(i, j + 1, false));
        if (d !== a) crossed.push(edge(i, j, true));
        if (crossed.length === 2) link(crossed[0], crossed[1]);
        else if (crossed.length === 4) {
          link(crossed[0], crossed[3]);
          link(crossed[1], crossed[2]);
        }
      }
    }
    const used = new Set<number>();
    for (const start of links.keys()) {
      if (used.has(start)) continue;
      // Every point has one or two neighbours. Walk to an end of the chain first (a closed loop has none).
      let end = start;
      let previous = -1;
      for (;;) {
        const around = links.get(end)!;
        if (around.length < 2) break;
        const next = around[0] === previous ? around[1] : around[0];
        if (next === start) break;
        previous = end;
        end = next;
      }
      const chain: Array<[number, number]> = [];
      let at: number | undefined = end;
      previous = -1;
      while (at !== undefined && !used.has(at)) {
        used.add(at);
        chain.push(points.get(at)!);
        const next: number | undefined = links.get(at)!.find((n) => n !== previous && !used.has(n));
        previous = at;
        at = next;
      }
      const closed = links.get(end)!.length === 2;
      if (closed) chain.push(chain[0]);
      const line = simplify(chain, 2.2);
      let length = 0;
      for (let i = 1; i < line.length; i++) length += Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);
      if (length < unit * 0.6) continue;

      // Cut at the corner closest to the text; both halves run towards it.
      const thick = ((k % 3) + 3) % 3 === 0;
      const pair = lines.length;
      let meet = 0;
      let reach = Infinity;
      line.forEach(([x, y], i) => {
        const d = distance(x, y);
        if (d < reach) {
          reach = d;
          meet = i;
        }
      });
      reach = Math.max(0, reach);
      if (closed || meet === 0 || meet === line.length - 1) {
        stretch(meet === 0 && !closed ? [...line].reverse() : line, thick, pair, reach);
      } else {
        stretch(line.slice(0, meet + 1), thick, pair, reach);
        stretch(line.slice(meet).reverse(), thick, pair, reach);
      }
    }
  }
  return lines;
}
