"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

/**
 * Id of the last section whose top has passed `offset` px from the viewport top,
 * or null while none has (e.g. still in the Hero). At the very bottom of the page the last
 * section that has entered the viewport wins, since short final sections never reach the offset.
 */
export function useScrollSpy(ids: readonly string[], offset = 140): string | null {
  const getSnapshot = useCallback(() => {
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let current: string | null = null;
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.getBoundingClientRect().top;
      if (top - offset <= 0 || (atBottom && top < window.innerHeight)) current = id;
    }
    return current;
  }, [ids, offset]);

  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

/** True once the page has scrolled past `threshold` px. */
export function useScrolled(threshold = 16): boolean {
  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
