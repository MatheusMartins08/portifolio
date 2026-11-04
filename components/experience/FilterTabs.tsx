"use client";

import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { prefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cx, pad2 } from "@/lib/cx";
import styles from "./FilterTabs.module.css";

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  /** Id of the element that names the tablist (the section heading). */
  labelledBy: string;
  /** Prefix of the tabpanel ids: each tab controls `${panelPrefix}${id}`. */
  panelPrefix: string;
  /** Prefix for tab ids, so the panel can point back at the active tab. */
  idPrefix: string;
  className?: string;
}

/** Typographic tabs with a white underline that slides; count in mono superscript. Arrows, Home/End. */
export function FilterTabs({ options, value, onChange, labelledBy, panelPrefix, idPrefix, className }: FilterTabsProps) {
  const root = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});

  useLayoutEffect(() => {
    const el = root.current;
    function place() {
      const tab = tabs.current[value];
      const bar = indicator.current;
      if (!tab || !bar) return;
      bar.style.width = `${tab.offsetWidth}px`;
      bar.style.transform = `translateX(${tab.offsetLeft}px)`;
    }
    /** Marks which edges hide tabs (narrow screens), so the CSS fades only those. */
    function edges() {
      if (!el) return;
      el.toggleAttribute("data-more-start", el.scrollLeft > 1);
      el.toggleAttribute("data-more-end", el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }
    function update() {
      place();
      edges();
    }
    update();
    const observer = new ResizeObserver(update);
    if (el) observer.observe(el);
    el?.addEventListener("scroll", edges, { passive: true });
    document.fonts?.ready.then(update);
    return () => {
      observer.disconnect();
      el?.removeEventListener("scroll", edges);
    };
  }, [value, options.length]);

  // A newly chosen tab cut off at an edge scrolls fully into view, clear of the fade.
  useEffect(() => {
    const el = root.current;
    const tab = tabs.current[value];
    if (!el || !tab || el.scrollWidth <= el.clientWidth) return;
    const fade = parseFloat(getComputedStyle(el).getPropertyValue("--tabs-fade")) || 0;
    const left = tab.offsetLeft - fade;
    const right = tab.offsetLeft + tab.offsetWidth + fade - el.clientWidth;
    const target = left < el.scrollLeft ? left : right > el.scrollLeft ? right : null;
    if (target === null) return;
    el.scrollTo({ left: target, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [value]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const ids = options.map((option) => option.id);
    const current = ids.indexOf(value);
    let next: string | null = null;
    if (event.key === "ArrowRight") next = ids[(current + 1) % ids.length];
    else if (event.key === "ArrowLeft") next = ids[(current - 1 + ids.length) % ids.length];
    else if (event.key === "Home") next = ids[0];
    else if (event.key === "End") next = ids[ids.length - 1];
    if (next === null) return;
    event.preventDefault();
    onChange(next);
    tabs.current[next]?.focus();
  }

  return (
    <div ref={root} className={cx(styles.tabs, className)} role="tablist" aria-labelledby={labelledBy} onKeyDown={onKeyDown}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            ref={(el) => {
              tabs.current[option.id] = el;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}${option.id}`}
            aria-selected={selected}
            aria-controls={`${panelPrefix}${option.id}`}
            tabIndex={selected ? 0 : -1}
            className={cx(styles.tab, selected && styles.on)}
            onClick={() => onChange(option.id)}
          >
            <span>{option.label}</span>
            {option.count != null ? <sup className={styles.count}>{pad2(option.count)}</sup> : null}
          </button>
        );
      })}
      <span className={styles.indicator} ref={indicator} aria-hidden="true" />
    </div>
  );
}
