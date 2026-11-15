"use client";

import { type RefObject, useEffect, useState } from "react";

/**
 * Whether `ref` is currently visible in the viewport (clipping by scrollable
 * ancestors included). Defaults to `true` where IntersectionObserver is missing.
 */
export function useInView(ref: RefObject<Element | null>, rootMargin = "0px"): boolean {
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsInView(entry.isIntersecting);
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return isInView;
}
