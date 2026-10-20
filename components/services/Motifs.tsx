import { cssVars, cx } from "@/lib/cx";
import { jag, toPath, type Point } from "@/lib/geometry/lightning";
import styles from "./ServiceCard.module.css";

/**
 * The motifs speak the site's lightning language: their connections are broken lines (`zag`, the same
 * fractal as the bolts, a few px off true) and what runs along them is a charge pulse (`.pulse`), not a
 * dashed flow. Computed once at module load and seeded, so server and client draw the same lines.
 */
function zag(a: Point, b: Point, salt: number, cap = 3): string {
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return toPath(jag(a, b, { seed: 11, salt, cap: Math.min(cap, length * 0.12), rough: 0.25, minSeg: 4 }));
}

/** A connection: the broken line at rest and its charge pulse (staggered by `i`). */
function Charge({ d, i = 0 }: { d: string; i?: number }) {
  return (
    <>
      <path d={d} className={styles.zap} />
      <path d={d} pathLength={1} className={styles.pulse} style={cssVars({ "--i": i })} />
    </>
  );
}

/** Where the Web cursor starts and ends (its tip; the CSS moves it by -84, 36). */
const CURSOR_TRAIL = zag([136, 46], [52, 82], 1, 4);
const RIDGE = "M98 74l16-14 12 10 10-8 20 16";

/**
 * Web: a page wireframe that assembles itself on hover (text bars grow, CTA fills, the picture's ridge
 * draws in terracota) while the cursor travels, leaving a short electric trail.
 */
export function MotifWeb() {
  return (
    <svg viewBox="0 0 168 108" className={styles.motif} aria-hidden="true">
      <rect x={0.75} y={0.75} width={166.5} height={106.5} rx={6} className={styles.frame} />
      <line x1={0.75} y1={16} x2={167.25} y2={16} className={styles.line} />
      <circle cx={10} cy={8.5} r={2} className={styles.dot} />
      <circle cx={18} cy={8.5} r={2} className={styles.dot} />
      <rect x={120} y={5.5} width={38} height={6} rx={3} className={styles.pill} />
      <rect x={12} y={28} width={72} height={7} rx={1.5} className={cx(styles.text, styles.g1)} />
      <rect x={12} y={40} width={56} height={7} rx={1.5} className={cx(styles.text, styles.g2)} />
      <rect x={12} y={55} width={40} height={3} rx={1.5} className={cx(styles.sub, styles.g3)} />
      <rect x={12} y={62} width={48} height={3} rx={1.5} className={cx(styles.sub, styles.g4)} />
      <rect x={12} y={76} width={32} height={11} rx={2} className={styles.cta} />
      <rect x={98} y={28} width={58} height={60} rx={3} className={styles.block} />
      <path d={RIDGE} className={cx(styles.line, styles.img)} />
      <path d={RIDGE} pathLength={1} className={styles.ridge} />
      <path d={CURSOR_TRAIL} pathLength={1} className={styles.trail} />
      <path d="M136 46l6 14 3-5 5 0z" className={styles.cursor} />
    </svg>
  );
}

const NODES: Array<[number, number]> = [
  [18, 54],
  [62, 22],
  [62, 86],
  [108, 54],
  [150, 26],
  [150, 82],
];
const EDGES: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [3, 4],
  [3, 5],
];

const AI_LINKS = EDGES.map(([a, b], i) => zag(NODES[a], NODES[b], 10 + i));

/** AI: a small graph of nodes, linked by broken lines; on hover charge runs along them and the nodes light up in turn. */
export function MotifAI() {
  return (
    <svg viewBox="0 0 168 108" className={styles.motif} aria-hidden="true">
      {AI_LINKS.map((d, i) => (
        <Charge key={`link-${i}`} d={d} i={i} />
      ))}
      {NODES.map(([x, y], i) => (
        <g key={`node-${i}`} className={styles.node} style={cssVars({ "--i": i })}>
          <rect x={x - 7} y={y - 7} width={14} height={14} rx={i === 3 ? 7 : 2} />
          <circle cx={x} cy={y} r={1.8} />
        </g>
      ))}
    </svg>
  );
}

const BACKEND_LINE = zag([29.5, 48], [138.5, 48], 20);

/**
 * Backend: client → API → server → database in a row, on one broken line. On hover the blocks light up
 * from left to right and a charge runs down the line, passing behind them, into the database.
 */
