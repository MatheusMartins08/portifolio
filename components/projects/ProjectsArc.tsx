"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cssVars, cx } from "@/lib/cx";
import { drawArc, type Arc, type Rect } from "./arc";
import styles from "./ProjectsArc.module.css";

/** The reading line the arc's head follows: this share of the viewport height, from the top. */
const SCAN = 0.72;
/** Share of the remaining distance the head covers each frame: it trails the scroll a little. */
const EASE = 0.2;

interface Drawing {
  width: number;
  height: number;
  /** One arc per pair of projects side by side; `pair` is the index of the first. */
  arcs: Array<Arc & { pair: number }>;
}

/**
 * The arcs linking projects that sit side by side (geometry in ./arc), behind the cards, filling the
 * projects grid. Each is drawn by the scroll, first project to second (`--t` per arc), and with a
 * card hovered or focused a charge runs along it, away from that card.
 * In a single column there is no pair side by side, so nothing is drawn. With reduced motion the arcs
 * are simply there, whole, and still.
 */
export function ProjectsArc() {
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // ---- drawing: follows the grid's layout ----
  useEffect(() => {
    const root = rootRef.current;
    const grid = root?.parentElement;
    if (!root || !grid) return;
    let frame = 0;
    let layout = "";
    const draw = () => {
      frame = 0;
      const box = root.getBoundingClientRect();
      const rects: Rect[] = Array.from(grid.querySelectorAll("[data-project-media]"), (media) => {
        const r = media.getBoundingClientRect();
        return { x: r.left - box.left, y: r.top - box.top, width: r.width, height: r.height };
      });
      const key = rects.map((r) => [r.x, r.y, r.width, r.height].map(Math.round).join(",")).join(";");
      if (key === layout) return;
      layout = key;
      const arcs: Drawing["arcs"] = [];
      for (let i = 0; i + 1 < rects.length; i++) {
        const arc = drawArc(rects[i], rects[i + 1], 31 + i);
        if (arc) arcs.push({ ...arc, pair: i });
      }
      setDrawing({ width: box.width, height: box.height, arcs });
    };
    const observer = new ResizeObserver(() => {
      if (!frame) frame = requestAnimationFrame(draw);
    });
    observer.observe(grid);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  // ---- scroll: the reading line draws each arc ----
  useEffect(() => {
    const root = rootRef.current;
    // Reduced motion: CSS shows the arcs whole.
    if (!drawing?.arcs.length || !root || prefersReducedMotion()) return;
    const groups = Array.from(root.querySelectorAll<SVGGElement>("[data-pair]"));
    const ts: Array<number | null> = drawing.arcs.map(() => null);
    let frame = 0;
    let watching = false;

    const tick = () => {
      frame = 0;
      const line = window.innerHeight * SCAN - root.getBoundingClientRect().top;
      let moving = false;
      drawing.arcs.forEach((arc, i) => {
        const share = (line - arc.top) / (arc.bottom - arc.top);
        const goal = Math.min(1, Math.max(0, share)) * (arc.length + 1);
        const t = ts[i];
        // The first reading snaps (a page opened mid-scroll), later ones trail.
        const next = t === null || Math.abs(goal - t) < 0.5 ? goal : t + (goal - t) * EASE;
        ts[i] = next;
        groups[i]?.style.setProperty("--t", next.toFixed(1));
        if (next !== goal) moving = true;
      });
      if (moving) frame = requestAnimationFrame(tick);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // Only follow the scroll around the grid; leaving, one last reading settles the arcs.
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
    observer.observe(root);
    request();

    return () => {
      observer.disconnect();
      listen(false);
      cancelAnimationFrame(frame);
    };
  }, [drawing]);

  // ---- charge: a card hovered or focused sends a pulse along its arcs, away from it ----
  useEffect(() => {
    const root = rootRef.current;
    const grid = root?.parentElement;
    if (!drawing?.arcs.length || !root || !grid) return;
    const cards = Array.from(grid.querySelectorAll("[data-project-media]"), (media) => media.closest("article"));
    const run = (card: number, on: boolean) => {
      root.querySelectorAll<SVGGElement>("[data-pair]").forEach((group) => {
        const pair = Number(group.dataset.pair);
        if (pair !== card && pair !== card - 1) return;
        if (on) group.dataset.run = pair === card ? "out" : "back";
        else delete group.dataset.run;
      });
    };
    const off: Array<() => void> = [];
    cards.forEach((card, i) => {
      if (!card) return;
      // Keyboard focus only (as :focus-visible): a click must not leave the charge running.
      const enter = () => run(i, true);
      const focus = (event: FocusEvent) => {
        if ((event.target as Element).matches(":focus-visible")) run(i, true);
      };
      const leave = () => {
        if (!card.querySelector(":focus-visible")) run(i, false);
      };
      const blur = (event: FocusEvent) => {
        if (!card.contains(event.relatedTarget as Node | null) && !card.matches(":hover")) run(i, false);
      };
      card.addEventListener("pointerenter", enter);
      card.addEventListener("pointerleave", leave);
      card.addEventListener("focusin", focus);
      card.addEventListener("focusout", blur);
      off.push(() => {
        card.removeEventListener("pointerenter", enter);
        card.removeEventListener("pointerleave", leave);
        card.removeEventListener("focusin", focus);
        card.removeEventListener("focusout", blur);
      });
    });
    return () => off.forEach((remove) => remove());
  }, [drawing]);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      {drawing?.arcs.length ? (
        <svg className={styles.svg} width={drawing.width} height={drawing.height} viewBox={`0 0 ${drawing.width} ${drawing.height}`}>
          {drawing.arcs.map((arc) => (
            <g key={arc.pair} data-pair={arc.pair}>
              {arc.strokes.map((stroke, i) => (
                <g
                  key={i}
                  className={cx(styles.stroke, styles[`l${stroke.level}`])}
                  style={cssVars({ "--t0": stroke.t0.toFixed(1), "--t1": stroke.t1.toFixed(1) })}
                >
                  <path className={styles.core} d={stroke.d} pathLength={1} />
                  {/* The lit head, at the drawing edge. */}
                  <path className={styles.hot} d={stroke.d} pathLength={1} />
                </g>
              ))}
              <path className={styles.pulse} d={arc.trunk} pathLength={1} />
            </g>
          ))}
        </svg>
      ) : null}
    </div>
  );
}
