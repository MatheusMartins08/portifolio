import { cssVars, cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";
import styles from "./SlideIcon.module.css";

const DIRECTIONS: Partial<Record<IconName, [number, number]>> = {
  "arrow-up-right": [1, -1],
  "arrow-down": [0, 1],
  "arrow-up": [0, -1],
  "arrow-right": [1, 0],
  "arrow-left": [-1, 0],
};

/**
 * Arrow that passes through on hover/focus of its parent link or button:
 * the visible copy leaves in the arrow's direction while a second one slides in behind it.
 * Must be a direct child of the <a>/<button>.
 */
export function SlideIcon({ name, size, className }: { name: IconName; size?: number; className?: string }) {
  const direction = DIRECTIONS[name];
  if (!direction) {
    return (
      <span className={cx(styles.slide, className)} aria-hidden="true">
        <Icon name={name} size={size} />
      </span>
    );
  }
  return (
    <span
      className={cx(styles.slide, className)}
      aria-hidden="true"
      style={cssVars({ "--dx": direction[0], "--dy": direction[1] })}
    >
      <Icon name={name} size={size} className={styles.a} />
      <Icon name={name} size={size} className={styles.b} />
    </span>
  );
}
