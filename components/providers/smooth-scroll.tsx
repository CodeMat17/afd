"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Inertial smooth scrolling for wheel input. Disabled for users who prefer
 * reduced motion; touch devices keep native scrolling.
 */
export function SmoothScroll() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      wheelMultiplier: 0.95,
      anchors: true,
      autoToggle: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      prevent: (node) => node.closest("dialog, [data-lenis-prevent]") !== null,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
