"use client";

import { useEffect, useRef } from "react";
import { drawGapArc } from "./gapArc";
import styles from "./PortraitArcs.module.css";

/** Paths in the pool: one per charged arc. */
const SLOTS = 6;
/** At rest, arcs alive at once, at most. */
const IDLE_MAX = 2;
/** At rest, wait before trying the next arc, ms: random in the range. */
const GAP_MS: [number, number] = [250, 1100];
/** At rest, how long an arc lives, ms. */
const LIFE_MS: [number, number] = [200, 400];
/** While alive, an arc redraws itself this often, ms: it crackles. */
const CRACKLE_MS = 60;
/** Charged (the mouse on the photo): an arc on each of these, held. Two a side, one on top, one below. */
const PLACES = [
  { side: 3, at: 1 / 3 },
  { side: 3, at: 2 / 3 },
  { side: 1, at: 1 / 3 },
  { side: 1, at: 2 / 3 },
  { side: 0, at: 0.5 },
  { side: 2, at: 0.5 },
] as const;
/** The flash as the charged arcs come on, ms. */
const FLASH_MS = 120;
/** Once the mouse leaves, the charge drains for this long, ms, its flickers spreading out over the range. */
const DISCHARGE_MS = 1000;
const DISCHARGE_STEP: [number, number] = [60, 140];

const between = ([min, max]: [number, number]) => min + Math.random() * (max - min);
const newSpot = () => Math.floor(Math.random() * 1e9);

/**
 * Small electric arcs across the gap between the Hero photo and its hairline frame (geometry in
 * ./gapArc). At rest, like static: one or two at a time, each alive a few hundred ms, crackling, then the
 * next somewhere else. With the mouse on the photo it is charged: six arcs come on at once with a flash
 * and hold, trembling, as if the line powered the photo; when the mouse leaves they drain over a second,
 * weaker and rarer, and the static comes back. Laid over the element just before it, the photo's frame,
 * on the box of its outline. Drawn straight into a fixed pool of paths, never through React state. Runs
 * only while the photo is on screen and the tab is visible. Decorative: hidden from assistive tech, and
 * not drawn at all with reduced motion.
 */
export function PortraitArcs() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const photo = svg?.previousElementSibling as HTMLElement | null;
    const figure = svg?.parentElement;
    if (!svg || !photo || !figure || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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

    // ---- the pool and its timers ----
    const slots = Array.from(svg.querySelectorAll("g"), (g) => ({ g, paths: Array.from(g.querySelectorAll("path")), busy: false }));
    type Slot = (typeof slots)[number];
    const show = (slot: Slot, d: string, opacity: number) => {
      slot.paths.forEach((path) => path.setAttribute("d", d));
      slot.g.style.opacity = opacity.toFixed(2);
    };
    const hide = (slot: Slot) => {
      slot.busy = false;
      slot.g.style.opacity = "0";
    };
    const timers = new Set<number>();
    const later = (ms: number, run: () => void) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        run();
      }, ms);
      timers.add(id);
    };
    const clear = () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      slots.forEach(hide);
      svg.removeAttribute("data-flash");
    };
    let take = 0;

    // ---- at rest: a free slot strikes at a random spot and crackles there until its life is over ----
    const strike = (slot: Slot) => {
      slot.busy = true;
      const spot = newSpot();
      const end = performance.now() + between(LIFE_MS);
      const crackle = () => {
        if (performance.now() >= end || !box.width) return hide(slot);
        show(slot, drawGapArc({ ...box, spot, take: take++ }), 0.55 + 0.45 * Math.random());
        later(CRACKLE_MS, crackle);
      };
      crackle();
    };
    const idle = () => {
      const free = slots.find((slot) => !slot.busy);
      if (free && slots.filter((slot) => slot.busy).length < IDLE_MAX) strike(free);
      later(between(GAP_MS), idle);
    };
    const rest = () => {
      clear();
      idle();
    };

    // ---- charged: the six arcs at once, with a flash, held and trembling ----
    let spots: number[] = [];
    const charge = () => {
      clear();
      spots = PLACES.map(newSpot);
      svg.setAttribute("data-flash", "");
      later(FLASH_MS, () => svg.removeAttribute("data-flash"));
      const hum = () => {
        PLACES.forEach((place, i) => show(slots[i], drawGapArc({ ...box, spot: spots[i], take: take++, place }), 0.75 + 0.25 * Math.random()));
        later(CRACKLE_MS, hum);
      };
      hum();
    };

    // ---- discharge: the same six, weaker and rarer, then the static again ----
    const discharge = () => {
      clear();
      const start = performance.now();
      const drain = () => {
        const level = 1 - (performance.now() - start) / DISCHARGE_MS;
        if (level <= 0) return rest();
        PLACES.forEach((place, i) => {
          if (Math.random() < level) show(slots[i], drawGapArc({ ...box, spot: spots[i], take: take++, place }), level * (0.6 + 0.4 * Math.random()));
          else slots[i].g.style.opacity = "0";
        });
        later(DISCHARGE_STEP[0] + (DISCHARGE_STEP[1] - DISCHARGE_STEP[0]) * (1 - level), drain);
      };
      drain();
    };

    // ---- the mouse on the photo (a mouse only: touch has no hover) ----
    let running = false;
    let hovered = false;
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      hovered = true;
      if (running) charge();
    };
    const onLeave = () => {
      if (!hovered) return;
      hovered = false;
      if (running) discharge();
    };
    figure.addEventListener("pointerenter", onEnter);
    figure.addEventListener("pointerleave", onLeave);

    // Only while the photo is on screen and the tab is visible.
    const run = (on: boolean) => {
      if (on === running) return;
      running = on;
      if (!on) return clear();
      if (hovered) charge();
      else rest();
    };
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
      figure.removeEventListener("pointerenter", onEnter);
      figure.removeEventListener("pointerleave", onLeave);
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
