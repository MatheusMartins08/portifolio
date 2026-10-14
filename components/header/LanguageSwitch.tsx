"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import styles from "./LanguageSwitch.module.css";

export interface LanguageOption {
  code: string;
  label: string;
}

interface LanguageSwitchProps {
  value: string;
  options: LanguageOption[];
  onChange: (code: string) => void;
  /** Accessible name of the control (i18n `nav.language`). */
  label: string;
  className?: string;
}

/** PT/EN/ES pill with its own listbox dropdown. Keyboard: arrows, Home/End, Enter/Space, Esc. */
export function LanguageSwitch({ value, options, onChange, label, className }: LanguageSwitchProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();
  const listId = `${id}-list`;
  const display = value.toUpperCase();

  useEffect(() => {
    if (!open) return;
    list.current?.focus({ preventScroll: true });
    function onPointerDown(event: PointerEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function openMenu() {
    const current = options.findIndex((option) => option.code === value);
    setActive(current < 0 ? 0 : current);
    setOpen(true);
  }

  function choose(code: string) {
    setOpen(false);
    button.current?.focus();
    if (code !== value) onChange(code);
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const n = options.length;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((active + 1) % n);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((active - 1 + n) % n);
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(n - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(options[active].code);
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        button.current?.focus();
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
        aria-haspopup="listbox"
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
      <ul
        ref={list}
        id={listId}
        role="listbox"
        tabIndex={-1}
        className={styles.menu}
        aria-label={label}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onKeyDown={onListKeyDown}
      >
        {options.map((option, i) => {
          const selected = option.code === value;
          return (
            <li
              key={option.code}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={selected}
              lang={option.code}
              className={cx(styles.opt, i === active && styles.active, selected && styles.selected)}
              onClick={() => choose(option.code)}
              onPointerEnter={() => setActive(i)}
            >
              <span className={styles.code}>{option.code.toUpperCase()}</span>
              <span>{option.label}</span>
              <span className={styles.mark} aria-hidden="true" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
