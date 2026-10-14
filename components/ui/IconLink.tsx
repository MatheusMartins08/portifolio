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
  className?: string;
}

/** Icon-only link in a 36px hit area (the minimum), with a visible name for screen readers and a tooltip. */
export function IconLink({ href, icon, label, newTabLabel, className }: IconLinkProps) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      title={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cx(styles.link, className)}
    >
      <Icon name={icon} size={18} />
      <span className="sr-only">
        {label}
        {external && newTabLabel ? ` ${newTabLabel}` : null}
      </span>
    </a>
  );
}
