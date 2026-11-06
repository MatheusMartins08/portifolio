"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { headAt, planBoard, type Board, type Rect } from "@/lib/geometry/circuit";
import styles from "./Circuit.module.css";

interface CircuitProps {
  /** Id of the section's sentence: the bolt comes down beside it, never over it. */
  sentenceId: string;
  /** Designators: the lightning rod, the end pad, and the mesh's silkscreen. */
  rod: string;
  ground: string;
  silk: string[];
}

/** The reading line, as a share of the viewport height from the top. */
const LINE = 0.62;
/** Length of the bright head at the energy's front, px. */
const TIP = 10;
/** How long the bolt takes to fall onto J1, ms (Circuit.module.css: --fall). */
const FALL = 480;
/** After the strike, how long until the bolt is simply there (its flare and afterglow done), ms. */
const SETTLE = 2400;
/** The energy's least speed as it first runs down the trace after the strike, px/s. */
const ENTRY = 1150;
/** How far back above the strike point the reading line goes before the bolt is taken away, px. */
const HYSTERESIS = 32;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const n1 = (v: number) => v.toFixed(1);

/** The board's drawing: the bolt, the trace with its features and marks, as SVG markup. */
function drawTrace(board: Board, width: number, height: number, rod: string, ground: string, bolt: string): string {
  const s = styles;
  let out = `<g class="${bolt}"><g class="${s.bFlicker}"><path class="${s.bGlow}" d="${board.bolt.trunk}"/>`;
  for (const b of board.bolt.branches) {
    out += `<path class="${s.bBranch}${b.tip ? ` ${s.tip}` : ""}" pathLength="1" style="--at:${b.at.toFixed(3)}" d="${b.d}"/>`;
  }
  out += `<path class="${s.bCore}" pathLength="1" d="${board.bolt.trunk}"/></g></g>`;

  // the stretch under the board: cut out of the top-layer trace, drawn dashed, lit by a growing clip
  const Ly = board.layer;
  if (Ly) {
    const big = `x="-400" y="-600" width="${width + 800}" height="${height + 1200}"`;
    const seg = `M${n1(Ly.A[0])} ${n1(Ly.A[1])}L${n1(Ly.B[0])} ${n1(Ly.B[1])}`;
    out += `<defs><mask id="sobre-trace-cut" maskUnits="userSpaceOnUse" ${big}><rect class="${s.maskKeep}" ${big}/><path class="${s.maskCut}" d="${seg}"/></mask>`;
    out += `<clipPath id="sobre-under-clip"><rect data-reach x="${n1(Ly.A[0] - 12)}" y="${n1(Math.min(Ly.A[1], Ly.B[1]))}" width="24" height="0"/></clipPath></defs>`;
    out += `<path class="${s.under}" d="${seg}"/><path class="${s.underLit}" clip-path="url(#sobre-under-clip)" d="${seg}"/>`;
  }

  out += `<g${Ly ? ' mask="url(#sobre-trace-cut)"' : ""}><path class="${s.track}" d="${board.d}"/>`;
  board.marks.forEach((m, i) => {
    if (m.kind === "spur") out += `<path class="${s.spur}" data-m="${i}" d="M${m.pts!.map(([x, y]) => `${x} ${y}`).join("L")}"/>`;
  });
  if (board.pair) {
    const d = board.pair.d;
    out += `<path class="${s.track}" d="${d}"/><path class="${s.glow}" data-pair pathLength="1" d="${d}" style="stroke-dasharray:1 1;stroke-dashoffset:1"/>`;
    out += `<path class="${s.core}" data-pair pathLength="1" d="${d}" style="stroke-dasharray:1 1;stroke-dashoffset:1"/>`;
  }
  const len = board.len;
  out += `<path class="${s.glow}" data-lit d="${board.d}" style="stroke-dasharray:${len} ${len};stroke-dashoffset:${len}"/>`;
  out += `<path class="${s.core}" data-lit d="${board.d}" style="stroke-dasharray:${len} ${len};stroke-dashoffset:${len}"/>`;
  out += `<path class="${s.head}" data-head d="${board.d}" style="stroke-dasharray:${TIP} ${len + TIP};opacity:0"/></g>`;

  board.marks.forEach((m, i) => {
    const [x, y] = m.at;
    switch (m.kind) {
      case "spur": {
        const [ex, ey] = m.pts![m.pts!.length - 1];
        out += `<circle class="${s.tee}" data-m="${i}" cx="${x}" cy="${y}" r="2.2"/><circle class="${s.via} ${s.small}" data-m="${i}" cx="${ex}" cy="${ey}" r="2.6"/>`;
        break;
      }
      case "ring":
        out += `<circle class="${s.ring}" data-m="${i}" cx="${n1(x)}" cy="${n1(y)}" r="4"/>`;
        break;
      case "rod": {
        const label = board.rodLabel === "below" ? `x="${n1(x)}" y="${n1(y + 23)}" text-anchor="middle"` : `x="${n1(x + 15)}" y="${n1(y + 3.5)}"`;
        out += `<g class="${s.rod}" data-m="${i}"><circle class="${s.rodSpark}" cx="${n1(x)}" cy="${n1(y)}" r="9"/><circle class="${s.rodSpark} ${s.late}" cx="${n1(x)}" cy="${n1(y)}" r="9"/>`;
        out += `<circle class="${s.rodRing}" cx="${n1(x)}" cy="${n1(y)}" r="8.5"/><circle class="${s.rodCore}" cx="${n1(x)}" cy="${n1(y)}" r="4"/></g>`;
        out += `<text class="${s.label}" data-m="${i}" ${label}>${esc(rod)}</text>`;
        break;
      }
      case "ground":
        out += `<rect class="${s.endPad}" data-m="${i}" x="${n1(x - 5.5)}" y="${n1(y - 5.5)}" width="11" height="11"/>`;
        out += `<text class="${s.label}" data-m="${i}" x="${n1(x + 14)}" y="${n1(y + 3.5)}">${esc(ground)}</text>`;
        break;
      case "via":
        out += m.big
          ? `<circle class="${s.via} ${s.layerVia}" data-m="${i}" cx="${n1(x)}" cy="${n1(y)}" r="4.2"/><circle class="${s.viaHole}" cx="${n1(x)}" cy="${n1(y)}" r="1.4"/>`
          : `<circle class="${s.via}" data-m="${i}" cx="${n1(x)}" cy="${n1(y)}" r="3"/>`;
        break;
      default:
        out += `<circle class="${s.pad}" data-m="${i}" cx="${n1(x)}" cy="${n1(y)}" r="4.5"/>`;
    }
  });
  return out;
}

