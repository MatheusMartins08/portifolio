"use client";

import { useEffect, useRef, useState } from "react";
import { cssVars, cx } from "@/lib/cx";
import { ON_HERO_KEY } from "@/lib/intro";
import { drawStrike, type Strike } from "./strike";
import styles from "./HeroIntro.module.css";

/**
 * Intro timeline, ms. `draw`: a pen writes the name, centred (A01; HeroName paces it and says how
 * long it takes in `data-written`). `strike` (A02): the bolt's head falls for `lead` ms, by the name,
 * and hits the ground `hold` ms after the pen lifts — the bolt blazes and the screen blinks on that
 * instant (the CSS counts the same `lead`: 110ms). `assemble`, `assemble` ms after the impact: the name slides to its
 * place and the Hero builds up around it (A03), the backdrop lines spreading out from the name. `end`:
 * the page is left calm.
 */
const TIMELINE = { hold: 140, lead: 110, assemble: 300, end: 1750 };

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

    // The clock starts only once the page is really on screen: Chrome may load it ahead in a hidden or
    // prerendered tab (typing the address, a suggestion), and the intro would play to no one.
    const onScreen = () => !document.hidden && !(document as Document & { prerendering?: boolean }).prerendering;
    let stopWaiting = () => {};
    const shown = new Promise<void>((resolve) => {
      if (onScreen()) return resolve();
      const check = () => {
        if (!onScreen()) return;
        stopWaiting();
        resolve();
      };
      stopWaiting = () => {
        document.removeEventListener("visibilitychange", check);
        document.removeEventListener("prerenderingchange", check);
      };
      document.addEventListener("visibilitychange", check);
      document.addEventListener("prerenderingchange", check);
    });

    Promise.all([document.fonts.ready, shown]).then(() => {
      if (!alive || over) return;
      // The name's final box, and the point of it the bolt passes (both before any transform): centre
      // the name on the viewport for the first beats.
      const box = name.getBoundingClientRect();
      const target = name.querySelector("[data-strike-target]")?.getBoundingClientRect();
      const dx = window.innerWidth / 2 - (box.left + box.width / 2);
      const dy = window.innerHeight / 2 - (box.top + box.height / 2);
      name.style.setProperty("--intro-x", `${dx.toFixed(1)}px`);
      name.style.setProperty("--intro-y", `${dy.toFixed(1)}px`);
      // Falls by the name's highest point (HeroName marks it), where it will be once centred, on to the
      // ground; without the mark, by the top of the name, a little left of its middle.
      const x = target ? target.left + target.width / 2 + dx : window.innerWidth / 2 - box.width * 0.06;
      const y = target ? target.top + target.height / 2 + dy : window.innerHeight / 2 - box.height * 0.38;
      setStrike(drawStrike({ width: window.innerWidth, height: window.innerHeight, x, y }));
      html.dataset.intro = "draw";
      const impact = Number(name.dataset.written ?? 1500) + TIMELINE.hold;
      at(impact - TIMELINE.lead, () => (html.dataset.intro = "strike"));
      at(impact + TIMELINE.assemble, () => {
        html.dataset.intro = "assemble";
        assemble(false);
      });
      at(impact + TIMELINE.end, end);
    });

    return () => {
      alive = false;
      stopWaiting();
      timers.forEach((timer) => window.clearTimeout(timer));
      SKIP_EVENTS.forEach((type) => window.removeEventListener(type, skip));
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.intro} aria-hidden="true">
      {/* The blink first, the bolt over it, so the light never washes the bolt out. */}
      <div className={styles.flash} />
      {strike ? (
        <svg className={styles.strike} width={strike.width} height={strike.height} viewBox={`0 0 ${strike.width} ${strike.height}`}>
          <defs>
            <filter id="hero-strike-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
          </defs>
          {/* A soft glow along the channel and the first branches' bases, under the crisp lines. */}
          <g className={styles.glow} filter="url(#hero-strike-glow)">
            <path className={styles.trunk} d={strike.trunk} pathLength={1} />
            {strike.branches.map((branch, i) =>
              branch.level === 1 && !branch.tip ? (
                <path key={i} className={styles.branch} d={branch.d} pathLength={1} style={cssVars({ "--at": branch.at.toFixed(3) })} />
              ) : null,
            )}
          </g>
          <g className={styles.core}>
            <path className={styles.trunk} d={strike.trunk} pathLength={1} />
            {strike.branches.map((branch, i) => (
              <path
                key={i}
                className={cx(styles.branch, styles[`l${branch.level}`], branch.tip && styles.tip)}
                d={branch.d}
                pathLength={1}
                style={cssVars({ "--at": branch.at.toFixed(3) })}
              />
            ))}
          </g>
        </svg>
      ) : null}
    </div>
  );
}
