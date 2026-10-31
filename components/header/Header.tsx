"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useScrolled, useScrollSpy } from "@/hooks/useScrollSpy";
import { cx, pad2 } from "@/lib/cx";
import { localeNames, locales, type Locale } from "@/lib/i18n/config";
import { LanguageSwitch } from "./LanguageSwitch";
import styles from "./Header.module.css";

export interface NavItem {
  id: string;
  label: string;
}

export interface HeaderLabels {
  /** aria-label of the <nav>. */
  nav: string;
  menu: string;
  close: string;
  language: string;
  cv: string;
  /** CV button text below 720px. */
  cvShort: string;
}

interface HeaderProps {
  items: NavItem[];
  locale: Locale;
  labels: HeaderLabels;
  cvHref: string;
  /** Page the section anchors live on: "" on the home page, "/pt" on inner pages (case studies). */
  homeHref?: string;
  /** What follows the locale in this page's URL ("" on the home, "/projects/x" on a case study): the language links' target. */
  path?: string;
}

/**
 * Fixed header in three loose pieces: language switch (left), navigation pill (centre), CV (right).
 * Active item follows the section in view; the pill gains a shadow on scroll; below 720px the pill
 * becomes a Menu button with a drop-down sheet.
 */
export function Header({ items, locale, labels, cvHref, homeHref = "", path = "" }: HeaderProps) {
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const languages = locales.map((code) => ({ code, label: localeNames[code], href: `/${code}${path}` }));
  const active = useScrollSpy(ids);
  const scrolled = useScrolled(16);
  const [menu, setMenu] = useState(false);
  const root = useRef<HTMLElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sheetId = useId();

  useEffect(() => {
    if (!menu) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus();
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setMenu(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menu]);

  /** Slides the light tint under the hovered/focused item. */
  function moveIndicator(target: HTMLElement | null) {
    const el = indicator.current;
    if (!el) return;
    if (!target) {
      el.style.opacity = "0";
      return;
    }
    const first = el.style.opacity !== "1";
    if (first) el.style.transition = "none";
    el.style.width = `${target.offsetWidth}px`;
    el.style.transform = `translateX(${target.offsetLeft}px)`;
    if (first) {
      void el.offsetWidth;
      el.style.transition = "";
    }
    el.style.opacity = "1";
  }

  /**
   * Same page in the other language, keeping the section in view as the anchor.
   * A full document load on purpose: with Cache Components a client navigation keeps the previous
   * locale mounted inside a hidden <Activity>, duplicating every section id in the DOM.
   */
  function changeLanguage(code: string) {
    const rest = window.location.pathname.replace(/^\/[^/]+/, "");
    const hash = active ? `#${active}` : "";
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload is intended (see above)
    window.location.href = `/${code}${rest}${hash}`;
  }

  return (
    <header ref={root} className={cx(styles.header, scrolled && styles.scrolled, menu && styles.menuOpen)}>
      <div className={styles.inner}>
        <div className={styles.start}>
          <LanguageSwitch value={locale} options={languages} onChange={changeLanguage} label={labels.language} />
        </div>

        <nav className={styles.nav} aria-label={labels.nav}>
          <div className={styles.pill} onPointerLeave={() => moveIndicator(null)}>
            <span className={styles.indicator} ref={indicator} aria-hidden="true" />
            <ul className={styles.list}>
              {items.map((item) => {
                const isActive = item.id === active;
                return (
                  <li key={item.id}>
                    <a
                      className={cx(styles.link, isActive && styles.active)}
                      href={`${homeHref}#${item.id}`}
                      aria-current={isActive ? "location" : undefined}
                      onPointerEnter={(event) => moveIndicator(event.currentTarget)}
                      onFocus={(event) => moveIndicator(event.currentTarget)}
                      onBlur={() => moveIndicator(null)}
                    >
                      {item.label}
                      <span className={styles.dot} aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          <button
            ref={menuButton}
            type="button"
            className={styles.menuButton}
            aria-expanded={menu}
            aria-controls={sheetId}
            onClick={() => setMenu(!menu)}
          >
            <span>{menu ? labels.close : labels.menu}</span>
            <span className={styles.burger} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </nav>

        <div className={styles.end}>
          <Button variant="ghost" size="sm" icon="arrow-down" href={cvHref} download="" className={styles.cv}>
            <span className={styles.hideSm}>{labels.cv}</span>
            <span className={styles.showSm}>{labels.cvShort}</span>
          </Button>
        </div>

        <div className={styles.sheet} id={sheetId} hidden={!menu}>
          <ul>
            {items.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`${homeHref}#${item.id}`}
                  className={cx(item.id === active && styles.sheetActive)}
                  aria-current={item.id === active ? "location" : undefined}
                  onClick={() => setMenu(false)}
                >
                  <span className={styles.sheetIndex}>{pad2(i + 1)}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