function drawMesh(board: Board): string {
  let out = `<path d="${board.mesh.d}"/>`;
  for (const [x, y] of board.mesh.vias) out += `<circle cx="${x}" cy="${y}" r="2.4"/>`;
  for (const l of board.mesh.labels) out += `<text x="${l.x}" y="${l.y}">${esc(l.t)}</text>`;
  return out;
}

/**
 * The About's circuit board, drawn over the blocks (AboutBoard): a faint PCB mesh behind the text, and
 * over it the bolt, the trace and its marks, all measured from the real layout (lib/geometry/circuit).
 *
 * As the page scrolls:
 * - the reading line comes down beside the sentence: the bolt falls onto J1 (FALL), which charges; back
 *   above that point, the bolt is gone again. Scrolled on past the bolt before its fall is over (all of
 *   it off the top of the screen), the fall skips to its end;
 * - once J1 is charged, the energy runs down the trace to the reading line — at least ENTRY px/s, faster
 *   the further it has to go — and from then on simply follows it, both ways;
 * - every mark it reaches charges (and a block's pad lights its block, `data-lit`); scrolled back, they
 *   discharge. Text is dim before it is lit, never hidden.
 * With reduced motion everything is simply there, lit.
 */
export function Circuit({ sentenceId, rod, ground, silk }: CircuitProps) {
  const meshRef = useRef<SVGSVGElement>(null);
  const traceRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = traceRef.current;
    const meshSvg = meshRef.current;
    const boardEl = svg?.parentElement;
    if (!svg || !meshSvg || !boardEl) return;
    const blocks = Array.from(boardEl.querySelectorAll<HTMLElement>('[data-circuit="block"]'));

    /** struck: the bolt is there; charged: it has hit J1; entering: the energy still running to the reading line. */
    const state = {
      board: null as Board | null,
      depth: null as number | null,
      boardTop: 0,
      h: 0,
      struck: false,
      charged: false,
      settled: false,
      entering: false,
      on: new Set<number>(),
      timer: 0,
    };
    let reduce = prefersReducedMotion();
    let boltEl: SVGGElement | null = null;
    let lit: SVGPathElement[] = [];
    let pair: SVGPathElement[] = [];
    let head: SVGPathElement | null = null;
    let reach: SVGRectElement | null = null;

    // ---- measuring ----
    const rectOf = (r: DOMRect, b: DOMRect): Rect => ({ x: r.left - b.left, y: r.top - b.top, r: r.right - b.left, b: r.bottom - b.top });
    const linesOf = (els: Element[], b: DOMRect) => {
      const range = document.createRange();
      const out: Rect[] = [];
      for (const el of els) {
        range.selectNodeContents(el);
        for (const r of Array.from(range.getClientRects())) if (r.width > 0.5 && r.height > 0.5) out.push(rectOf(r, b));
      }
      return out;
    };

    // ---- marks ----
    const setOn = (i: number, on: boolean, animate: boolean) => {
      const m = state.board?.marks[i];
      if (!m || state.on.has(i) === on) return;
      if (on) state.on.add(i);
      else state.on.delete(i);
      if (m.block !== undefined) blocks[m.block]?.toggleAttribute("data-lit", on);
      svg.querySelectorAll<SVGElement>(`[data-m="${i}"]`).forEach((el) => {
        const still = on && !animate ? "none" : "";
        el.style.animation = still;
        el.querySelectorAll<SVGElement>("*").forEach((c) => (c.style.animation = still));
        el.classList.toggle(styles.on, on);
      });
    };
    const rodIndex = () => state.board?.marks.findIndex((m) => m.kind === "rod") ?? -1;

    // ---- the strike ----
    const settle = () => {
      state.settled = true;
      boltEl?.classList.add(styles.settled);
    };
    /** The bolt reaches J1: it charges and the energy starts down the trace. `skip`: the fall jumps to its end. */
    const charge = (skip: boolean) => {
      window.clearTimeout(state.timer);
      state.charged = true;
      state.entering = true;
      state.h = 0;
      setOn(rodIndex(), true, true);
      if (skip) settle();
      else state.timer = window.setTimeout(settle, SETTLE);
      request();
    };
    const strikeOn = () => {
      state.struck = true;
      state.settled = false;
      boltEl?.classList.remove(styles.settled);
      boltEl?.classList.add(styles.struck);
      window.clearTimeout(state.timer);
      state.timer = window.setTimeout(() => charge(false), FALL);
    };
    const strikeOff = () => {
      state.struck = state.charged = state.settled = state.entering = false;
      window.clearTimeout(state.timer);
      boltEl?.classList.remove(styles.struck, styles.settled);
      state.board?.marks.forEach((_, i) => setOn(i, false, false));
    };

    // ---- each frame ----
    /** Draws the energy for the reading line; true while it is still running to catch up. */
    const update = (dt: number) => {
      const board = state.board;
      if (!board || !head) return false;
      const depth = state.depth ?? -1e9;
      const rodY = board.points[0][1];
      if (!reduce) {
        // the bolt follows the scroll: it strikes as the reading line comes down beside the sentence
        const strikeAt = board.boltTop + 0.55 * (rodY - board.boltTop);
        if (!state.struck && depth >= strikeAt) strikeOn();
        else if (state.struck && depth < strikeAt - HYSTERESIS) strikeOff();
        // left behind — wholly off the top of the screen — while still falling: skip to the end of the fall
        if (state.struck && !state.charged && state.boardTop + board.boltBottom < 0) charge(true);
      }
      const target = reduce ? board.len : state.charged ? headAt(board, depth) : 0;
      let h = state.h;
      if (reduce || !state.charged) h = target;
      else if (state.entering) {
        const speed = Math.max(ENTRY, (target - h) * 4);
        h = target > h ? Math.min(target, h + speed * dt) : target;
        if (h >= target) state.entering = false;
      } else h = target;
      state.h = h;

      const off = String(board.len - h);
      lit.forEach((el) => (el.style.strokeDashoffset = off));
      head.style.strokeDashoffset = String(TIP - h);
      head.style.opacity = h > 1 && h < board.len - 1 ? "1" : "0";
      if (board.pair) {
        const f = Math.min(1, Math.max(0, (h - board.pair.La) / (board.pair.Lb - board.pair.La)));
        pair.forEach((el) => (el.style.strokeDashoffset = String(1 - f)));
      }
      if (board.layer && reach) {
        const f = Math.min(1, Math.max(0, (h - board.layer.La) / (board.layer.Lb - board.layer.La)));
        reach.setAttribute("height", String(f * Math.abs(board.layer.B[1] - board.layer.A[1])));
      }
      if (state.charged) board.marks.forEach((m, i) => m.kind !== "rod" && setOn(i, h >= m.L - 0.5, !reduce));
      return state.entering;
    };

    let frame = 0;
    let then = 0;
    const tick = (now: number) => {
      frame = 0;
      const dt = then ? Math.min(0.05, (now - then) / 1000) : 1 / 60;
      then = now;
      state.boardTop = boardEl.getBoundingClientRect().top;
      const goal = window.innerHeight * LINE - state.boardTop;
      const d = state.depth;
      state.depth = d === null || Math.abs(goal - d) < 0.5 ? goal : d + (goal - d) * 0.15;
      const running = update(dt);
      if (state.depth !== goal || running) frame = requestAnimationFrame(tick);
      else then = 0;
    };
    function request() {
      if (!frame) frame = requestAnimationFrame(tick);
    }

    // ---- drawing, from the measured layout ----
    const layout = () => {
      reduce = prefersReducedMotion();
      const b = boardEl.getBoundingClientRect();
      const sentence = document.getElementById(sentenceId);
      const board = planBoard({
        width: boardEl.clientWidth,
        height: boardEl.clientHeight,
        text: linesOf(Array.from(boardEl.querySelectorAll('[data-circuit="title"], [data-circuit="text"]')), b),
        sentence: sentence ? linesOf([sentence], b) : [],
        blocks: blocks.map((el) => {
          const own = linesOf([el], b);
          return {
            box: rectOf(el.getBoundingClientRect(), b),
            title: linesOf(Array.from(el.querySelectorAll('[data-circuit="title"]')), b),
            top: Math.min(...own.map((r) => r.y)),
            bottom: Math.max(...own.map((r) => r.b)),
          };
        }),
        silk,
      });
      if (!board) return;
      if (process.env.NODE_ENV !== "production" && board.clearance < (board.mobile ? 12 : 18) - 6) {
        console.warn(`About circuit: the trace comes within ${board.clearance.toFixed(1)}px of the text`);
      }
      if (reduce) state.struck = state.charged = state.settled = true;
      const boltClass = [styles.bolt, state.struck && styles.struck, state.settled && styles.settled].filter(Boolean).join(" ");
      for (const el of [svg, meshSvg]) {
        el.setAttribute("width", String(boardEl.clientWidth));
        el.setAttribute("height", String(boardEl.clientHeight));
      }
      svg.innerHTML = drawTrace(board, boardEl.clientWidth, boardEl.clientHeight, rod, ground, boltClass);
      meshSvg.innerHTML = drawMesh(board);
      boltEl = svg.querySelector<SVGGElement>(`.${styles.bolt}`);
      lit = Array.from(svg.querySelectorAll<SVGPathElement>("[data-lit]"));
      pair = Array.from(svg.querySelectorAll<SVGPathElement>("[data-pair]"));
      head = svg.querySelector<SVGPathElement>("[data-head]");
      reach = svg.querySelector<SVGRectElement>("[data-reach]");

      // the marks are new: put back what was on, without replaying the charge
      const was = Array.from(state.on);
      state.on.clear();
      blocks.forEach((el) => el.removeAttribute("data-lit"));
      state.board = board;
      if (state.charged) {
        was.forEach((i) => setOn(i, true, false));
        setOn(rodIndex(), true, false);
      }
      update(0);
    };

    // ---- listening: only while the board is near the screen ----
    const onScroll = () => request();
    let listening = false;
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      if (on) {
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    };
    const near = new IntersectionObserver(
      ([entry]) => {
        listen(entry.isIntersecting);
        request();
      },
      { rootMargin: "50% 0px" },
    );
    near.observe(boardEl);

    // re-plan when the layout changes (a resize, the fonts): at most once per frame, and settled for a beat
    let pending = 0;
    let rest = 0;
    const relayout = () => {
      window.clearTimeout(rest);
      rest = window.setTimeout(() => {
        cancelAnimationFrame(pending);
        pending = requestAnimationFrame(() => {
          layout();
          request();
        });
      }, 80);
    };
    const sized = new ResizeObserver(relayout);
    sized.observe(boardEl);
    document.fonts?.ready.then(relayout);
    layout();
    request();

    return () => {
      near.disconnect();
      sized.disconnect();
      listen(false);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(pending);
      window.clearTimeout(rest);
      window.clearTimeout(state.timer);
    };
  }, [sentenceId, rod, ground, silk]);

  return (
    <>
      <svg ref={meshRef} className={styles.mesh} aria-hidden="true" focusable="false" />
      <svg ref={traceRef} className={styles.circuit} aria-hidden="true" focusable="false" />
    </>
  );
}
