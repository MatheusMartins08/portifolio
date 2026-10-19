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
  /** Graphic motif that reacts to the service on hover, or while the card is active. */
  motif: ServiceKey;
  title: string;
  description: string;
  highlights: string[];
  /** The card in front of the stack: plays what the hover plays. */
  active?: boolean;
  className?: string;
}

/**
 * Service card: numeral, label, motif, title, description and highlights. On hover, and while it is
 * active, the top edge draws in terracota, the numeral lights up, the highlight ticks grow and the
 * motif reacts. A soft light follows the pointer. Scaled by `--s` when other cards stack over it.
 */
export function ServiceCard({ index, label, motif, title, description, highlights, active = false, className }: ServiceCardProps) {
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
    <article
      ref={ref}
      onPointerMove={onPointerMove}
      data-active={active || undefined}
      className={cx(styles.svc, className)}
    >
      <span className={styles.edgeTop} aria-hidden="true" />
      <div className={styles.ids}>
        <span className={styles.num}>{index}</span>
        <Tag tone="quiet">{label}</Tag>
      </div>
      <div className={styles.motifBox}><Motif /></div>
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
