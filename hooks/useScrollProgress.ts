"use client";

import { useEffect, useRef, type RefObject } from "react";
import { prefersReducedMotion } from "./usePrefersReducedMotion";

interface ScrollProgressOptions {
  /** The reading line, as a share of the viewport height from the top. */
  line?: number;
  /** Share of the remaining distance covered each frame: a soft trail behind the scroll. */
  ease?: number;
  /** Off (e.g. with reduced motion, or before the element is measured): no listeners at all. */
  enabled?: boolean;
}

/**
 * Follows the scroll around an element: calls `onDepth` with how far the reading line (`line` of the
 * viewport) has gone below the element's top, in px (negative above it), eased from one frame to the
 * next. Only listens while the element is near the screen (IntersectionObserver), at most once per
 * frame, and stops once the value settles. The first reading snaps (a page opened mid-scroll).
 * Never runs with reduced motion.
 */
export function useScrollProgress<T extends Element>(
  ref: RefObject<T | null>,
  onDepth: (depth: number) => void,
  { line = 0.72, ease = 0.2, enabled = true }: ScrollProgressOptions = {},
) {
  // The latest callback, without re-subscribing when it changes.
  const callback = useRef(onDepth);
  useEffect(() => {
    callback.current = onDepth;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || prefersReducedMotion()) return;
    let depth: number | null = null;
    let frame = 0;
    let watching = false;

    const tick = () => {
      frame = 0;
      const goal = window.innerHeight * line - el.getBoundingClientRect().top;
      depth = depth === null || Math.abs(goal - depth) < 0.5 ? goal : depth + (goal - depth) * ease;
      callback.current(depth);
      if (depth !== goal) frame = requestAnimationFrame(tick);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // Only follow the scroll around the element; leaving, one last reading settles it.
    const listen = (on: boolean) => {
      if (on) {
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", request);
      } else {
        window.removeEventListener("scroll", request);
        window.removeEventListener("resize", request);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === watching) return;
        watching = entry.isIntersecting;
        listen(watching);
        request();
      },
      { rootMargin: "25% 0px" },
    );
    observer.observe(el);
    request();

    return () => {
      observer.disconnect();
      listen(false);
      cancelAnimationFrame(frame);
    };
  }, [ref, line, ease, enabled]);
}
