import { ImageResponse } from "next/og";
import { BoltMark } from "@/components/layout/BoltMark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Browser tab icon: the bolt alone, on a transparent background. */
export default function Icon() {
  return new ImageResponse(<BoltMark size={size.width} />, size);
}
