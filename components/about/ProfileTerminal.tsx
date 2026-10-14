"use client";

import { Fragment, useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { useInView } from "@/hooks/useInView";
import { prefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cssVars, cx, pad2 } from "@/lib/cx";
import styles from "./ProfileTerminal.module.css";

export interface TerminalEntry {
  key: string;
  value: string;
}

interface ProfileTerminalProps {
  /** Tab name: "matheus.profile". */
  title: string;
  /** Path on the right of the bar: "~/portfolio/about". */
  path: string;
  /** Footer prompt: "~/matheus". */
  prompt: string;
  /** The command line: "cat sobre.md". */
  command: string;
  /** Short frontmatter (name, role, since, study). */
  entries: TerminalEntry[];
  /** The full About text, one paragraph per item — shown whole, never summarised. */
  paragraphs: string[];
  /** Exact phrases painted terracota-ink (at most six: facts and the philosophy). */
  highlight: string[];
  /** Footer status: "5 parágrafos · UTF-8 · pt-BR". */
  status: string;
  /** Max tilt in degrees. */
  maxTilt?: number;
  className?: string;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Wraps the earliest occurrence of any highlight phrase in <mark>, repeatedly. */
function markText(text: string, highlight: string[]): ReactNode {
  const out: ReactNode[] = [];
  let rest = text;
  while (rest) {
    let at = -1;
    let phrase = "";
    for (const candidate of highlight) {
      const i = candidate ? rest.indexOf(candidate) : -1;
      if (i >= 0 && (at < 0 || i < at)) {
        at = i;
        phrase = candidate;
      }
    }
    if (at < 0) {
      out.push(rest);
      break;
    }
    if (at > 0) out.push(rest.slice(0, at));
    out.push(
      <mark key={out.length} className={styles.hl}>
        {phrase}
      </mark>,
    );
    rest = rest.slice(at + phrase.length);
  }
  return out.map((part, i) => <Fragment key={i}>{part}</Fragment>);
}

/**
 * "matheus.profile": the About text opened as a markdown file in a beige editor — command,
 * frontmatter and every paragraph numbered like a line. Tilts up to `maxTilt`° following the cursor
 * (rAF interpolation, factor 0.085) with layers on translateZ, a sheen and a shadow that react;
 * eases back on leave. Off on touch and with reduced motion. Paragraphs enter in sequence.
 */
export function ProfileTerminal({
  title,
  path,
  prompt,
  command,
  entries,
  paragraphs,
  highlight,
  status,
  maxTilt = 6,
  className,
}: ProfileTerminalProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { threshold: 0.1 });

  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!stage || !card || prefersReducedMotion()) return;
    let targetX = 0;
    let targetY = 0;
    let rotX = 0;
    let rotY = 0;
    let targetPX = 0.5;
    let targetPY = 0.5;
    let pX = 0.5;
    let pY = 0.5;
    let raf = 0;

    function frame() {
      rotY += (targetX - rotY) * 0.085;
      rotX += (targetY - rotX) * 0.085;
      pX += (targetPX - pX) * 0.085;
      pY += (targetPY - pY) * 0.085;
      card!.style.setProperty("--rx", `${rotX.toFixed(3)}deg`);
      card!.style.setProperty("--ry", `${rotY.toFixed(3)}deg`);
      card!.style.setProperty("--px", `${(pX * 100).toFixed(1)}%`);
      card!.style.setProperty("--py", `${(pY * 100).toFixed(1)}%`);
      card!.style.setProperty("--sx", `${(-rotY * 2).toFixed(2)}px`);
      card!.style.setProperty("--sy", `${(28 + rotX * 2).toFixed(2)}px`);
      const moving =
        Math.abs(targetX - rotY) > 0.005 ||
        Math.abs(targetY - rotX) > 0.005 ||
        Math.abs(targetPX - pX) > 0.001 ||
        Math.abs(targetPY - pY) > 0.001;
      raf = moving ? requestAnimationFrame(frame) : 0;
    }
    function kick() {
      if (!raf) raf = requestAnimationFrame(frame);
    }
    function onMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const rect = stage!.getBoundingClientRect();
      targetPX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      targetPY = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      targetX = (targetPX - 0.5) * 2 * maxTilt;
      targetY = -(targetPY - 0.5) * 2 * maxTilt;
      card!.classList.add(styles.tilting);
      kick();
    }
    function onLeave() {
      targetX = 0;
      targetY = 0;
      targetPX = 0.5;
      targetPY = 0.5;
      card!.classList.remove(styles.tilting);
      kick();
    }

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [maxTilt]);

  return (
    <div ref={stageRef} className={cx(styles.stage, inView && styles.in, className)}>
      <div ref={cardRef} className={styles.term}>
        <div className={styles.bar}>
          <span className={styles.tab}>
            <Icon name="file" size={13} className={styles.tabIcon} />
            {title}
            <span className={styles.saved} aria-hidden="true" />
          </span>
          <span className={styles.path}>{path}</span>
        </div>

        <div className={styles.body}>
          <p className={styles.cmd}>
            <span className={styles.gt} aria-hidden="true">
              &gt;
            </span>
            {command}
          </p>
          {entries.length ? (
            <dl className={styles.front}>
              <span className={styles.fence} aria-hidden="true">
                ---
              </span>
              {entries.map((entry) => (
                <div key={entry.key} className={styles.fm}>
                  <dt>{entry.key}:</dt>
                  <dd>{entry.value}</dd>
                </div>
              ))}
              <span className={styles.fence} aria-hidden="true">
                ---
              </span>
            </dl>
          ) : null}
          <div className={styles.doc}>
            {paragraphs.map((text, i) => (
              <div
                key={i}
                className={cx(styles.para, i === paragraphs.length - 1 && styles.last)}
                style={cssVars({ "--i": i })}
              >
                <span className={styles.ln} aria-hidden="true">
                  {pad2(i + 1)}
                </span>
                <p>{markText(text, highlight)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.foot} aria-hidden="true">
          <span className={styles.prompt}>
            <span>{prompt}</span>
            <b>$</b>
            <span className={styles.caret} />
          </span>
          <span className={styles.status}>{status}</span>
        </div>
        <span className={styles.sheen} aria-hidden="true" />
      </div>
    </div>
  );
}
