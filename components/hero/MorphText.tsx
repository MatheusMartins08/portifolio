"use client";

import { useEffect, useMemo, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cx } from "@/lib/cx";
import styles from "./MorphText.module.css";

interface MorphTextProps {
  /** The first one is shown first (Fullstack Developer). Keep them short (~24 chars) to fit one line on phones. */
  phrases: string[];
  /** ms between morphs. */
  interval?: number;
  caret?: boolean;
  as?: "p" | "span" | "div";
  className?: string;
}

const SEPARATOR = "\u0001";
/** A lone regular space inside an inline-block collapses to zero width; the prototype uses a no-break space. */
const NBSP = " ";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Server-rendered first phrase, so the line is there before hydration (same markup the effect builds). */
function charsHtml(text: string): string {
  return Array.from(text)
    .map((ch) =>
      ch === " "
        ? `<span class="${styles.sp}" data-ch=" ">&nbsp;</span>`
        : `<span class="${styles.ch}" data-ch="${escapeHtml(ch)}">${escapeHtml(ch)}</span>`,
    )
    .join("");
}

interface Glyph {
  el: HTMLSpanElement;
  x: number;
  y: number;
  ch: string;
}

/**
 * Hero phrase. Letters shared by the current and the next phrase travel to their new place
 * (matched per character, nearest position, on an absolute overlay); leftovers rise out with blur,
 * new ones blur in. Screen readers get every phrase at once, with no announcements.
 * Waits for fonts, pauses while the tab is hidden; plain cross-fade with reduced motion.
 */
export function MorphText({ phrases, interval = 3400, caret = true, as: Tag = "p", className }: MorphTextProps) {
  const stageRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const key = phrases.join(SEPARATOR);
  const first = phrases[0] ?? "";
  const initialHtml = useMemo(() => ({ __html: charsHtml(first) }), [first]);

  useEffect(() => {
    const stage = stageRef.current;
    const line = lineRef.current;
    if (!stage || !line) return;
    const list = key.split(SEPARATOR);
    const running = new Set<Animation>();
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let index = 0;

    function track(animation: Animation): Animation {
      running.add(animation);
      animation.finished.catch(() => {}).finally(() => running.delete(animation));
      return animation;
    }

    function build(text: string): HTMLSpanElement[] {
      line!.textContent = "";
      return Array.from(text).map((ch) => {
        const span = document.createElement("span");
        span.className = ch === " " ? styles.sp : styles.ch;
        span.textContent = ch === " " ? NBSP : ch;
        span.dataset.ch = ch;
        line!.appendChild(span);
        return span;
      });
    }

    let current = build(list[0]);

    function measure(spans: HTMLSpanElement[]): Glyph[] {
      return spans.map((el) => ({ el, x: el.offsetLeft, y: el.offsetTop, ch: el.dataset.ch ?? "" }));
    }

    function swapPlain(text: string): Promise<void> {
      return new Promise((resolve) => {
        const out = track(line!.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" }));
        out.onfinish = () => {
          current = build(text);
          out.cancel();
          track(line!.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 }));
          resolve();
        };
      });
    }

    function morph(text: string): Promise<void> {
      if (prefersReducedMotion() || typeof line!.animate !== "function") return swapPlain(text);
      const fontSize = parseFloat(getComputedStyle(stage!).fontSize) || 24;
      const old = measure(current);

      const overlay = document.createElement("span");
      overlay.className = styles.overlay;
      for (const glyph of old) {
        if (glyph.ch === " ") {
          glyph.el.remove();
          continue;
        }
        glyph.el.style.left = `${glyph.x}px`;
        glyph.el.style.top = `${glyph.y}px`;
        overlay.appendChild(glyph.el);
      }
      line!.textContent = "";
      stage!.appendChild(overlay);

      current = build(text);
      const fresh = measure(current);
      const used = old.map(() => false);
      const pairs: Array<{ from: Glyph; to: Glyph }> = [];
      const enters: Glyph[] = [];

      for (const target of fresh) {
        if (target.ch === " ") continue;
        let best = -1;
        let bestDistance = Infinity;
        old.forEach((source, k) => {
          if (used[k] || source.ch !== target.ch) return;
          const distance = Math.abs(source.x - target.x) + Math.abs(source.y - target.y) * 2;
          if (distance < bestDistance) {
            bestDistance = distance;
            best = k;
          }
        });
        if (best >= 0) {
          used[best] = true;
          pairs.push({ from: old[best], to: target });
        } else {
          enters.push(target);
        }
      }
      const exits = old.filter((glyph, k) => !used[k] && glyph.ch !== " ");

      const animations: Animation[] = [];
      exits.forEach((glyph, i) => {
        animations.push(
          track(
            glyph.el.animate(
              [
                { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
                { opacity: 0, transform: "translateY(-0.4em)", filter: "blur(6px)" },
              ],
              { duration: 380, delay: i * 16, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" },
            ),
          ),
        );
      });
      pairs.forEach(({ from, to }, i) => {
        to.el.style.opacity = "0";
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const lift = (i % 2 ? -1 : 1) * fontSize * 0.22;
        animations.push(
          track(
            from.el.animate(
              [
                { transform: "translate(0px,0px)" },
                { transform: `translate(${dx / 2}px,${dy / 2 - lift}px)`, offset: 0.5 },
                { transform: `translate(${dx}px,${dy}px)` },
              ],
              { duration: 900, delay: 140 + i * 22, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" },
            ),
          ),
        );
      });
      enters.forEach((glyph, i) => {
        animations.push(
          track(
            glyph.el.animate(
              [
                { opacity: 0, transform: "translateY(0.4em)", filter: "blur(6px)" },
                { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
              ],
              { duration: 560, delay: 460 + i * 26, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" },
            ),
          ),
        );
      });

      return Promise.all(animations.map((animation) => animation.finished.catch(() => {}))).then(() => {
        pairs.forEach(({ to }) => (to.el.style.opacity = ""));
        overlay.remove();
        animations.forEach((animation) => animation.cancel());
      });
    }

    function step() {
      if (!alive) return;
      if (document.hidden) {
        timer = setTimeout(step, interval);
        return;
      }
      index = (index + 1) % list.length;
      morph(list[index]).then(() => {
        if (alive) timer = setTimeout(step, interval);
      });
    }

    function start() {
      if (alive && list.length > 1) timer = setTimeout(step, interval);
    }
    if (document.fonts?.ready) document.fonts.ready.then(start);
    else start();

    return () => {
      alive = false;
      clearTimeout(timer);
      running.forEach((animation) => animation.cancel());
      stage.querySelectorAll(`.${styles.overlay}`).forEach((node) => node.remove());
    };
  }, [key, interval]);

  return (
    <Tag className={cx(styles.morph, className)}>
      <span className="sr-only">{phrases.join(", ")}</span>
      <span className={styles.stage} ref={stageRef} aria-hidden="true">
        <span className={styles.line} ref={lineRef} dangerouslySetInnerHTML={initialHtml} />
        {caret ? <span className={styles.caret} /> : null}
      </span>
    </Tag>
  );
}
