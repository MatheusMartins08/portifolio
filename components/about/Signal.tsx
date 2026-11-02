import { StatusDot } from "@/components/ui/StatusDot";
import { site } from "@/lib/content/site";
import styles from "./AboutDiagrams.module.css";

const RINGS = [16, 30, 44];

/**
 * Status, drawn as a signal: the status dot in a sight of three thin rings. When the About bolt passes
 * the module (`data-pulse`), one ring of charge spreads out from the dot, once. Decorative: the
 * sentence beside it carries the meaning.
 */
export function Signal() {
  return (
    <span className={styles.signal} aria-hidden="true">
      <svg viewBox="-56 -56 112 112" className={styles.signalSvg}>
        {RINGS.map((r) => (
          <circle key={r} r={r} className={styles.ring} />
        ))}
        <path d="M-54 0H-20M20 0H54M0 -54V-20M0 20V54" className={styles.sight} />
        <circle r={44} className={styles.ripple} />
      </svg>
      <StatusDot tone={site.status} className={styles.signalDot} />
    </span>
  );
}
