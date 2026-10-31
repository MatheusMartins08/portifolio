"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import styles from "./LanguageSwitch.module.css";

export interface LanguageOption {
  code: string;
  label: string;
  /** The same page in this language: a real link, so search engines find every version. */
  href: string;
}

interface LanguageSwitchProps {
  value: string;
  options: LanguageOption[];
  /** A plain click: the header decides how to get there (it keeps the section in view). */
  onChange: (code: string) => void;
  /** Accessible name of the control (i18n `nav.language`). */
  label: string;
  className?: string;
}

/**
 * PT/EN/ES pill opening a list of links to the page in each language (disclosure pattern).
 * Keyboard: arrows, Home/End move between languages, Enter/Space follow, Esc closes.
 * Modified clicks (new tab, new window) are left to the browser.
 */
export function LanguageSwitch({ value, options, onChange, label, className }: LanguageSwitchProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const links = useRef<Array<HTMLAnchorElement | null>>([]);
  /** Language focused when the list opens (the current one); the list is visible, so focusable, only after that render. */
  const first = useRef(0);
  const id = useId();
  const listId = `${id}-list`;
  const display = value.toUpperCase();

  useEffect(() => {
    if (!open) return;
    links.current[first.current]?.focus({ preventScroll: true });
    function onPointerDown(event: PointerEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function openMenu() {
    const current = options.findIndex((option) => option.code === value);
    first.current = current < 0 ? 0 : current;
    setActive(first.current);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    button.current?.focus();
  }

  function move(index: number) {
    setActive(index);
    links.current[index]?.focus();
  }

  function onLinkClick(event: MouseEvent<HTMLAnchorElement>, code: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    close();
    if (code !== value) onChange(code);
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const n = options.length;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        move((active + 1) % n);
        break;
      case "ArrowUp":
        event.preventDefault();
        move((active - 1 + n) % n);
        break;
      case "Home":
        event.preventDefault();
        move(0);
        break;
      case "End":
        event.preventDefault();
        move(n - 1);
        break;
      case " ":
        // Space follows the link too, as Enter does natively.
        event.preventDefault();
        links.current[active]?.click();
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={root} className={cx(styles.lang, open && styles.open, className)}>
      <button
        ref={button}
        type="button"
        className={styles.btn}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${display}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(event) => {
          if ((event.key === "ArrowDown" || event.key === "ArrowUp") && !open) {
            event.preventDefault();
            openMenu();
          }
        }}
      >
        <Icon name="globe" size={14} className={styles.globe} />
        <span>{display}</span>
        <Icon name="chevron-down" size={12} className={styles.chev} />
      </button>
      <ul id={listId} className={styles.menu} aria-label={label} onKeyDown={onListKeyDown}>
        {options.map((option, i) => {
          const selected = option.code === value;
          return (
            <li key={option.code}>
              <a
                ref={(el) => {
                  links.current[i] = el;
                }}
                href={option.href}
                hrefLang={option.code}
                lang={option.code}
                aria-current={selected ? "page" : undefined}
                className={cx(styles.opt, i === active && styles.active, selected && styles.selected)}
                onClick={(event) => onLinkClick(event, option.code)}
                onFocus={() => setActive(i)}
                onPointerEnter={() => setActive(i)}
              >
                <span className={styles.code}>{option.code.toUpperCase()}</span>
                <span>{option.label}</span>
                <span className={styles.mark} aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
