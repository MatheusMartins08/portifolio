import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { IconName } from "./Icon";
import { SlideIcon } from "./SlideIcon";
import styles from "./Button.module.css";

interface CommonProps {
  /** primary = the screen's CTA (one per view); solid = strong secondary; ghost = support actions; text = inside sentences. */
  variant?: "primary" | "solid" | "ghost" | "text";
  size?: "sm" | "md" | "lg";
  /** Arrow icons slide through the button on hover. */
  icon?: IconName;
  /** Swaps the icon for a spinner and disables the button. */
  loading?: boolean;
  className?: string;
  children: ReactNode;
}

type AsButton = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };
type AsLink = CommonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string };

export type ButtonProps = AsButton | AsLink;

/** Button, or link-button when it receives `href`. */
export function Button({ variant = "primary", size = "md", icon, loading = false, className, children, ...rest }: ButtonProps) {
  const classes = cx(styles.btn, styles[variant], styles[size], loading && styles.loading, className);
  const content = (
    <>
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      <span>{children}</span>
      {icon && !loading ? <SlideIcon name={icon} size={size === "sm" ? 14 : 16} className={styles.icon} /> : null}
    </>
  );

  if (rest.href !== undefined) {
    const linkProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a {...linkProps} className={classes} aria-busy={loading || undefined}>
        {content}
      </a>
    );
  }

  // While loading the button stays focusable (aria-disabled, clicks ignored), so keyboard focus is not
  // dropped to <body> — inside a dialog that would let Tab escape the focus trap.
  const { type = "button", onClick, ...buttonProps } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={classes}
    >
      {content}
    </button>
  );
}
