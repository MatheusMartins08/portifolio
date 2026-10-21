import { colorToken } from "@/lib/content/tokens";

/** The site's mark: a plain lightning bolt on a 32px grid. Also drawn in the footer, next to the name. */
export const BOLT_PATH = "M20.5 1 5 18.5h9L11.5 31 27 13h-9z";

/**
 * The bolt for the app icons: filled terracota → terracota-strong from top to bottom, its corners
 * softened by a stroke of the same fill. Colours from tokens.json (an icon cannot read CSS custom
 * properties). `plate` sets it on a sand square, for home screens that show a transparent icon on black.
 */
export function BoltMark({ size, plate = false }: { size: number; plate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bolt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colorToken("terracota")} />
          <stop offset="1" stopColor={colorToken("terracota-strong")} />
        </linearGradient>
      </defs>
      {plate ? <rect width="32" height="32" fill={colorToken("sand")} /> : null}
      <path
        d={BOLT_PATH}
        transform={plate ? "translate(16 16) scale(0.62) translate(-16 -16)" : undefined}
        fill="url(#bolt)"
        stroke="url(#bolt)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
