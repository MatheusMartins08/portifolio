"use client";

import { useRef, type ComponentType, type PointerEvent } from "react";
import { Tag } from "@/components/ui/Tag";
import type { ServiceKey } from "@/lib/content/site";
import { cssVars, cx } from "@/lib/cx";
import { MotifAI, MotifBackend, MotifData, MotifDeploy, MotifWeb } from "./Motifs";
import styles from "./ServiceCard.module.css";

const MOTIFS: Record<ServiceKey, ComponentType> = {
  web: MotifWeb,
  ai: MotifAI,
  backend: MotifBackend,
  data: MotifData,
  deploy: MotifDeploy,
};

interface ServiceCardProps {
  /** Mono numeral: "01". */
  index: string;
  /** Quiet tag: WEB, IA, BACKEND… */
  label: string;
  /** Graphic motif that reacts to the service on hover. */
  motif: ServiceKey;
  /** lg = the wide lead card, md = every other one (smaller motif). */
  size?: "lg" | "md";
  title: string;
  description: string;
  highlights: string[];
  className?: string;
}

/**
 * Service card: numeral, label, motif, title, description and highlights. On hover the top edge
 * draws in terracota, the numeral lights up, the highlight ticks grow and the motif reacts.
 * A soft light follows the pointer.
 */
export function ServiceCard({ index, label, motif, size = "lg", title, description, highlights, className }: ServiceCardProps) {
  const ref = useRef<HTMLElement>(null);
  const Motif = MOTIFS[motif];

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  return (
    <article ref={ref} onPointerMove={onPointerMove} className={cx(styles.svc, styles[size], className)}>
      <span className={styles.edgeTop} aria-hidden="true" />
      <div className={styles.top}>
        <div className={styles.ids}>
          <span className={styles.num}>{index}</span>
          <Tag tone="quiet">{label}</Tag>
        </div>
        <div className={styles.motifBox}><Motif /></div>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{description}</p>
      {highlights.length ? (
        <ul className={styles.list}>
          {highlights.map((item, i) => (
            <li key={item} style={cssVars({ "--i": i })}>
              <span className={styles.tick} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
