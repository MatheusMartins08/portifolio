/**
 * site.json references kit paths ("assets/Photos/x.webp"); the files are copied to public/images/
 * with lowercase folders. Sizes are the real pixel dimensions, for next/image.
 */

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  /** object-position when a frame crops the photo (the Hero's square portrait): keeps the subject in. */
  focus?: string;
}

const sizes: Record<string, { width: number; height: number; focus?: string }> = {
  "/images/photos/matheus-portrait.webp": { width: 1018, height: 1386, focus: "50% 80%" },
  "/images/photos/matheus-coding.webp": { width: 928, height: 1600, focus: "50% 55%" },
  "/images/projects/black-crown-home.webp": { width: 1600, height: 900 },
  "/images/projects/black-crown-agendamento.webp": { width: 1390, height: 1054 },
  "/images/projects/metrica-home.webp": { width: 1600, height: 901 },
  "/images/projects/metrica-diferenciais.webp": { width: 1599, height: 1056 },
};

export function asset(kitPath: string): ImageAsset {
  const src = "/images/" + kitPath.replace(/^assets\//, "").replace(/^[^/]+/, (dir) => dir.toLowerCase());
  const size = sizes[src];
  if (!size) throw new Error(`Unknown image "${kitPath}": copy it to public${src} and add its size to lib/content/assets.ts`);
  return { src, ...size };
}
