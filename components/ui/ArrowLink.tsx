import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { IconName } from "./Icon";
import { SlideIcon } from "./SlideIcon";
import styles from "./ArrowLink.module.css";

interface ArrowLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  href: string;
  /** arrow-up-right = external (default), arrow-right = internal navigation; null hides it. */
  icon?: IconName | null;
  size?: "sm" | "md" | "lg";
  /** Defaults to true for http(s) links: opens in a new tab and says so to screen readers. */
  external?: boolean;
  /** Screen-reader note for new-tab links (i18n `a11y.newTab`). */
  newTabLabel?: string;
  children: ReactNode;
}

const ICON_SIZE = { sm: 12, md: 14, lg: 20 } as const;

/** Text link with an arrow: hairline underline that draws in white on hover, text shifts 2px. */
export function ArrowLink({
  href,
  icon = "arrow-up-right",
  size = "md",
  external,
  newTabLabel,
  className,
  children,
  ...rest
}: ArrowLinkProps) {
  const isExternal = external ?? /^https?:/.test(href);
  return (
    <a
      {...rest}
      href={href}
      target={isExternal ? "_blank" : rest.target}
      rel={isExternal ? "noopener noreferrer" : rest.rel}
      className={cx(styles.link, styles[size], className)}
    >
      <span className={styles.text}>{children}</span>
      {icon ? <SlideIcon name={icon} size={ICON_SIZE[size]} className={styles.icon} /> : null}
      {isExternal && newTabLabel ? <span className="sr-only"> {newTabLabel}</span> : null}
    </a>
  );
}
