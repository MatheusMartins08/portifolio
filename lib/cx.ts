import type { CSSProperties } from "react";

/** Joins truthy class names. */
export function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(" ");
}

/** Inline style with CSS custom properties (`--i`, `--d`…), which CSSProperties does not type. */
export function cssVars(vars: Record<`--${string}`, string | number>, style?: CSSProperties): CSSProperties {
  return { ...style, ...vars } as CSSProperties;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
