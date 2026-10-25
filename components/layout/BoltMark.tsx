import { colorToken } from "@/lib/content/tokens";

/** The site's mark: a plain lightning bolt on a 32px grid. Also drawn in the footer, next to the name. */
export const BOLT_PATH = "M20.5 1 5 18.5h9L11.5 31 27 13h-9z";

/**
 * The bolt for the app icons: filled white → light gray from top to bottom, its corners softened by a
 * stroke of the same fill. Colours from tokens.json (an icon cannot read CSS custom properties).
 * Always on a black plate: a white bolt on a transparent icon would vanish on light browser chrome.
 * `plate` shrinks the bolt inside the square, for home screens that crop icons.
 */
export function BoltMark({ size, plate = false }: { size: number; plate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bolt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colorToken("mark")} />
          <stop offset="1" stopColor={colorToken("fg-muted")} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx={plate ? 0 : 7} fill={colorToken("bg")} />
      <path
        d={BOLT_PATH}
        transform={`translate(16 16) scale(${plate ? 0.62 : 0.72}) translate(-16 -16)`}
        fill="url(#bolt)"
        stroke="url(#bolt)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
