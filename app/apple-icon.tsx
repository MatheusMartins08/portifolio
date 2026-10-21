import { ImageResponse } from "next/og";
import { BoltMark } from "@/components/layout/BoltMark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon (iOS): the bolt on a sand square, which iOS rounds itself. */
export default function AppIcon() {
  return new ImageResponse(<BoltMark size={size.width} plate />, size);
}
