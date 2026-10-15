import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";
import styles from "./IconLink.module.css";

interface IconLinkProps {
  href: string;
  icon: IconName;
  /** Accessible name and tooltip: "LinkedIn". */
  label: string;
  /** Screen-reader note for new-tab links (i18n `a11y.newTab`). */
  newTabLabel?: string;
  /** `md` 36px (the minimum hit area); `lg` 48px with a lift on hover, for the Hero. */
  size?: "md" | "lg";
  className?: string;
}

/** Icon-only link with a visible name for screen readers and a tooltip. */
export function IconLink({ href, icon, label, newTabLabel, size = "md", className }: IconLinkProps) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      title={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cx(styles.link, size === "lg" && styles.lg, className)}
    >
      <Icon name={icon} size={size === "lg" ? 22 : 18} />
      <span className="sr-only">
        {label}
        {external && newTabLabel ? ` ${newTabLabel}` : null}
      </span>
    </a>
  );
}