export function MotifBackend() {
  return (
    <svg viewBox="0 0 168 108" className={styles.motif} aria-hidden="true">
      <Charge d={BACKEND_LINE} />

      {/* client: a small window */}
      <g style={cssVars({ "--i": 0 })}>
        <rect x={0.5} y={32} width={29} height={32} rx={3} className={styles.box} />
        <line x1={0.5} y1={39} x2={29.5} y2={39} className={styles.glyph} />
        <circle cx={5} cy={35.5} r={1} className={styles.pin} />
        <circle cx={9} cy={35.5} r={1} className={styles.pin} />
        <path d="M6 47h17M6 52h11M6 57h14" className={styles.glyph} />
      </g>
      {/* API: braces around an endpoint */}
      <g style={cssVars({ "--i": 1 })}>
        <rect x={46.5} y={32} width={29} height={32} rx={10} className={styles.box} />
        <path d="M57 40q-3 0-3 3v3q0 2-2 2q2 0 2 2v3q0 3 3 3M65 40q3 0 3 3v3q0 2 2 2q-2 0-2 2v3q0 3-3 3" className={styles.glyph} />
        <circle cx={61} cy={48} r={1.4} className={styles.pin} />
      </g>
      {/* server: a rack of three units */}
      <g style={cssVars({ "--i": 2 })}>
        <rect x={92.5} y={32} width={29} height={32} rx={3} className={styles.box} />
        <path d="M98 41h12M98 48h12M98 55h12" className={styles.glyph} />
        <circle cx={115} cy={41} r={1.2} className={styles.pin} />
        <circle cx={115} cy={48} r={1.2} className={styles.pin} />
        <circle cx={115} cy={55} r={1.2} className={styles.pin} />
      </g>
      {/* database: a cylinder */}
      <g style={cssVars({ "--i": 3 })}>
        <path d="M139 38v20a14 4 0 0 0 28 0v-20z" className={styles.box} />
        <ellipse cx={153} cy={38} rx={14} ry={4} className={styles.box} />
        <path d="M139 48a14 4 0 0 0 28 0" className={styles.glyph} />
      </g>

      {[15, 61, 107, 153].map((x, i) => (
        <rect key={x} x={x - 8} y={72} width={16} height={3} rx={1.5} className={styles.row} style={cssVars({ "--i": i })} />
      ))}
    </svg>
  );
}

/** One mini table per branch: top edge of the table, and its row lengths. */
const TABLES: Array<{ y: number; rows: number[] }> = [
  { y: 10, rows: [44, 30] },
  { y: 43, rows: [36, 48] },
  { y: 76, rows: [50, 26] },
];

/** Cylinder → table, each with a kink halfway so it reads as a branch. */
const DATA_BRANCHES = TABLES.map(({ y }, i): string => {
  const from: Point = [42, 38 + i * 16];
  const to: Point = [100, y + 11];
  const mid: Point = [71, (from[1] + to[1]) / 2 + (i - 1) * 3];
  return zag(from, mid, 30 + i * 2) + zag(mid, to, 31 + i * 2).replace(/^M/, "L");
});

/**
 * Data: a database cylinder feeding three small tables along broken branches. On hover charge runs
 * along them, the cylinder lights up and the table rows fill in, one table after the other.
 */
export function MotifData() {
  return (
    <svg viewBox="0 0 168 108" className={styles.motif} aria-hidden="true">
      {DATA_BRANCHES.map((d, i) => (
        <Charge key={`branch-${i}`} d={d} i={i} />
      ))}

      <g style={cssVars({ "--i": 0 })}>
        <path d="M6 26v56a18 5 0 0 0 36 0v-56z" className={styles.box} />
        <ellipse cx={24} cy={26} rx={18} ry={5} className={styles.box} />
        <path d="M6 45a18 5 0 0 0 36 0M6 64a18 5 0 0 0 36 0" className={styles.glyph} />
      </g>

      {TABLES.map(({ y, rows }, i) => (
        <g key={`table-${y}`} style={cssVars({ "--i": i + 1 })}>
          <rect x={100.5} y={y} width={66} height={22} rx={3} className={styles.frame} />
          <rect x={102} y={y + 1.5} width={63} height={5} rx={1.5} className={styles.head} />
          {rows.map((w, j) => (
            <rect key={j} x={106} y={y + 10 + j * 6} width={w} height={2.5} rx={1.25} className={styles.row} />
          ))}
        </g>
      ))}
    </svg>
  );
}

const DEPLOY_LINE = zag([46.5, 52], [124, 52], 40);

/**
 * Deploy: code → build → cloud, on one broken line. On hover the pipeline runs: charge goes down the
 * line, the build bar fills and, once it is done, a check is drawn inside the cloud.
 */
export function MotifDeploy() {
  return (
    <svg viewBox="0 0 168 108" className={styles.motif} aria-hidden="true">
      <Charge d={DEPLOY_LINE} />

      {/* code: an editor window with </> */}
      <g style={cssVars({ "--i": 0 })}>
        <rect x={0.75} y={32} width={45.75} height={40} rx={4} className={styles.frame} />
        <line x1={0.75} y1={40} x2={46.5} y2={40} className={styles.line} />
        <circle cx={6} cy={36} r={1.4} className={styles.dot} />
        <circle cx={11} cy={36} r={1.4} className={styles.dot} />
        <path d="M17 51l-5 5 5 5M30 51l5 5-5 5M26 49l-5 14" className={styles.glyph} />
      </g>
      {/* build: a log line and a progress bar */}
      <g style={cssVars({ "--i": 1 })}>
        <rect x={64} y={38} width={40} height={28} rx={3} className={styles.box} />
        <path d="M70 45h20" className={styles.glyph} />
        <rect x={70} y={53} width={28} height={4} rx={2} className={styles.pill} />
        <rect x={70} y={53} width={28} height={4} rx={2} className={styles.bar} />
      </g>
      {/* cloud, with the check drawn once the build is through */}
      <g style={cssVars({ "--i": 2 })}>
        <path d="M128 70a10 10 0 0 1-1-19.9a14 14 0 0 1 26.5-4.5a12.5 12.5 0 0 1 6.5 24.4z" className={styles.box} />
        <path d="M135 59l5 5 9-10" pathLength={1} className={styles.check} />
      </g>
    </svg>
  );
}
