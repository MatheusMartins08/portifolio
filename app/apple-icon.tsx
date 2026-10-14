import { ImageResponse } from "next/og";
import { Monogram } from "@/components/layout/Monogram";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon (iOS): the MF monogram, larger. */
export default function AppleIcon() {
  return new ImageResponse(<Monogram size={size.width} />, size);
}
