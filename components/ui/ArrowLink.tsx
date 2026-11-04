import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { IconName } from "./Icon";
import { SlideIcon } from "./SlideIcon";
import styles from "./ArrowLink.module.css";

interface ArrowLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  href: string;
  /** arrow-up-right = external (default), arrow-right = internal navigation; null hides it. */
  icon?: IconName | null;
  /** "start" puts the arrow before the text: a link back ("← Projetos"). */
  iconPosition?: "start" | "end";
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
  iconPosition = "end",
  size = "md",
  external,
  newTabLabel,
  className,
  children,
  ...rest
}: ArrowLinkProps) {
  const isExternal = external ?? /^https?:/.test(href);
  const arrow = icon ? <SlideIcon name={icon} size={ICON_SIZE[size]} className={styles.icon} /> : null;
  const start = iconPosition === "start";
  return (
    <a
      {...rest}
      href={href}
      target={isExternal ? "_blank" : rest.target}
      rel={isExternal ? "noopener noreferrer" : rest.rel}
      className={cx(styles.link, styles[size], start && styles.start, className)}
    >
      {start ? arrow : null}
      <span className={styles.text}>{children}</span>
      {start ? null : arrow}
      {isExternal && newTabLabel ? <span className="sr-only"> {newTabLabel}</span> : null}
    </a>
  );
}
