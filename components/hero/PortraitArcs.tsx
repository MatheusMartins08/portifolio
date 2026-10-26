"use client";

import { useEffect, useRef } from "react";
import { drawGapArc } from "./gapArc";
import styles from "./PortraitArcs.module.css";

/** Arcs alive at once, at most. */
const SLOTS = 2;
/** Wait before trying the next arc, ms: random in the range. */
const GAP_MS: [number, number] = [250, 1100];
/** How long an arc lives, ms. */
const LIFE_MS: [number, number] = [200, 400];
/** While alive, an arc redraws itself this often, ms: it crackles. */
const CRACKLE_MS = 60;

const between = ([min, max]: [number, number]) => min + Math.random() * (max - min);

/**
 * Small electric arcs jumping across the gap between the Hero photo and its hairline frame, like
 * static: one or two at a time, each alive a few hundred ms, crackling, then the next somewhere else
 * (geometry in ./gapArc). Laid over the element just before it, the photo's frame, on the box of its
 * outline. Drawn straight into a fixed pool of paths, never through React state. Runs only while the
 * photo is on screen and the tab is visible. Decorative: hidden from assistive tech, and not drawn at
 * all with reduced motion.
 */
export function PortraitArcs() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const photo = svg?.previousElementSibling as HTMLElement | null;
    if (!svg || !photo || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ---- the hairline's box: the photo's border box (unrounded, unscaled) plus its outline ----
    let box = { width: 0, height: 0, outset: 0 };
    const resize = new ResizeObserver(([entry]) => {
      const border = entry.borderBoxSize?.[0];
      const style = getComputedStyle(photo);
      const outset = (parseFloat(style.outlineOffset) || 0) + (parseFloat(style.outlineWidth) || 0);
      const width = (border ? border.inlineSize : photo.offsetWidth) + 2 * outset;
      const height = (border ? border.blockSize : photo.offsetHeight) + 2 * outset;
      box = { width, height, outset };
      svg.setAttribute("width", `${width}`);
      svg.setAttribute("height", `${height}`);
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.style.setProperty("--outset", `${outset}px`);
    });
    resize.observe(photo);

    // ---- the arcs: a free slot strikes at a random spot and crackles there until its life is over ----
    const slots = Array.from(svg.querySelectorAll("g"), (g) => ({ g, paths: Array.from(g.querySelectorAll("path")), busy: false }));
    const timers = new Set<number>();
    const later = (ms: number, run: () => void) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        run();
      }, ms);
      timers.add(id);
    };

    const strike = (slot: (typeof slots)[number]) => {
      slot.busy = true;
      const spot = Math.floor(Math.random() * 1e9);
      const end = performance.now() + between(LIFE_MS);
      let take = 0;
      const crackle = () => {
        if (performance.now() >= end || !box.width) {
          slot.g.style.opacity = "0";
          slot.busy = false;
          return;
        }
        const d = drawGapArc({ ...box, spot, take: take++ });
        slot.paths.forEach((path) => path.setAttribute("d", d));
        slot.g.style.opacity = (0.55 + 0.45 * Math.random()).toFixed(2);
        later(CRACKLE_MS, crackle);
      };
      crackle();
    };

    let running = false;
    const next = () => {
      const free = slots.find((slot) => !slot.busy);
      if (free) strike(free);
      later(between(GAP_MS), next);
    };
    const run = (on: boolean) => {
      if (on === running) return;
      running = on;
      if (on) return next();
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      slots.forEach((slot) => {
        slot.busy = false;
        slot.g.style.opacity = "0";
      });
    };

    // Only while the photo is on screen and the tab is visible.
    let onScreen = false;
    const sync = () => run(onScreen && !document.hidden);
    const near = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    near.observe(photo);
    document.addEventListener("visibilitychange", sync);

    return () => {
      resize.disconnect();
      near.disconnect();
      document.removeEventListener("visibilitychange", sync);
      run(false);
    };
  }, []);

  return (
    <svg ref={svgRef} className={styles.arcs} width={0} height={0} aria-hidden="true" focusable="false">
      {Array.from({ length: SLOTS }, (_, i) => (
        <g key={i} className={styles.arc}>
          <path className={styles.glow} />
          <path className={styles.body} />
        </g>
      ))}
    </svg>
  );
}
