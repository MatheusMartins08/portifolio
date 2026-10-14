import { cx } from "@/lib/cx";
import styles from "./Icon.module.css";

/** Single icon set: 1.5px stroke on a 24px grid, round caps, currentColor. */
const ICONS = {
  "arrow-up-right": "M7 17L17 7M9 7h8v8",
  "arrow-down": "M12 5v14M6 13l6 6 6-6",
  "arrow-up": "M12 19V5M6 11l6-6 6 6",
  "arrow-right": "M5 12h14M13 6l6 6-6 6",
  "arrow-left": "M19 12H5M11 6l-6 6 6 6",
  "chevron-down": "M6 9l6 6 6-6",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6L6 18",
  check: "M5 12.5l4.5 4.5L19 7.5",
  globe: "M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M3 12h18M12 3c2.4 2.6 3.6 5.6 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.6-3.6-9S9.6 5.6 12 3",
  mail: "M3.5 6h17v12h-17zM4 6.5l8 6.5 8-6.5",
  chat: "M4 5h16v11H9.5L5 19.5V16H4z",
  code: "M9 7l-5 5 5 5M15 7l5 5-5 5",
  pin: "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
  folder: "M3.5 6.5h6l2 2h9v10h-17z",
  terminal: "M3.5 5h17v14h-17zM7 10l3 2.5L7 15M12.5 15H17",
  file: "M6.5 3.5h7l4 4v13h-11zM13.5 3.5v4h4",
  alert: "M12 7.5v5.5M12 16.2v.3M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0",
  menu: "M4 8h16M4 16h16",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c1.2-3.6 4.1-5.5 7.5-5.5s6.3 1.9 7.5 5.5",
  // Brand marks redrawn as outlines on the same grid and stroke — never the official filled logos.
  linkedin:
    "M5.5 3.5h13a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2zM8 10.5v6M8 7.4v.2M11.5 16.5v-6M11.5 13a2.5 2.5 0 0 1 5 0v3.5",
  github:
    "M10.2 20.5v-2.6C6.6 17.5 4.5 15.5 4.5 11.9c0-1.2.4-2.3 1.1-3.2L6.2 4.8c1.1.1 2.3.7 3.3 1.4 1.6-.4 3.4-.4 5 0 1-.7 2.2-1.3 3.3-1.4l.6 3.9c.7.9 1.1 2 1.1 3.2 0 3.6-2.1 5.6-5.7 6v2.6M10.2 19.3c-2.5.7-3.8-.2-4.7-1.7",
} as const;

export type IconName = keyof typeof ICONS;

export const iconNames = Object.keys(ICONS) as IconName[];

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  /** Accessible name; without it the icon is decorative (aria-hidden). */
  label?: string;
  className?: string;
}

export function Icon({ name, size = 16, strokeWidth = 1.5, label, className }: IconProps) {
  return (
    <svg
      className={cx(styles.icon, className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}
