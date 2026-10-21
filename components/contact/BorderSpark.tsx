"use client";

import { useEffect, useState, type RefObject } from "react";
import { cssVars } from "@/lib/cx";
import { drawBorderBolt } from "./borderBolt";
import styles from "./BorderSpark.module.css";

/** px per second: a slow lap around the dialog (~18s on a laptop, ~13s on a phone). */
const SPEED = 170;
/** The spark's trail, body and lit head, px: all end at the same point. */
const TAIL = 240;
const BODY = 90;
const HEAD = 16;
/** Three takes of the same border, swapped fast: the spark crackles as it runs. */
const SEEDS = [11, 23, 37];

interface Drawing {
  width: number;
  height: number;
  takes: string[];
  length: number;
}

/**
 * A spark of lightning circling the contact dialog's border, slowly (geometry in ./borderBolt). Laid
 * over `target`, the dialog's panel, as its sibling: the panel scrolls, this does not. Follows the panel's
 * size and corner radii, so it keeps to the border when the form grows or becomes the phone's sheet.
 * Decorative: hidden from assistive tech, and not drawn at all with reduced motion.
 */
export function BorderSpark({ target }: { target: RefObject<HTMLElement | null> }) {
  const [drawing, setDrawing] = useState<Drawing | null>(null);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let frame = 0;
    let key = "";
    const draw = () => {
      frame = 0;
      // offset sizes ignore the entrance's scale.
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      const style = getComputedStyle(el);
      const radii = [
        style.borderTopLeftRadius,
        style.borderTopRightRadius,
        style.borderBottomRightRadius,
        style.borderBottomLeftRadius,
      ].map((r) => parseFloat(r) || 0) as [number, number, number, number];
      const next = [width, height, ...radii].join();
      if (next === key) return;
      key = next;
      const takes = SEEDS.map((seed) => drawBorderBolt({ width, height, radii, seed }));
      setDrawing({ width, height, takes: takes.map((take) => take.d), length: takes[0].length });
    };
    const observer = new ResizeObserver(() => {
      if (!frame) frame = requestAnimationFrame(draw);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target]);

  if (!drawing) return null;
  const { width, height, takes, length } = drawing;

  return (
    <svg
      className={styles.spark}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
      style={cssVars({
        "--lap": `${(length / SPEED).toFixed(2)}s`,
        "--tail": (TAIL / length).toFixed(4),
        "--body": (BODY / length).toFixed(4),
        "--head": (HEAD / length).toFixed(4),
      })}
    >
      {takes.map((d, i) => (
        <g key={i} className={styles.take} style={cssVars({ "--take": i })}>
          <path className={styles.tail} d={d} pathLength={1} />
          <path className={styles.body} d={d} pathLength={1} />
          <path className={styles.glow} d={d} pathLength={1} />
          <path className={styles.hot} d={d} pathLength={1} />
        </g>
      ))}
    </svg>
  );
}
