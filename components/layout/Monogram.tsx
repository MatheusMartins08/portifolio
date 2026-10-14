import { colorToken } from "@/lib/content/tokens";

/**
 * "MF" monogram for the app icons: the letters drawn as strokes on a 32px grid (an icon cannot rely on
 * a web font), ink on sand-3 with the terracota dot of the active menu item. Colours from tokens.json.
 */
export function Monogram({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill={colorToken("sand-3")} />
      <path
        d="M6.5 23V9l4.5 7.5L15.5 9v14M19.5 23V9H26M19.5 16h5"
        fill="none"
        stroke={colorToken("ink")}
        strokeWidth="2.4"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <circle cx="26" cy="24" r="2.2" fill={colorToken("terracota-strong")} />
    </svg>
  );
}
