"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cx } from "@/lib/cx";
import styles from "./AttractField.module.css";

/** Grid pitch and dash length at rest, px. */
const PITCH = 26;
const LENGTH = 9;
/** How far the cursor warms the dashes, px. */
const REACH = 200;
/** Within this distance of the target, px, the cursor hands the whole field over to it. */
const NEAR = 150;
/** Clear space around the text, px, and the soft margin over which the dashes grow back. */
const CLEAR = 10;
const SOFT = 30;
/** Colour steps from ink to terracota: one path per step, stroked once per frame. */
const STEPS = 8;
/** Idle sway (no cursor): amplitude in rad, speed in rad/ms. */
const SWAY = 0.32;
const SWAY_SPEED = 0.00045;

interface Dash {
  x: number;
  y: number;
  /** Current angle, rad. */
  a: number;
  phase: number;
  /** 0 inside the text's clear space, 1 away from it: scales the dash's length. */
  room: number;
}

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

type Rgb = [number, number, number];

/** Deterministic noise in [0, 1): the grid's jitter and the sway's phases are the same on every load. */
function noise(i: number, k: number): number {
  const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/** A colour token's value ("#ffffff") as RGB. */
function rgb(value: string): Rgb | null {
  const hex = value.trim().replace(/^#/, "");
  if (/^[0-9a-f]{6}$/i.test(hex)) return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
  if (/^[0-9a-f]{3}$/i.test(hex)) return Array.from(hex, (c) => parseInt(c + c, 16)) as Rgb;
  return null;
}

/** Distance from a point to a box, 0 inside it. */
function distanceTo(box: Box, x: number, y: number): number {
  return Math.hypot(Math.max(box.left - x, 0, x - box.right), Math.max(box.top - y, 0, y - box.bottom));
}

/** Angle difference folded into [-π, π]: the dashes always turn the short way. */
function turn(delta: number): number {
  return Math.atan2(Math.sin(delta), Math.cos(delta));
}

interface AttractFieldProps {
  /** Selector, in the stage, of the element the field is drawn to: the CTA. */
  target: string;
  /** Selector, in the stage, of the text the dashes keep clear of. */
  holes?: string;
  className?: string;
}

/**
 * A field of short hairline dashes behind the contact stage, like iron filings around a magnet. They turn
 * to point at the cursor, warming to terracota near it; as the cursor closes in on the CTA (or the CTA
 * takes keyboard focus) the whole field turns to the CTA and warms around it. With no cursor (touch, or
 * the mouse elsewhere) they point at the CTA and sway slowly. Nearer dashes turn faster, so changes ripple
 * outwards. Canvas, redrawn only while on screen and the tab is visible; with reduced motion it is drawn
 * once, still, pointing at the CTA. Decorative: hidden from assistive tech, never catches the pointer.
 */
export function AttractField({ target, holes = "h2, p", className }: AttractFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const stage = root?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !stage || !ctx) return;
    const section = root.closest("section") ?? stage;
    const button = stage.querySelector<HTMLElement>(target);
    const still = prefersReducedMotion();

    let width = 0;
    let height = 0;
    let dashes: Dash[] = [];
    /** The CTA's box and centre, in the canvas's coordinates. */
    let goal: Box & { x: number; y: number } = { left: 0, top: 0, right: 0, bottom: 0, x: 0, y: 0 };
    let colors: string[] = [];
    /** Last mouse position (client coordinates); null while the mouse is outside the section. */
    let pointer: { x: number; y: number } | null = null;
    /** Where it was last seen, so its warmth fades out there rather than vanishing. */
    let lastSeen: { x: number; y: number } | null = null;
    let focused = false;
    /** Eased 0–1: how much the CTA holds the field, and how present the cursor is. */
    let pull = 0;
    let presence = 0;
    let visible = false;
    let raf = 0;
    let layoutFrame = 0;
    let last = 0;
    let odd = false;

    function layout() {
      layoutFrame = 0;
      const box = canvas!.getBoundingClientRect();
      width = box.width;
      height = box.height;
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const style = getComputedStyle(canvas!);
      const ink = rgb(style.getPropertyValue("--fg")) ?? [242, 242, 242];
      const hot = rgb(style.getPropertyValue("--mark")) ?? [255, 255, 255];
      colors = Array.from({ length: STEPS }, (_, k) => {
        const w = k / (STEPS - 1);
        const [r, g, b] = ink.map((c, i) => Math.round(c + (hot[i] - c) * w));
        return `rgba(${r}, ${g}, ${b}, ${(0.24 + 0.68 * w).toFixed(3)})`;
      });

      const local = (r: DOMRect, pad: number): Box => ({
        left: r.left - box.left - pad,
        top: r.top - box.top - pad,
        right: r.right - box.left + pad,
        bottom: r.bottom - box.top + pad,
      });
      const target = button?.getBoundingClientRect();
      const targetBox = target ? local(target, 0) : { left: width / 2, top: height / 2, right: width / 2, bottom: height / 2 };
      goal = { ...targetBox, x: (targetBox.left + targetBox.right) / 2, y: (targetBox.top + targetBox.bottom) / 2 };
      // The text's own extent (a range over its contents), not its block: centred lines leave room aside.
      const clear = Array.from(stage!.querySelectorAll(holes), (node) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        return local(range.getBoundingClientRect(), CLEAR);
      });
      clear.push({ ...goal, left: goal.left - CLEAR, top: goal.top - CLEAR, right: goal.right + CLEAR, bottom: goal.bottom + CLEAR });

      // Staggered rows with a little jitter, every dash first pointing at the CTA.
      dashes = [];
      const cols = Math.ceil(width / PITCH) + 1;
      const rows = Math.ceil(height / PITCH) + 1;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          const x = col * PITCH + (row % 2 ? PITCH / 2 : 0) + (noise(i, 1) - 0.5) * 6;
          const y = row * PITCH + (noise(i, 2) - 0.5) * 6;
          const room = Math.min(1, ...clear.map((hole) => distanceTo(hole, x, y) / SOFT));
          if (room <= 0) continue;
          dashes.push({ x, y, a: Math.atan2(goal.y - y, goal.x - x), phase: noise(i, 3) * Math.PI * 2, room });
        }
      }
      if (still) paint(0, 1, true);
      else request();
    }

    /**
     * One frame: turn every dash towards its goal (by an amount scaled to the frame's length, `scale` =
     * 1 for 16ms; at once with `instant`), then stroke them.
     */
    function paint(now: number, scale: number, instant = false) {
      const box = canvas!.getBoundingClientRect();
      const at = pointer ? { x: pointer.x - box.left, y: pointer.y - box.top } : null;
      if (at) lastSeen = at;
      const cursor = at ?? lastSeen;

      // The CTA takes the field when the cursor nears or is on it, or when it has keyboard focus.
      let hold = focused ? 1 : 0;
      if (at) hold = Math.max(hold, Math.min(1, Math.max(0, 1 - distanceTo(goal, at.x, at.y) / NEAR)));
      pull += (hold - pull) * Math.min(1, 0.08 * scale);
      presence += ((at ? 1 : 0) - presence) * Math.min(1, 0.06 * scale);
      // The point they turn to: the cursor, drawn towards the CTA as it closes in; the CTA without one.
      const tx = at ? at.x + (goal.x - at.x) * pull : goal.x;
      const ty = at ? at.y + (goal.y - at.y) * pull : goal.y;
      const sway = still ? 0 : SWAY * (1 - presence) * (1 - pull);

      const paths = Array.from({ length: STEPS }, () => new Path2D());
      for (const dash of dashes) {
        const dx = tx - dash.x;
        const dy = ty - dash.y;
        const distance = Math.hypot(dx, dy);
        const aim = Math.atan2(dy, dx) + Math.sin(now * SWAY_SPEED + dash.phase) * sway;
        // Nearer dashes turn faster: a change ripples outwards.
        const rate = instant ? 1 : Math.min(1, (0.05 + 0.15 * Math.exp(-distance / 260)) * scale);
        dash.a += turn(aim - dash.a) * rate;

        let warm = 0;
        if (cursor && presence > 0.01) {
          const near = Math.max(0, 1 - Math.hypot(cursor.x - dash.x, cursor.y - dash.y) / REACH);
          warm = near * Math.sqrt(near) * presence;
        }
        warm = Math.max(warm, pull * (0.25 + 0.75 * Math.exp(-Math.hypot(goal.x - dash.x, goal.y - dash.y) / 240)));

        const half = (LENGTH * (1 + 0.7 * warm) * dash.room) / 2;
        if (half < 0.5) continue;
        const cos = Math.cos(dash.a);
        const sin = Math.sin(dash.a);
        // Warm dashes lean in a little, towards where they point.
        const cx = dash.x + cos * 3 * warm;
        const cy = dash.y + sin * 3 * warm;
        const path = paths[Math.min(STEPS - 1, Math.round(warm * (STEPS - 1)))];
        path.moveTo(cx - cos * half, cy - sin * half);
        path.lineTo(cx + cos * half, cy + sin * half);
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.lineCap = "round";
      paths.forEach((path, k) => {
        ctx!.strokeStyle = colors[k];
        ctx!.lineWidth = 1 + (0.4 * k) / (STEPS - 1);
        ctx!.stroke(path);
      });
    }

    function frame(now: number) {
      raf = 0;
      if (!visible || document.hidden) {
        last = 0;
        return;
      }
      // Idle (only the sway moving): every other frame is enough.
      const idle = !pointer && !focused && pull < 0.01 && presence < 0.01;
      odd = !odd;
      if (!idle || odd) {
        const dt = last ? Math.min(now - last, 64) : 16;
        last = now;
        paint(now, dt / 16);
      }
      raf = requestAnimationFrame(frame);
    }

    function request() {
      if (!still && !raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    function relayout() {
      if (!layoutFrame) layoutFrame = requestAnimationFrame(layout);
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY };
    };
    const onLeave = () => {
      pointer = null;
    };
    const onFocus = () => {
      focused = button?.matches(":focus-visible") ?? false;
    };
    const onBlur = () => {
      focused = false;
    };
    const onVisibility = () => request();

    const resize = new ResizeObserver(relayout);
    resize.observe(stage);
    const view = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        request();
      },
      { rootMargin: "120px 0px" },
    );
    view.observe(root);
    // The text's extent changes once the web fonts are in.
    document.fonts?.ready.then(relayout);
    if (!still) {
      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);
      button?.addEventListener("focus", onFocus);
      button?.addEventListener("blur", onBlur);
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      resize.disconnect();
      view.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(layoutFrame);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      button?.removeEventListener("focus", onFocus);
      button?.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [target, holes]);

  return (
    <div ref={rootRef} className={cx(styles.field, className)} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
