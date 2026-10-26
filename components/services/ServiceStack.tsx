"use client";

import { useEffect, useRef, useState } from "react";
import type { ServiceKey } from "@/lib/content/site";
import { cssVars } from "@/lib/cx";
import { ServiceCard } from "./ServiceCard";
import styles from "./ServiceStack.module.css";

export interface ServiceStackItem {
  key: ServiceKey;
  index: string;
  motif: ServiceKey;
  label: string;
  title: string;
  description: string;
  highlights: string[];
}

/** How much a card shrinks per card that stacks over it. */
const SHRINK = 0.04;
/** A card becomes the active one once its top passes this share of the viewport height. */
const ACTIVE_LINE = 0.55;
/** Where the stack is off and the cards are a plain list (see the CSS); a short screen is measured. */
const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * The services as a stack of cards on scroll, after Skiper UI's StickyCard_001, rebuilt without
 * libraries: each card sticks a step below the previous one, the next slides up over it and the ones
 * underneath shrink a little (--s). The card in front is active and plays its motif as on hover.
 * Same scroll pattern as the About lightning: listen only around the section, one reading per frame.
 */
export function ServiceStack({ items }: { items: ServiceStackItem[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(-1);

  // ---- one height for every card, so the stack lines up (re-measured when the width changes) ----
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let width = 0;
    const equalize = () => {
      list.style.removeProperty("--card-h");
      const cards = Array.from(list.children, (li) => li.firstElementChild as HTMLElement);
      const tallest = Math.max(...cards.map((card) => card.offsetHeight));
      list.style.setProperty("--card-h", `${tallest}px`);
    };
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === width) return;
      width = entry.contentRect.width;
      equalize();
    });
    observer.observe(list);
    document.fonts?.ready.then(equalize);
    return () => observer.disconnect();
  }, []);

  // ---- scroll: shrink what is covered, mark the card in front ----
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const reduced = window.matchMedia(REDUCED);
    let frame = 0;
    let watching = false;

    const tick = () => {
      frame = 0;
      const rows = Array.from(list.children) as HTMLElement[];

      // Short screen: the last card, stuck at its step, has to fit with some room under it. Measured
      // against the small viewport (clientHeight), which a phone's collapsing address bar leaves alone.
      const last = rows[rows.length - 1];
      const room = parseFloat(getComputedStyle(list).getPropertyValue("--stack-room")) || 0;
      const short = document.documentElement.clientHeight < parseFloat(getComputedStyle(last).top) + last.offsetHeight + room;
      if (short !== list.hasAttribute("data-short")) {
        list.toggleAttribute("data-short", short);
        request();
        return;
      }
      const flat = reduced.matches || short;

      const tops = rows.map((li) => li.getBoundingClientRect().top);
      const line = window.innerHeight * ACTIVE_LINE;

      let front = -1;
      tops.forEach((top, i) => {
        if (top <= line) front = i;
      });
      setActive(front);

      // How far each card has slid into its stuck place over the previous one (0 → 1).
      const placed = rows.map((li, i) => {
        if (i === 0 || flat) return 0;
        const prev = rows[i - 1];
        const stuck = parseFloat(getComputedStyle(li).top);
        const travel = prev.offsetHeight + parseFloat(getComputedStyle(prev).marginBottom) - (stuck - parseFloat(getComputedStyle(prev).top));
        return Math.min(1, Math.max(0, 1 - (tops[i] - stuck) / travel));
      });
      rows.forEach((li, i) => {
        const above = placed.slice(i + 1).reduce((sum, p) => sum + p, 0);
        (li.firstElementChild as HTMLElement).style.setProperty("--s", (1 - SHRINK * above).toFixed(4));
      });
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const listen = (on: boolean) => {
      if (on) {
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", request);
      } else {
        window.removeEventListener("scroll", request);
        window.removeEventListener("resize", request);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === watching) return;
        watching = entry.isIntersecting;
        listen(watching);
        request();
      },
      { rootMargin: "25% 0px" },
    );
    observer.observe(list);
    reduced.addEventListener("change", request);
    request();

    return () => {
      observer.disconnect();
      listen(false);
      reduced.removeEventListener("change", request);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <ol ref={listRef} className={styles.stack}>
      {items.map((item, i) => (
        <li key={item.key} className={styles.item} style={cssVars({ "--i": i })}>
          <ServiceCard
            index={item.index}
            label={item.label}
            motif={item.motif}
            title={item.title}
            description={item.description}
            highlights={item.highlights}
            active={i === active}
          />
        </li>
      ))}
    </ol>
  );
}
