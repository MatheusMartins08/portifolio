"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { prefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cssVars, cx } from "@/lib/cx";
import { drawContours, type Box, type ContourLine } from "./contours";
import styles from "./HeroBackdrop.module.css";

/** Only a hovering fine pointer gets the lit layer, and only when motion is welcome. */
const GLOW_QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(GLOW_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const canGlow = () => window.matchMedia(GLOW_QUERY).matches;

/** Share of the remaining distance the glow covers each frame: a soft trail behind the cursor. */
const EASE = 0.22;

/**
 * Entrance, in ms. The lines start drawing once the rest of the Hero is nearly in (counted from the
 * start of the page load), then: circuit closes → short pulse → the "Matheus" sweep → the "Freitas" wave.
 */
const INTRO = {
  /** Lines start drawing (from navigation start). */
  linesAt: 1200,
  /** Outer lines first, the ones wrapping the name last. */
  spread: 700,
  /** Lines entering from the sides and the bottom follow those from the top. */
  sideLag: 120,
  bottomLag: 240,
  jitter: 120,
  minDraw: 650,
  maxDraw: 1050,
  /** After the last connection. */
  pulseAfter: 150,
  pulse: 360,
  /** From the pulse to the sweep across "Matheus" (the hover's own transition, --mf-dur-4). */
  sweepAfter: 250,
  sweep: 820,
  /** The wave over "Freitas" starts near the end of the sweep; one letter every `step`, each held `hold`. */
  waveAfter: 560,
  step: 80,
  hold: 260,
  /** Letting the last letter settle (its return transition, --mf-dur-3). */
  settle: 520,
};

interface Drawing {
  width: number;
  height: number;
  lines: ContourLine[];
}

/** Per line: when it starts drawing and how long it takes (ms, from the render that adds it). */
interface Intro {
  timing: Array<{ delay: number; draw: number }>;
  /** When the last line connects. */
  closed: number;
}

/** Stable value in [0, 1) per line pair, for the stagger's irregularity. */
const jitterOf = (pair: number) => (Math.imul(pair + 1, 0x9e3779b1) >>> 0) / 4294967296;

function planIntro({ height, lines }: Drawing, offset: number): Intro {
  const farthest = Math.max(1, ...lines.map((line) => line.reach));
  // Both halves of a line share a start and a duration, so they meet at the same instant.
  const pairs = new Map<number, { delay: number; draw: number }>();
  for (const line of lines) {
    const known = pairs.get(line.pair);
    const y = line.start[1];
    const lag = y <= 2 ? 0 : y >= height - 2 ? INTRO.bottomLag : INTRO.sideLag;
    const delay =
      offset + (1 - line.reach / farthest) * INTRO.spread + lag + (jitterOf(line.pair) - 0.5) * INTRO.jitter;
    const draw = Math.min(INTRO.maxDraw, Math.max(INTRO.minDraw, 450 + line.length * 0.35));
    pairs.set(line.pair, {
      delay: Math.max(offset, known ? Math.min(known.delay, delay) : delay),
      draw: known ? Math.max(known.draw, draw) : draw,
    });
  }
  const timing = lines.map((line) => pairs.get(line.pair)!);
  return { timing, closed: Math.max(0, ...timing.map((t) => t.delay + t.draw)) };
}

/** Width of the widest phrase in the element's font (the phrase changes on its own; its space must not). */
function widestPhrase(el: HTMLElement, phrases: string[]): number {
  const style = getComputedStyle(el);
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return el.offsetWidth;
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  // + the caret after the text.
  return Math.max(...phrases.map((phrase) => context.measureText(phrase).width)) + parseFloat(style.fontSize) * 0.3;
}

/** Width of the element's text as laid out (a block is wider than its words). */
function textWidth(el: HTMLElement): number {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width;
}

/**
 * The element's text box in stage pixels. Position from layout offsets, so the Hero's entrance
 * transforms (text rising in) do not shift it; centred lines are centred in their element.
 */
function layoutBox(el: HTMLElement, stage: HTMLElement, width: number): Box {
  let x = 0;
  let y = 0;
  for (let node: HTMLElement | null = el; node && node !== stage; node = node.offsetParent as HTMLElement | null) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  if (getComputedStyle(el).textAlign === "center") x += (el.offsetWidth - width) / 2;
  return { x, y, w: width, h: el.offsetHeight };
}

interface LinesProps {
  drawing: Drawing;
  intro: Intro | null;
  lit: boolean;
  glowId: string;
}

/** Every path has pathLength 1, so the entrance can draw it with the dash offset, whatever its length. */
function Lines({ drawing, intro, lit, glowId }: LinesProps) {
  const { width, height, lines } = drawing;
  return (
    <svg className={styles.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {lit ? (
        <defs>
          <filter id={glowId} x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
        </defs>
      ) : null}
      {lines.map((line, i) => {
        const timing = intro?.timing[i];
        const size = line.thick ? "Thick" : "Thin";
        return (
          <g key={i} style={timing ? cssVars({ "--delay": `${timing.delay}ms`, "--draw": `${timing.draw}ms` }) : undefined}>
            {lit ? (
              <>
                <path className={styles[`halo${size}`]} d={line.d} pathLength={1} filter={`url(#${glowId})`} />
                <path className={styles[`core${size}`]} d={line.d} pathLength={1} />
                <path className={styles[`hot${size}`]} d={line.d} pathLength={1} />
              </>
            ) : (
              <>
                {/* A light edge just below each line: the slight carved, 3D feel. */}
                <path
                  className={styles[`edge${size}`]}
                  d={line.d}
                  pathLength={1}
                  transform={line.thick ? "translate(.8 1.3)" : "translate(.6 1)"}
                />
                <path className={styles[line.thick ? "thick" : "thin"]} d={line.d} pathLength={1} />
                {/* The brighter head that travels with the line while it is being drawn. */}
                {timing ? <path className={cx(styles.tip, styles[`tip${size}`])} d={line.d} pathLength={1} /> : null}
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

interface HeroBackdropProps {
  /** Every phrase the Hero cycles through: the clear space is sized for the widest. */
  phrases: string[];
}

/**
 * Lines behind the Hero, drawn around its text: the greeting, name and phrase (marked `data-hole` in the
 * stage) sit in a clear space the lines bend around. Dimmed lines always; a lit copy revealed through a
 * small radial mask that follows the mouse. Redrawn when the stage resizes or the fonts arrive, never on
 * mouse moves: the pointer goes straight to CSS custom properties from one requestAnimationFrame.
 *
 * Entrance (once, with motion allowed): the lines are drawn from the edges towards the name and meet
 * there; then a short pulse, and the name's own hover effects play once, set off through
 * `data-energized` on the elements marked `data-energy` (sweep on "Matheus", wave on the "Freitas" letters).
 */
export function HeroBackdrop({ phrases }: HeroBackdropProps) {
  const glow = useSyncExternalStore(subscribe, canGlow, () => false);
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const [intro, setIntro] = useState<Intro | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<HTMLDivElement>(null);
  const glowId = `hero-glow-${useId().replace(/[^\w-]/g, "")}`;
  const phrasesKey = phrases.join("\n");

  // ---- drawing: measure the text, lay the lines around it; the first drawing also plans the entrance ----
  useEffect(() => {
    const stage = rootRef.current?.parentElement;
    if (!stage) return;
    const list = phrasesKey.split("\n");
    /** The entrance plays once: before the first drawing, while playing, then never again. */
    let phase: "pending" | "playing" | "done" = prefersReducedMotion() ? "done" : "pending";
    let size = "";
    let fontsReady = false;
    let active = true;
    let frame = 0;
    const draw = () => {
      frame = 0;
      // Measure the final text only (web fonts in), so the entrance is not redrawn under itself.
      if (!fontsReady || !active) return;
      const marked = Array.from(stage.querySelectorAll<HTMLElement>("[data-hole]"));
      const name = marked.find((el) => el.dataset.hole === "name");
      if (!name) return;
      const boxes = marked.map((el) =>
        layoutBox(el, stage, el.dataset.hole === "phrase" ? widestPhrase(el, list) : textWidth(el)),
      );
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const next: Drawing = {
        width,
        height,
        lines: drawContours({ width, height, boxes, unit: parseFloat(getComputedStyle(name).fontSize) }),
      };
      const nextSize = `${width}x${height}`;
      if (phase === "pending") {
        phase = "playing";
        setIntro(planIntro(next, Math.max(0, INTRO.linesAt - performance.now())));
      } else if (phase === "playing" && nextSize !== size) {
        // Resized mid-entrance: show the finished lines instead.
        phase = "done";
        setIntro(null);
      }
      size = nextSize;
      setDrawing(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(stage);
    document.fonts.ready.then(() => {
      fontsReady = true;
      schedule();
    });
    return () => {
      active = false;
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [phrasesKey]);

  // ---- entrance, after the lines connect: pulse → "Matheus" sweep → "Freitas" wave ----
  useEffect(() => {
    const root = rootRef.current;
    const stage = root?.parentElement;
    if (!intro || !root || !stage) return;
    const timers: number[] = [];
    const at = (ms: number, run: () => void) => timers.push(window.setTimeout(run, ms));
    const sweep = Array.from(stage.querySelectorAll<HTMLElement>('[data-energy="sweep"]'));
    const wave = Array.from(stage.querySelectorAll<HTMLElement>('[data-energy="wave"]'));

    const pulseAt = intro.closed + INTRO.pulseAfter;
    const sweepAt = pulseAt + INTRO.sweepAfter;
    const waveAt = sweepAt + INTRO.waveAfter;
    const doneAt = waveAt + wave.length * INTRO.step + INTRO.hold + INTRO.settle;

    at(pulseAt, () => (root.dataset.pulse = ""));
    at(pulseAt + INTRO.pulse, () => delete root.dataset.pulse);
    at(sweepAt, () => sweep.forEach((el) => (el.dataset.energized = "")));
    // Off again once across: like the mouse leaving, the sheen snaps back unseen.
    at(sweepAt + INTRO.sweep + 40, () => sweep.forEach((el) => delete el.dataset.energized));
    wave.forEach((el, i) => {
      at(waveAt + i * INTRO.step, () => (el.dataset.energized = ""));
      at(waveAt + i * INTRO.step + INTRO.hold, () => delete el.dataset.energized);
    });
    at(doneAt, () => setIntro(null));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      delete root.dataset.pulse;
      [...sweep, ...wave].forEach((el) => delete el.dataset.energized);
    };
  }, [intro]);

  // ---- glow: follows the mouse over the whole stage ----
  useEffect(() => {
    const root = rootRef.current;
    const layer = litRef.current;
    const stage = root?.parentElement;
    if (!glow || !root || !layer || !stage) return;

    let frame = 0;
    /** Last mouse position (client coordinates); null while the mouse is outside the stage. */
    let pointer: { x: number; y: number } | null = null;
    /** Glow centre, relative to the backdrop. */
    const pos = { x: 0, y: 0 };
    let snap = true;

    const tick = () => {
      frame = 0;
      if (!pointer) return;
      const rect = root.getBoundingClientRect();
      const x = pointer.x - rect.left;
      const y = pointer.y - rect.top;
      if (snap) {
        pos.x = x;
        pos.y = y;
        snap = false;
      } else {
        pos.x += (x - pos.x) * EASE;
        pos.y += (y - pos.y) * EASE;
      }
      layer.style.setProperty("--mx", `${pos.x.toFixed(1)}px`);
      layer.style.setProperty("--my", `${pos.y.toFixed(1)}px`);
      if (Math.abs(x - pos.x) > 0.5 || Math.abs(y - pos.y) > 0.5) frame = requestAnimationFrame(tick);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      // First move inside: the glow starts right under the cursor and fades in there.
      if (!pointer) {
        snap = true;
        layer.dataset.on = "";
      }
      pointer = { x: event.clientX, y: event.clientY };
      request();
    };
    // Leaving: the glow fades out where it is, it does not stay frozen.
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer = null;
      delete layer.dataset.on;
    };
    // Scrolling moves the lines under a still mouse.
    const onScroll = () => {
      if (pointer) request();
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      delete layer.dataset.on;
    };
  }, [glow]);

  return (
    <div
      ref={rootRef}
      className={styles.backdrop}
      data-ready={drawing ? "" : undefined}
      data-intro={intro ? "" : undefined}
      aria-hidden="true"
    >
      <div className={cx(styles.layer, styles.off)}>
        {drawing ? <Lines drawing={drawing} intro={intro} lit={false} glowId={glowId} /> : null}
      </div>
      {glow ? (
        <div ref={litRef} className={cx(styles.layer, styles.lit)}>
          {drawing ? <Lines drawing={drawing} intro={intro} lit glowId={glowId} /> : null}
        </div>
      ) : null}
    </div>
  );
}
