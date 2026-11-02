import { cssVars } from "@/lib/cx";
import { toPath, type Point } from "@/lib/geometry/lightning";
import styles from "./AboutDiagrams.module.css";

/** Belo Horizonte, degrees (as written on the Location module). */
const HOME = { lat: -19.92, lon: -43.93 };
/** The globe faces a little north-east of Brazil, so the arcs from home have room to reach out. */
const VIEW = { lat: 6, lon: -24 };
const R = 56;
/** Where the arcs land: points spread across the visible face, not places — "remote, worldwide". */
const REACH = [
  { lat: 38, lon: -78 },
  { lat: 46, lon: 4 },
  { lat: 4, lon: 24 },
];

const rad = (d: number) => (d * Math.PI) / 180;
type Vec = [number, number, number];

function toVec(lat: number, lon: number): Vec {
  return [Math.cos(rad(lat)) * Math.cos(rad(lon)), Math.cos(rad(lat)) * Math.sin(rad(lon)), Math.sin(rad(lat))];
}

/** Orthographic projection onto the view, at `lift` × the radius: [x, y] in svg units and whether it faces us. */
function project([x, y, z]: Vec, lift = 1): { p: Point; front: boolean } {
  const lat0 = rad(VIEW.lat);
  const lon0 = rad(VIEW.lon);
  // Rotate the view's centre to the front.
  const e: Vec = [Math.cos(lat0) * Math.cos(lon0), Math.cos(lat0) * Math.sin(lon0), Math.sin(lat0)];
  const east: Vec = [-Math.sin(lon0), Math.cos(lon0), 0];
  const north: Vec = [-Math.sin(lat0) * Math.cos(lon0), -Math.sin(lat0) * Math.sin(lon0), Math.cos(lat0)];
  const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const v: Vec = [x, y, z];
  return { p: [dot(v, east) * R * lift, -dot(v, north) * R * lift], front: dot(v, e) > 0 };
}

/** A line of the graticule, cut where it turns to the back of the globe. */
function visibleRuns(points: Vec[]): string {
  const runs: Point[][] = [];
  let run: Point[] = [];
  for (const v of points) {
    const { p, front } = project(v);
    if (front) run.push(p);
    else if (run.length) {
      runs.push(run);
      run = [];
    }
  }
  if (run.length) runs.push(run);
  return runs.filter((r) => r.length > 1).map(toPath).join("");
}

const steps = (from: number, to: number, by: number) => Array.from({ length: Math.floor((to - from) / by) + 1 }, (_, i) => from + i * by);

const GRATICULE = [
  ...steps(-160, 180, 20).map((lon) => visibleRuns(steps(-90, 90, 3).map((lat) => toVec(lat, lon)))),
  ...steps(-60, 60, 20).map((lat) => visibleRuns(steps(-180, 180, 3).map((lon) => toVec(lat, lon)))),
].join("");

/** Great-circle arc from a to b, lifted off the surface towards its middle (as flight paths are drawn). */
function arc(a: Vec, b: Vec): string {
  const omega = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const points = steps(0, 1, 1 / 32).map((t) => {
    const s = Math.sin(omega) || 1;
    const k1 = Math.sin((1 - t) * omega) / s;
    const k2 = Math.sin(t * omega) / s;
    const v: Vec = [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
    return project(v, 1 + 0.3 * Math.sin(Math.PI * t)).p;
  });
  return toPath(points);
}

const home = toVec(HOME.lat, HOME.lon);
const HOME_AT = project(home).p;
const ARCS = REACH.map(({ lat, lon }) => ({ d: arc(home, toVec(lat, lon)), end: project(toVec(lat, lon)).p }));

/**
 * Location, drawn as a wireframe globe: the graticule's front half, home marked in Belo Horizonte, and
 * three arcs from it across the globe ("on-site + remote, worldwide"). The arcs draw once when the About
 * bolt passes the module (`data-pulse`). Computed once at module load, so it is the same everywhere.
 */
export function Globe() {
  return (
    <svg viewBox="-64 -64 128 128" className={styles.globe} aria-hidden="true">
      <circle r={R} className={styles.sphere} />
      <path d={GRATICULE} className={styles.graticule} />
      {ARCS.map(({ d, end }, i) => (
        <g key={i} className={styles.reach} style={cssVars({ "--i": i })}>
          <path d={d} pathLength={1} className={styles.arc} />
          <circle cx={end[0]} cy={end[1]} r={1.6} className={styles.arcEnd} />
        </g>
      ))}
      <circle cx={HOME_AT[0]} cy={HOME_AT[1]} r={6} className={styles.homeRing} />
      <circle cx={HOME_AT[0]} cy={HOME_AT[1]} r={2.4} className={styles.home} />
    </svg>
  );
}
