"use client";

import { useEffect, useRef, type ComponentType } from "react";
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

  // ---- the light: under the mouse, in the card's own coordinates, also while the page scrolls ----
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    /** The mouse's last position on the page (client px); null until it moves, or off a mouse. */
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;

    // The stack scales cards down (--s): screen px are divided by that scale. And a scroll moves the
    // cards under a still mouse — even slides the next one in under it — so on every scroll the card
    // the mouse is over places its light again.
    const place = () => {
      frame = 0;
      if (!pointer) return;
      const rect = el.getBoundingClientRect();
      if (pointer.x < rect.left || pointer.x > rect.right || pointer.y < rect.top || pointer.y > rect.bottom) return;
      const sx = rect.width ? el.offsetWidth / rect.width : 1;
      const sy = rect.height ? el.offsetHeight / rect.height : 1;
      el.style.setProperty("--mx", `${((pointer.x - rect.left) * sx).toFixed(1)}px`);
      el.style.setProperty("--my", `${((pointer.y - rect.top) * sy).toFixed(1)}px`);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    const onMove = (event: PointerEvent) => {
      pointer = event.pointerType === "mouse" ? { x: event.clientX, y: event.clientY } : null;
      request();
    };

    // Only while the card is around the screen: elsewhere on the page it has nothing to light.
    const listen = (on: boolean) => {
      if (on) {
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("scroll", request, { passive: true });
      } else {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("scroll", request);
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    let watching = false;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === watching) return;
        watching = entry.isIntersecting;
        listen(watching);
      },
      { rootMargin: "25% 0px" },
    );
    near.observe(el);
    return () => {
      near.disconnect();
      listen(false);
    };
  }, []);

  return (
    <article
      ref={ref}
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
