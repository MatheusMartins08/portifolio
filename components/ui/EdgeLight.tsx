"use client";

import { useEffect, useRef } from "react";
import { cx } from "@/lib/cx";
import styles from "./EdgeLight.module.css";

interface EdgeLightProps {
  /** Ring just inside the edge, for a parent with no border to sit on (or one that clips its overflow). */
  inset?: boolean;
  className?: string;
}

/**
 * A card's border lit in terracota around the pointer: only the stretch of the edge near it shows, and
 * it follows the pointer while the card is hovered (centred when the card takes keyboard focus). Drop it
 * in as a child of any positioned card: it takes the card's radius and listens to the card's pointer.
 * Decorative: hidden from assistive tech, no pointer events, nothing on touch.
 */
export function EdgeLight({ inset = false, className }: EdgeLightProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const edge = ref.current;
    const card = edge?.parentElement;
    if (!edge || !card) return;
    function onMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const rect = card!.getBoundingClientRect();
      edge!.style.setProperty("--mx", `${Math.round(event.clientX - rect.left)}px`);
      edge!.style.setProperty("--my", `${Math.round(event.clientY - rect.top)}px`);
    }
    card.addEventListener("pointermove", onMove);
    return () => card.removeEventListener("pointermove", onMove);
  }, []);

  return <span ref={ref} className={cx(styles.edge, inset && styles.inset, className)} aria-hidden="true" />;
}
