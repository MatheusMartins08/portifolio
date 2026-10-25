import { ImageResponse } from "next/og";
import { BoltMark } from "@/components/layout/BoltMark";

export const contentType = "image/png";

/**
 * Browser icon: the bolt alone, on a transparent background. 32px for the tab; 192px (a multiple of
 * 48, as Google requires for the icon next to search results; also Android) for everything larger.
 */
export function generateImageMetadata() {
  return [32, 192].map((side) => ({ id: String(side), size: { width: side, height: side }, contentType }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const side = Number(await id);
  return new ImageResponse(<BoltMark size={side} />, { width: side, height: side });
}
