"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { prefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cssVars, cx } from "@/lib/cx";
import { drawContours, type Box, type ContourLine } from "./contours";
import styles from "./HeroBackdrop.module.css";

const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";
/** A hovering fine pointer: the light follows it. Anything else (touch) gets pulses instead. */
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

const subscribeTo = (query: string) => (onChange: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const subscribeMotion = subscribeTo(MOTION_QUERY);
const subscribeHover = subscribeTo(HOVER_QUERY);
const motionOk = () => window.matchMedia(MOTION_QUERY).matches;
const fineHover = () => window.matchMedia(HOVER_QUERY).matches;

/** Share of the remaining distance the glow covers each frame: a soft trail behind the cursor. */
const EASE = 0.22;
/** Touch: how long a pulse stays lit (where the finger landed, or an ambient one), and how often an ambient one comes. */
const PULSE = { hold: 650, every: 7000, spread: 4000 };
/** Section variant: wait for the stage to settle before redrawing (a folder opening resizes it on every frame). */
const SETTLE = 200;
/** Section variant: the drawing's scale never passes this share of the stage's width. */
const UNIT_SHARE = 0.12;
/**
 * Section variant: the field is drawn this much taller than the stage (at least as tall again), and
 * only redrawn when the width changes. A folder opening makes the section taller: the lines already
 * there stay put, and the ones below come into view through the fade at the foot.
 */
const ROOM = 1400;

/**
 * Entrance, in ms from the moment the Hero assembles (HeroIntro): the energy of the strike spreads
 * out from the name. Lines are drawn from where they meet the name back out to the edges, the ones
 * wrapping the name first; twigs grow outwards once their line's head passes the fork.
 */
const INTRO = { spread: 600, jitter: 120, minDraw: 520, maxDraw: 950, minTwig: 220 };

interface Drawing {
  width: number;
  height: number;
  lines: ContourLine[];
}

/** Per line: when it starts drawing and how long it takes (ms, from the render that adds it). */
interface Intro {
  timing: Array<{ delay: number; draw: number }>;
  /** When the last stroke is in. */
  closed: number;
}

/** Stable value in [0, 1) per line pair, for the stagger's irregularity. */
const jitterOf = (pair: number) => (Math.imul(pair + 1, 0x9e3779b1) >>> 0) / 4294967296;

/** Inverse of the draw's ease-in-out (taken as smoothstep): the share of the time at which a share of the line is drawn. */
const easedAt = (share: number) => 0.5 - Math.sin(Math.asin(1 - 2 * share) / 3);

function planIntro({ lines }: Drawing): Intro {
  const main = lines.filter((line) => !line.branch);
  const farthest = Math.max(1, ...main.map((line) => line.reach));
  // Both halves of a line share a start and a duration, so they leave the name at the same instant.
  const pairs = new Map<number, { delay: number; draw: number }>();
  for (const line of main) {
    const known = pairs.get(line.pair);
    const delay = (line.reach / farthest) * INTRO.spread + (jitterOf(line.pair) - 0.5) * INTRO.jitter;
    const draw = Math.min(INTRO.maxDraw, Math.max(INTRO.minDraw, 380 + line.length * 0.3));
    pairs.set(line.pair, {
      delay: Math.max(0, known ? Math.min(known.delay, delay) : delay),
      draw: known ? Math.max(known.draw, draw) : draw,
    });
  }
  // A line is drawn from its end (by the name) back to its start: its head passes a fork at `at` (a
  // share from the start) at 1 − at of its time. The twig grows outwards from there, at its pace.
  const timing: Intro["timing"] = [];
  lines.forEach((line, i) => {
    if (!line.branch) {
      timing[i] = pairs.get(line.pair)!;
      return;
    }
    const parent = timing[line.branch.parent];
    timing[i] = {
      delay: parent.delay + parent.draw * easedAt(1 - line.branch.at),
      draw: Math.max(INTRO.minTwig, (parent.draw * line.length) / lines[line.branch.parent].length),
    };
  });
  const closed = Math.max(0, ...timing.map((t) => t.delay + t.draw));
  return { timing, closed };
}

/** Width of the widest phrase in the element's font (the phrase changes on its own; its space must not). */
function widestPhrase(el: HTMLElement, phrases: string[]): number {
  const style = getComputedStyle(el);
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return el.offsetWidth;
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  return Math.max(...phrases.map((phrase) => context.measureText(phrase).width));
}

/** Width of the element's text as laid out (a block is wider than its words). */
function textWidth(el: HTMLElement): number {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width;
}

/**
 * The element's text box in stage pixels. Position from layout offsets, so the Hero's entrance
 * transforms (the name sliding in) do not shift it; centred lines are centred in their element.
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
}

/** Class suffix per stroke weight: thick, thin, and the twigs that break off them. */
const WEIGHT_CLASS = { thick: "Thick", thin: "Thin", twig: "Twig" } as const;

/** Every path has pathLength 1, so the entrance can draw it with the dash offset, whatever its length. */
function Lines({ drawing, intro, lit }: LinesProps) {
  const { width, height, lines } = drawing;
  return (
    <svg className={styles.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {lines.map((line, i) => {
        const timing = intro?.timing[i];
        const size = WEIGHT_CLASS[line.weight];
        return (
          <g
            key={i}
            data-twig={line.branch ? "" : undefined}
            style={timing ? cssVars({ "--delay": `${timing.delay}ms`, "--draw": `${timing.draw}ms` }) : undefined}
          >
            {lit ? (
              <>
                {/* A wide, faint stroke under the core: the glow, without a blur filter. */}
                <path className={styles[`halo${size}`]} d={line.d} pathLength={1} />
                <path className={styles[`core${size}`]} d={line.d} pathLength={1} />
                <path className={styles[`hot${size}`]} d={line.d} pathLength={1} />
              </>
            ) : (
              <>
                <path className={styles[line.weight]} d={line.d} pathLength={1} />
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
  phrases?: string[];
  /**
   * "hero": the Hero's own backdrop, with its entrance. "section": the same field behind another
   * section — no entrance, clear spaces from `holes`, scaled by `unit`, redrawn once a resize settles.
   */
  variant?: "hero" | "section";
  /** Section variant: selector, in the stage, of the elements the lines keep clear of. */
  holes?: string;
  /** Section variant: the drawing's scale, px (the Hero uses its name's font size). */
  unit?: number;
  className?: string;
}

/**
 * A04 — Reactive Lightning Field. Fine, low-contrast lines behind the Hero, drawn around its text: the
 * greeting, name and phrase (marked `data-hole` in the stage) sit in a clear space the lines bend
 * around. A lit copy shows only through a small radial mask: it follows a mouse softly; on touch
 * screens it lights where the finger lands, and now and then on its own (only while the Hero is on
 * screen). Redrawn when the stage resizes or the fonts arrive, never on pointer moves.
 *
 * With the intro (HeroIntro), the field waits in the dark and spreads out from the name when the Hero
 * assembles (`hero:assemble` on the stage; `{ instant: true }` when skipped: shown at once). Without
 * it, the field just fades in.
 *
 * The "section" variant puts the same field behind another section's stage (Skills), without the entrance.
 */
export function HeroBackdrop({ phrases = [], variant = "hero", holes = "[data-hole]", unit = 110, className }: HeroBackdropProps) {
  const motion = useSyncExternalStore(subscribeMotion, motionOk, () => false);
  const hover = useSyncExternalStore(subscribeHover, fineHover, () => false);
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const [intro, setIntro] = useState<Intro | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<HTMLDivElement>(null);
  /** The clear spaces as last measured: ambient pulses keep off the text. */
  const boxesRef = useRef<Box[]>([]);
  const phrasesKey = phrases.join("\n");

  // ---- drawing: measure the text, lay the lines around it; the intro decides when it shows ----
  useEffect(() => {
    const root = rootRef.current;
    const stage = root?.parentElement;
    if (!root || !stage) return;
    const list = phrasesKey.split("\n");
    const section = variant === "section";
    /**
     * waiting: the intro is on, the field stays dark until the Hero assembles. pending: it assembled
     * before the first drawing was ready. playing: lines spreading. done: shown as is.
     */
    let phase: "waiting" | "pending" | "playing" | "done" =
      !section && !prefersReducedMotion() && document.documentElement.dataset.intro ? "waiting" : "done";
    let latest: Drawing | null = null;
    let size = "";
    let fontsReady = false;
    let active = true;
    let frame = 0;
    let settle = 0;
    /** Section variant: the field as last drawn (its height runs past the stage's). */
    let drawn = { width: 0, height: 0 };
    const draw = () => {
      frame = 0;
      // Measure the final text only (web fonts in), so the entrance is not redrawn under itself.
      if (!fontsReady || !active) return;
      const marked = Array.from(stage.querySelectorAll<HTMLElement>(holes));
      // Behind a section, the field runs edge to edge of the viewport, not just the stage's container.
      // Rounded up, so the right edge never passes the viewport (no sideways scroll).
      const shift = section ? Math.ceil(stage.getBoundingClientRect().left) : 0;
      if (section) {
        root.style.left = `${-shift}px`;
        root.style.width = `${document.documentElement.clientWidth}px`;
      }
      const width = section ? document.documentElement.clientWidth : stage.clientWidth;
      const stageHeight = stage.clientHeight;
      // Behind a section, a taller stage only shows more of the field: no new drawing, unless it outgrows it.
      if (section && width === drawn.width && stageHeight <= drawn.height) return;
      const height = section ? stageHeight + Math.max(ROOM, stageHeight) : stageHeight;
      let scale = Math.min(unit, width * UNIT_SHARE);
      if (!section) {
        const name = marked.find((el) => el.dataset.hole === "name");
        if (!name) return;
        scale = parseFloat(getComputedStyle(name).fontSize);
      }
      const boxes = marked.map((el) => {
        const box = layoutBox(el, stage, el.dataset.hole === "phrase" ? widestPhrase(el, list) : textWidth(el));
        return { ...box, x: box.x + shift };
      });
      boxesRef.current = boxes;
      const next: Drawing = { width, height, lines: drawContours({ width, height, boxes, unit: scale }) };
      const nextSize = `${width}x${height}`;
      drawn = { width, height };
      if (phase === "waiting") {
        latest = next;
        size = nextSize;
        return;
      }
      if (phase === "pending") {
        phase = "playing";
        setIntro(planIntro(next));
      } else if (phase === "playing" && nextSize !== size) {
        // Resized mid-entrance: show the finished lines instead.
        phase = "done";
        setIntro(null);
      }
      size = nextSize;
      setDrawing(next);
    };
    const schedule = () => {
      // Behind a section, a resize waits until the stage settles (the first drawing does not); a change
      // of height alone then costs nothing (see ROOM).
      if (section && size) {
        window.clearTimeout(settle);
        settle = window.setTimeout(() => {
          if (!frame) frame = requestAnimationFrame(draw);
        }, SETTLE);
        return;
      }
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const onAssemble = (event: Event) => {
      if (phase !== "waiting") return;
      const instant = (event as CustomEvent<{ instant?: boolean }>).detail?.instant;
      if (!latest) {
        // Not drawn yet: the first drawing will follow up.
        phase = instant ? "done" : "pending";
        return;
      }
      phase = instant ? "done" : "playing";
      if (!instant) setIntro(planIntro(latest));
      setDrawing(latest);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(stage);
    stage.addEventListener("hero:assemble", onAssemble);
    // Edge to edge: the viewport can change width while the stage (a capped container) does not.
    if (section) window.addEventListener("resize", schedule);
    document.fonts.ready.then(() => {
      fontsReady = true;
      schedule();
    });
    return () => {
      active = false;
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      stage.removeEventListener("hero:assemble", onAssemble);
      window.removeEventListener("resize", schedule);
    };
  }, [phrasesKey, variant, holes, unit]);

  // ---- entrance: once every stroke is in, the drawing settles to its plain state ----
  useEffect(() => {
    if (!intro) return;
    const timer = window.setTimeout(() => setIntro(null), intro.closed + 100);
    return () => window.clearTimeout(timer);
  }, [intro]);

  // ---- light: follows a mouse; on touch, pulses where the finger lands and now and then on its own ----
  useEffect(() => {
    const root = rootRef.current;
    const layer = litRef.current;
    // Behind a section, the whole section (edge to edge, like the field) catches the pointer.
    const stage = variant === "section" ? (root?.closest("section") ?? root?.parentElement) : root?.parentElement;
    if (!motion || !root || !layer || !stage) return;

    const place = (x: number, y: number) => {
      layer.style.setProperty("--mx", `${x.toFixed(1)}px`);
      layer.style.setProperty("--my", `${y.toFixed(1)}px`);
    };

    if (!hover) {
      let off = 0;
      let ambient = 0;
      let visible = false;
      const pulse = (x: number, y: number) => {
        place(x, y);
        layer.dataset.on = "";
        window.clearTimeout(off);
        off = window.setTimeout(() => delete layer.dataset.on, PULSE.hold);
      };
      const onDown = (event: PointerEvent) => {
        if (event.pointerType === "mouse") return;
        const rect = root.getBoundingClientRect();
        pulse(event.clientX - rect.left, event.clientY - rect.top);
      };
      // Somewhere on the field, off the text (a few tries, then anywhere).
      const wander = () => {
        const { width, height } = root.getBoundingClientRect();
        let x = 0;
        let y = 0;
        for (let i = 0; i < 8; i++) {
          x = width * (0.08 + 0.84 * Math.random());
          y = height * (0.1 + 0.8 * Math.random());
          if (!boxesRef.current.some((b) => x > b.x - 40 && x < b.x + b.w + 40 && y > b.y - 40 && y < b.y + b.h + 40)) break;
        }
        pulse(x, y);
      };
      const plan = () => {
        ambient = window.setTimeout(() => {
          if (visible && !document.hidden) wander();
          plan();
        }, PULSE.every + Math.random() * PULSE.spread);
      };
      const watch = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
      stage.addEventListener("pointerdown", onDown);
      if (variant === "hero") {
        watch.observe(stage);
        plan();
      }
      return () => {
        stage.removeEventListener("pointerdown", onDown);
        watch.disconnect();
        window.clearTimeout(off);
        window.clearTimeout(ambient);
        delete layer.dataset.on;
      };
    }

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
      place(pos.x, pos.y);
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
  }, [motion, hover, variant]);

  return (
    <div
      ref={rootRef}
      className={cx(styles.backdrop, variant === "section" && styles.section, className)}
      data-ready={drawing ? "" : undefined}
      data-intro={intro ? "" : undefined}
      aria-hidden="true"
    >
      <div className={cx(styles.layer, styles.off)}>{drawing ? <Lines drawing={drawing} intro={intro} lit={false} /> : null}</div>
      {motion ? (
        <div ref={litRef} className={cx(styles.layer, styles.lit)}>
          {drawing ? <Lines drawing={drawing} intro={intro} lit /> : null}
        </div>
      ) : null}
    </div>
  );
}
