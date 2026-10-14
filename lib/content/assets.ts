/**
 * site.json references kit paths ("assets/Photos/x.webp"); the files are copied to public/images/
 * with lowercase folders. Sizes are the real pixel dimensions, for next/image.
 */

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
}

const sizes: Record<string, { width: number; height: number }> = {
  "/images/photos/matheus-portrait.webp": { width: 900, height: 1125 },
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
