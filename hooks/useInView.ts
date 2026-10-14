"use client";

import { useEffect, useState, type RefObject } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/** Nearest scrollable ancestor, so entrances also work inside scroll containers. */
export function scrollParent(el: Element): Element | null {
  let parent = el.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const overflowY = getComputedStyle(parent).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return parent;
    parent = parent.parentElement;
  }
  return null;
}

interface InViewOptions {
  threshold?: number;
  rootMargin?: string;
}

/** True once the element has entered the viewport (never resets). Always true with reduced motion. */
export function useInView(
  ref: RefObject<Element | null>,
  { threshold = 0.2, rootMargin = "0px 0px -8% 0px" }: InViewOptions = {},
): boolean {
  const [seen, setSeen] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { root: scrollParent(el), threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, seen]);

  return seen || reduced;
}
