"use client";

import { useLayoutEffect, useRef, type KeyboardEvent } from "react";
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
  /** Id of the tabpanel the tabs control. */
  panelId: string;
  /** Prefix for tab ids, so the panel can point back at the active tab. */
  idPrefix: string;
  className?: string;
}

/** Typographic tabs with a terracota underline that slides; count in mono superscript. Arrows, Home/End. */
export function FilterTabs({ options, value, onChange, labelledBy, panelId, idPrefix, className }: FilterTabsProps) {
  const root = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});

  useLayoutEffect(() => {
    function place() {
      const tab = tabs.current[value];
      const bar = indicator.current;
      if (!tab || !bar) return;
      bar.style.width = `${tab.offsetWidth}px`;
      bar.style.transform = `translateX(${tab.offsetLeft}px)`;
    }
    place();
    const observer = new ResizeObserver(place);
    if (root.current) observer.observe(root.current);
    document.fonts?.ready.then(place);
    return () => observer.disconnect();
  }, [value, options.length]);

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
            aria-controls={panelId}
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
