"use client";

import { useEffect, useId, useRef, useState } from "react";
import { EdgeLight } from "@/components/ui/EdgeLight";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cssVars, cx, pad2 } from "@/lib/cx";
import { balancedColumns } from "@/lib/layout";
import styles from "./SkillFolder.module.css";

export interface SkillChip {
  name: string;
  /** Extension shown as a technical detail: ".sh". */
  ext: string;
  /** Translated category: "SO", "Linguagem"… */
  category: string;
  /** Two-character mono glyph; defaults to the first two letters of the name. */
  glyph?: string;
}

interface SkillFolderProps {
  index: string;
  title: string;
  /** What the folder holds, bottom left of its front. */
  icon: IconName;
  items: SkillChip[];
  /** "itens" / "items" / "elementos". */
  unit: string;
  /** Screen-reader suffix of the toggle: "abrir pasta" / "fechar pasta". */
  openLabel: string;
  closeLabel: string;
  defaultOpen?: boolean;
  className?: string;
}

const CHIP_HEIGHT = 64;
const CHIP_GAP = 10;

/**
 * Skills folder. Closed, the mini-cards peek out stacked; open, the tab lifts, the front tips over
 * (rotateX -16deg) and the cards rise on a spring (45ms stagger), in up to 1–3 columns by width,
 * balanced by their count (4 → 2 + 2), the short last row centred. Closes in reverse order.
 */
export function SkillFolder({ index, title, icon, items, unit, openLabel, closeLabel, defaultOpen = false, className }: SkillFolderProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [cols, setCols] = useState(3);
  // The column count depends on the rendered width; until it is measured, chips move without transition.
  const [measured, setMeasured] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const cardsId = useId();

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setCols(width < 250 ? 1 : width < 520 ? 2 : 3);
      setMeasured(true);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const c = balancedColumns(items.length, cols);
  const rows = Math.ceil(items.length / c);
  // The short last row is centred: its cards move over by half the columns it leaves empty.
  const lastRow = rows - 1;
  const shift = (c - (items.length - lastRow * c)) / 2;
  const tray = rows * CHIP_HEIGHT + (rows - 1) * CHIP_GAP + 22;

  return (
    <div
      ref={wrap}
      className={cx(styles.folder, open && styles.open, !measured && styles.unmeasured, className)}
      style={cssVars({ "--tray": `${open ? tray : 0}px`, "--cols": c, "--mid": (c - 1) / 2 })}
    >
      <div className={styles.body}>
        <div className={styles.back} aria-hidden="true">
          <span className={styles.tab}>
            <span className={styles.tabDot} />
            {index}
          </span>
        </div>

        <ul className={styles.cards} id={cardsId} aria-label={title} aria-hidden={!open}>
          {items.map((item, i) => {
            const col = i % c;
            const row = Math.floor(i / c);
            return (
              <li
                key={item.name}
                className={styles.chip}
                style={cssVars({
                  "--col": row === lastRow ? col + shift : col,
                  "--oy": `${-tray + row * (CHIP_HEIGHT + CHIP_GAP)}px`,
                  // Closed: the first three peek out stacked, the rest hide behind them.
                  "--cy": `${i < 3 ? 6 + i * 5 : 34}px`,
                  "--rot": `${(((i * 37) % 7) - 3) * 0.9}deg`,
                  "--jx": `${((i % 3) - 1) * 8}px`,
                  "--d": i,
                  "--rd": items.length - 1 - i,
                })}
              >
                <span className={styles.glyph}>{item.glyph ?? item.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2)}</span>
                <span className={styles.main}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.meta}>
                    <b>{item.ext}</b> · {item.category}
                  </span>
                </span>
                <EdgeLight className={styles.chipEdge} />
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className={styles.front}
          aria-expanded={open}
          aria-controls={cardsId}
          onClick={() => setOpen(!open)}
        >
          <span className={styles.title}>{title}</span>
          <span className={styles.icon} aria-hidden="true">
            <Icon name={icon} size={18} />
          </span>
          <span className="sr-only">
            {pad2(items.length)} {unit}
          </span>
          <span className={styles.toggle} aria-hidden="true">
            <Icon name="plus" size={16} />
          </span>
          <span className="sr-only"> — {open ? closeLabel : openLabel}</span>
        </button>
      </div>
    </div>
  );
}
