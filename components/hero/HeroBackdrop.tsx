"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { cx } from "@/lib/cx";
import { drawContours, type Box, type ContourPaths } from "./contours";
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

interface Drawing extends ContourPaths {
  width: number;
  height: number;
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

function Lines({ drawing, lit, glowId }: { drawing: Drawing; lit: boolean; glowId: string }) {
  const { width, height, thin, thick } = drawing;
  return (
    <svg className={styles.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {lit ? (
        <>
          <defs>
            <filter id={glowId} x="-5%" y="-5%" width="110%" height="110%">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
          </defs>
          <path className={styles.haloThin} d={thin} filter={`url(#${glowId})`} />
          <path className={styles.haloThick} d={thick} filter={`url(#${glowId})`} />
          <path className={styles.coreThin} d={thin} />
          <path className={styles.coreThick} d={thick} />
          <path className={styles.hotThin} d={thin} />
          <path className={styles.hotThick} d={thick} />
        </>
      ) : (
        <>
          {/* A light edge just below each line: the slight carved, 3D feel. */}
          <path className={styles.edgeThin} d={thin} transform="translate(.6 1)" />
          <path className={styles.edgeThick} d={thick} transform="translate(.8 1.3)" />
          <path className={styles.thin} d={thin} />
          <path className={styles.thick} d={thick} />
        </>
      )}
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
 */
export function HeroBackdrop({ phrases }: HeroBackdropProps) {
  const glow = useSyncExternalStore(subscribe, canGlow, () => false);
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<HTMLDivElement>(null);
  const glowId = `hero-glow-${useId().replace(/[^\w-]/g, "")}`;
  const phrasesKey = phrases.join("\n");

  // ---- drawing: measure the text, lay the lines around it ----
  useEffect(() => {
    const stage = rootRef.current?.parentElement;
    if (!stage) return;
    const list = phrasesKey.split("\n");
    let frame = 0;
    const draw = () => {
      frame = 0;
      const marked = Array.from(stage.querySelectorAll<HTMLElement>("[data-hole]"));
      const name = marked.find((el) => el.dataset.hole === "name");
      if (!name) return;
      const boxes = marked.map((el) =>
        layoutBox(el, stage, el.dataset.hole === "phrase" ? widestPhrase(el, list) : textWidth(el)),
      );
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      setDrawing({ width, height, ...drawContours({ width, height, boxes, unit: parseFloat(getComputedStyle(name).fontSize) }) });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(stage);
    // The text grows when the web fonts replace the fallbacks.
    document.fonts.ready.then(schedule);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [phrasesKey]);

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
    <div ref={rootRef} className={styles.backdrop} data-ready={drawing ? "" : undefined} aria-hidden="true">
      <div className={styles.layer}>{drawing ? <Lines drawing={drawing} lit={false} glowId={glowId} /> : null}</div>
      {glow ? (
        <div ref={litRef} className={cx(styles.layer, styles.lit)}>
          {drawing ? <Lines drawing={drawing} lit glowId={glowId} /> : null}
        </div>
      ) : null}
    </div>
  );
}
