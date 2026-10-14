import { notFound } from "next/navigation";

// Any path under /pt, /en, /es that matches no page lands here, so it gets the localized not-found
// (inside the locale layout) instead of the framework's bare 404.

// Static, so the 404 status is decided before anything streams.
export const ensureStatic = "navigation";
export const instant = false;

// Cache Components needs at least one param to validate the route.
export function generateStaticParams() {
  return [{ rest: ["404"] }];
}

export default function CatchAll() {
  notFound();
}
