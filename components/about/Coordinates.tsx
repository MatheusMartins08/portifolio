import { cx } from "@/lib/cx";
import styles from "./Coordinates.module.css";

interface CoordinatesProps {
  lat: number;
  lon: number;
  className?: string;
}

function format(value: number, positive: string, negative: string): string {
  return `${Math.abs(value).toFixed(2)}° ${value >= 0 ? positive : negative}`;
}

const W = 132;
const H = 72;
const PITCH = 12;

/** Abstract mini-map: dot grid, dashed axes and a pulsing terracota pin, with the coordinates in mono. */
export function Coordinates({ lat, lon, className }: CoordinatesProps) {
  // The pin sits on the grid point given by the fractional part of each coordinate.
  const fx = Math.abs(lon) % 1;
  const fy = Math.abs(lat) % 1;
  const mx = Math.round((12 + fx * (W - 24)) / PITCH) * PITCH;
  const my = Math.round((12 + fy * (H - 24)) / PITCH) * PITCH;
  const dots: Array<[number, number]> = [];
  for (let x = PITCH; x < W; x += PITCH) for (let y = PITCH; y < H; y += PITCH) dots.push([x, y]);

  return (
    <div className={cx(styles.coord, className)}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true" className={styles.map}>
        {dots.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={0.9} className={styles.dot} />
        ))}
        <line x1={0} y1={my} x2={W} y2={my} className={styles.axis} />
        <line x1={mx} y1={0} x2={mx} y2={H} className={styles.axis} />
        <circle cx={mx} cy={my} r={9} className={styles.halo} />
        <circle cx={mx} cy={my} r={3} className={styles.pin} />
      </svg>
      <span className={styles.text}>
        {format(lat, "N", "S")} · {format(lon, "E", "W")}
      </span>
    </div>
  );
}
