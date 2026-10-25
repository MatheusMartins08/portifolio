"use client";

import { useEffect, useRef, useState } from "react";
import { ON_HERO_KEY } from "@/lib/intro";
import { drawStrike, type Strike } from "./strike";
import styles from "./HeroIntro.module.css";

/**
 * Intro timeline, ms. `draw`: a pen writes the name, centred (A01; HeroName paces it and says how
 * long it takes in `data-written`). After a short `hold`, `strike`: the bolt falls onto it (A02), the
 * flash lands with it. `assemble`: the name slides to its place and the Hero builds up around it (A03),
 * the backdrop lines spread out from the name. `end`: the page is left calm.
 */
const TIMELINE = { hold: 180, assemble: 220, end: 1750 };

/** Any of these during the intro skips straight to the finished Hero. */
const SKIP_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

/**
 * Plays the opening whenever the gate in <head> (lib/intro.ts) has marked `<html data-intro="play">`:
 * the site opened, or reloaded on the Hero. Keeps the gate informed of where the visitor is (Hero on
 * screen or not), so a reload elsewhere on the page skips it. It only measures, places and switches states: `data-intro` goes
 * play → draw → strike → assemble → (removed), and every piece of the page styles itself from that
 * attribute. It also tells the backdrop (`hero:assemble` on the stage) when to spread its lines, or,
 * when skipped, to show them at once. Renders the strike and the flash, in a fixed layer.
 */
export function HeroIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [strike, setStrike] = useState<Strike | null>(null);

  // ---- where the visitor is: the Hero counts as on screen while at least 40% of it shows ----
  useEffect(() => {
    const stage = rootRef.current?.parentElement;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        try {
          sessionStorage.setItem(ON_HERO_KEY, entry.intersectionRatio >= 0.4 ? "1" : "0");
        } catch {}
      },
      { threshold: [0, 0.4] },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const stage = rootRef.current?.parentElement;
    if (!stage || html.dataset.intro !== "play") return;

    let alive = true;
    let over = false;
    const timers: number[] = [];
    const at = (ms: number, run: () => void) => timers.push(window.setTimeout(run, ms));
    const assemble = (instant: boolean) => stage.dispatchEvent(new CustomEvent("hero:assemble", { detail: { instant } }));

    const end = () => {
      if (over) return;
      over = true;
      SKIP_EVENTS.forEach((type) => window.removeEventListener(type, skip));
      delete html.dataset.intro;
      // The gate held the page at the top for the intro; reloads restore the scroll again.
      history.scrollRestoration = "auto";
      setStrike(null);
    };
    function skip() {
      if (over) return;
      timers.forEach((timer) => window.clearTimeout(timer));
      assemble(true);
      end();
    }

    const name = stage.querySelector<HTMLElement>("[data-intro-name]");
    if (!name) {
      skip();
      return;
    }
    SKIP_EVENTS.forEach((type) => window.addEventListener(type, skip, { passive: true }));

    document.fonts.ready.then(() => {
      if (!alive || over) return;
      // The name's final box (no transform yet): centre it on the viewport for the first beats.
      const box = name.getBoundingClientRect();
      const dx = window.innerWidth / 2 - (box.left + box.width / 2);
      const dy = window.innerHeight / 2 - (box.top + box.height / 2);
      name.style.setProperty("--intro-x", `${dx.toFixed(1)}px`);
      name.style.setProperty("--intro-y", `${dy.toFixed(1)}px`);
      // Lands just over the name, a little left of its middle.
      const top = window.innerHeight / 2 - box.height / 2;
      setStrike(
        drawStrike({
          width: window.innerWidth,
          height: window.innerHeight,
          x: window.innerWidth / 2 - box.width * 0.06,
          y: top + box.height * 0.12,
        }),
      );
      html.dataset.intro = "draw";
      const strikeAt = Number(name.dataset.written ?? 1500) + TIMELINE.hold;
      at(strikeAt, () => (html.dataset.intro = "strike"));
      at(strikeAt + TIMELINE.assemble, () => {
        html.dataset.intro = "assemble";
        assemble(false);
      });
      at(strikeAt + TIMELINE.end, end);
    });

    return () => {
      alive = false;
      timers.forEach((timer) => window.clearTimeout(timer));
      SKIP_EVENTS.forEach((type) => window.removeEventListener(type, skip));
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.intro} aria-hidden="true">
      {strike ? (
        <svg className={styles.strike} width={strike.width} height={strike.height} viewBox={`0 0 ${strike.width} ${strike.height}`}>
          {[strike.trunk, ...strike.twigs].map((d, i) => (
            <g key={i} className={i === 0 ? styles.trunk : styles.twig}>
              <path className={styles.glow} d={d} pathLength={1} />
              <path className={styles.core} d={d} pathLength={1} />
            </g>
          ))}
        </svg>
      ) : null}
      <div className={styles.flash} />
    </div>
  );
}
