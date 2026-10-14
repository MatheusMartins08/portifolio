import { cssVars, cx } from "@/lib/cx";
import styles from "./ServiceCard.module.css";

/** Web: a page wireframe that assembles itself on hover (text bars grow, CTA fills, cursor travels). */
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
      <path d="M98 74l16-14 12 10 10-8 20 16" className={cx(styles.line, styles.img)} />
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

/** AI: a small graph of nodes; on hover a dashed flow runs along the edges and the nodes light up in turn. */
export function MotifAI() {
  return (
    <svg viewBox="0 0 168 108" className={styles.motif} aria-hidden="true">
      {EDGES.map(([a, b], i) => (
        <line key={`edge-${i}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} className={styles.edge} />
      ))}
      {EDGES.map(([a, b], i) => (
        <line
          key={`flow-${i}`}
          x1={NODES[a][0]}
          y1={NODES[a][1]}
          x2={NODES[b][0]}
          y2={NODES[b][1]}
          className={styles.flow}
          style={cssVars({ "--i": i })}
        />
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
