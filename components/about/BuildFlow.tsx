"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { cssVars, cx, pad2 } from "@/lib/cx";
import { jag, toPath, type Point } from "@/lib/geometry/lightning";
import styles from "./AboutDiagrams.module.css";

/**
 * The wiring of the eight stages, by index: problem → architecture → frontend | backend | databases
 * (side by side) → integrations → infrastructure → deploy. Any other count is wired in a plain row.
 */
const PARALLEL = [2, 3, 4];
function wiring(count: number): { edges: Array<[number, number]>; level: number[] } {
  if (count !== 8) {
    return { edges: Array.from({ length: count - 1 }, (_, i): [number, number] => [i, i + 1]), level: Array.from({ length: count }, (_, i) => i) };
  }
  return {
    edges: [[0, 1], ...PARALLEL.map((p): [number, number] => [1, p]), ...PARALLEL.map((p): [number, number] => [p, 5]), [5, 6], [6, 7]],
    // The parallel stages take the charge together.
    level: [0, 1, 2, 2, 2, 3, 4, 5],
  };
}

interface Wire {
  d: string;
  level: number;
}

/**
 * The build cycle as an architecture diagram: the stages are boxes (real text), the connections broken
 * lines in the site's lightning language, measured from the boxes so they follow any layout (a row of
 * columns on desktop, a column on phones). The charge runs through it once when the About bolt passes
 * the module (`data-pulse` on the module), each box lighting as it arrives; hovering runs it again.
 */
export function BuildFlow({ steps }: { steps: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [wires, setWires] = useState<Wire[]>([]);
  const [run, setRun] = useState<"a" | "b" | undefined>(undefined);
  const lastRun = useRef(0);
  const { level } = wiring(steps.length);
  // The diagram's layout (grid areas s0…s7) is drawn for eight stages; any other count sits in a row.
  const wired = steps.length === 8;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const { edges: links, level: levels } = wiring(steps.length);
    let frame = 0;
    const measure = () => {
      frame = 0;
      const origin = root.getBoundingClientRect();
      const boxes = Array.from(root.querySelectorAll<HTMLElement>("[data-stage]")).map((el) => {
        const r = el.getBoundingClientRect();
        return { l: r.left - origin.left, t: r.top - origin.top, r: r.right - origin.left, b: r.bottom - origin.top };
      });
      setWires(
        links.map(([a, b], k) => {
          const from = boxes[a];
          const to = boxes[b];
          // Beside it: edge to edge, across. Below it: bottom to top.
          const across = to.l >= from.r - 1;
          const p: Point = across ? [from.r, (from.t + from.b) / 2] : [(from.l + from.r) / 2, from.b];
          const q: Point = across ? [to.l, (to.t + to.b) / 2] : [(to.l + to.r) / 2, to.t];
          const length = Math.hypot(q[0] - p[0], q[1] - p[1]);
          return { d: toPath(jag(p, q, { seed: 23, salt: k + 1, cap: Math.min(3, length * 0.12), rough: 0.25, minSeg: 4 })), level: levels[a] };
        }),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    document.fonts.ready.then(schedule);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [steps.length]);

  // Hover: the charge runs again (switching between two copies of the animation restarts it), at most
  // once every couple of seconds. Not on touch.
  function replay(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    const now = performance.now();
    if (now - lastRun.current < 2400) return;
    lastRun.current = now;
    setRun((current) => (current === "b" ? "a" : "b"));
  }

  return (
    <div ref={ref} className={styles.flow} data-run={run} onPointerEnter={replay}>
      <svg className={styles.wires} aria-hidden="true">
        {wires.map((wire, i) => (
          <g key={i} style={cssVars({ "--i": wire.level })}>
            <path d={wire.d} className={styles.zap} />
            <path d={wire.d} pathLength={1} className={styles.pulse} />
          </g>
        ))}
      </svg>
      <ol className={cx(styles.stages, !wired && styles.plain)}>
        {steps.map((step, i) => (
          <li
            key={step}
            data-stage=""
            className={cx(styles.stage, i === steps.length - 1 && styles.final, wired && PARALLEL.includes(i) && styles.parallel)}
            style={cssVars({ "--i": level[i] }, wired ? { gridArea: `s${i}` } : undefined)}
          >
            <span className={styles.stageIndex} aria-hidden="true">
              {pad2(i + 1)}
            </span>
            <span className={styles.stageName}>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
