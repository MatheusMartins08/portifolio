"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SlideIcon } from "@/components/ui/SlideIcon";
import type { ContactMessage } from "@/lib/contact/submitContact";
import { cx } from "@/lib/cx";
import { BorderSpark } from "./BorderSpark";
import { ContactForm, type ContactFormLabels } from "./ContactForm";
import styles from "./ContactModal.module.css";

export interface ContactChannel {
  label: string;
  value: string;
  href: string;
  icon: IconName;
}

export interface ContactModalCopy {
  index: string;
  kicker: string;
  title: string;
  intro: string;
  closeLabel: string;
  newTabLabel: string;
  channels: ContactChannel[];
  form: ContactFormLabels;
}

interface ContactModalProps extends ContactModalCopy {
  /** closing plays the exit animation before the parent unmounts the modal. */
  state: "open" | "closing";
  onClose: () => void;
  onSubmit: (message: ContactMessage) => Promise<void>;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Contact dialog: channels on the left, form on the right. Focus is trapped inside and returned to the
 * trigger, Esc and a click outside close it, page scroll is locked. On phones it is a sheet from the bottom.
 */
export function ContactModal({ state, onClose, onSubmit, index, kicker, title, intro, closeLabel, newTabLabel, channels, form }: ContactModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    // body overflow propagates to the viewport, which locks the page scroll.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => panel.current?.querySelector<HTMLElement>("input, textarea")?.focus(), 60);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;
      const focusable = panel.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus?.();
    };
  }, []);

  return createPortal(
    <div className={cx(styles.modal, state === "open" ? styles.isOpen : styles.isClosing)}>
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />
      {/* The shell holds the panel and the spark on its border: the panel scrolls, the spark stays put. */}
      <div className={styles.shell}>
        <div ref={panel} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel}>
            <Icon name="close" size={18} />
          </button>

          <aside className={styles.aside}>
            <SectionLabel index={index}>{kicker}</SectionLabel>
            <h2 className={styles.title} id={titleId}>
              {title}
            </h2>
            <p className={styles.intro}>{intro}</p>
            <ul className={styles.contacts}>
              {channels.map((channel) => {
                const external = /^https?:/.test(channel.href);
                return (
                  <li key={channel.label}>
                    <a
                      className={styles.contact}
                      href={channel.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                    >
                      <span className={styles.contactIcon} aria-hidden="true">
                        <Icon name={channel.icon} size={16} />
                      </span>
                      <span className={styles.contactText}>
                        <span className={styles.contactLabel}>{channel.label}</span>
                        <span className={styles.contactValue}>{channel.value}</span>
                      </span>
                      <SlideIcon name="arrow-up-right" size={14} className={styles.contactArrow} />
                      {external ? <span className="sr-only"> {newTabLabel}</span> : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className={styles.main}>
            <ContactForm labels={form} onSubmit={onSubmit} />
          </div>
        </div>
        <BorderSpark target={panel} />
      </div>
    </div>,
    document.body,
  );
}
