"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cssVars, cx } from "@/lib/cx";
import { drawLightning, drawRailLightning, type Lightning } from "./bolt";
import styles from "./ScrollLightning.module.css";

/** The reading line the bolt's head follows: this share of the viewport height, from the top. */
const SCAN = 0.72;
/** Share of the remaining distance the head covers each frame: it trails the scroll a little. */
const EASE = 0.2;

interface Drawing {
  width: number;
  height: number;
  bolt: Lightning;
}

/**
 * A lightning bolt that fills its parent (geometry in ./bolt), drawn by the scroll — behind the About
 * section, and down both sides of the services stack: `--t` is how
 * much of the bolt is out — the reading line's depth into the drawing, scaled onto the trunk's length,
 * eased — and each stroke turns it into a dash offset in CSS. Scrolling back draws it back up. A lit head
 * rides the drawing edge. With reduced motion the bolt is simply there, whole.
 */
/**
 * `shape`: "center" for one bolt down the middle of a wide stage (About), "rail" for a tall, narrow
 * column (beside the services stack). `seed` picks the bolt (bolt.ts's defaults otherwise).
 */
export function ScrollLightning({ shape = "center", seed }: { shape?: "center" | "rail"; seed?: number }) {
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // ---- drawing: follows the backdrop's size (same seed, same bolt) ----
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    let size = "";
    const draw = () => {
      frame = 0;
      const width = root.clientWidth;
      const height = root.clientHeight;
      if (`${width}x${height}` === size) return;
      size = `${width}x${height}`;
      setDrawing({ width, height, bolt: (shape === "rail" ? drawRailLightning : drawLightning)({ width, height, seed }) });
    };
    const observer = new ResizeObserver(() => {
      if (!frame) frame = requestAnimationFrame(draw);
    });
    observer.observe(root);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [shape, seed]);

  // ---- scroll: the reading line draws the bolt ----
  useEffect(() => {
    const root = rootRef.current;
    // Reduced motion: CSS shows the whole bolt.
    if (!drawing || !root || prefersReducedMotion()) return;
    const scale = drawing.bolt.trunk / drawing.height;
    let t: number | null = null;
    let frame = 0;
    let watching = false;

    const tick = () => {
      frame = 0;
      const goal = (window.innerHeight * SCAN - root.getBoundingClientRect().top) * scale;
      // The first reading snaps (a page opened mid-scroll), later ones trail.
      t = t === null || Math.abs(goal - t) < 0.5 ? goal : t + (goal - t) * EASE;
      root.style.setProperty("--t", t.toFixed(1));
      if (t !== goal) frame = requestAnimationFrame(tick);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // Only follow the scroll around the section; leaving, one last reading settles the bolt.
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

  return (
    <div ref={rootRef} className={styles.backdrop} aria-hidden="true">
      {drawing ? (
        <svg
          className={styles.svg}
          width={drawing.width}
          height={drawing.height}
          viewBox={`0 0 ${drawing.width} ${drawing.height}`}
        >
          {drawing.bolt.strokes.map((stroke, i) => (
            <g
              key={i}
              className={cx(styles.stroke, styles[`l${stroke.level}`])}
              style={cssVars({ "--t0": stroke.t0.toFixed(1), "--t1": stroke.t1.toFixed(1) })}
            >
              {/* A light edge just below the line, as in the Hero: the slight carved feel. */}
              <path className={styles.edge} d={stroke.d} pathLength={1} transform="translate(.7 1.1)" />
              <path className={styles.core} d={stroke.d} pathLength={1} />
              {/* The lit head: a hot centre in an ember glow, at the drawing edge. */}
              <path className={styles.glow} d={stroke.d} pathLength={1} />
              <path className={styles.hot} d={stroke.d} pathLength={1} />
            </g>
          ))}
        </svg>
      ) : null}
    </div>
  );
}
