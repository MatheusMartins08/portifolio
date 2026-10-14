import { ImageResponse } from "next/og";
import { Monogram } from "@/components/layout/Monogram";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Browser tab icon: the MF monogram. */
export default function Icon() {
  return new ImageResponse(<Monogram size={size.width} />, size);
}
