"use client";

import type Lenis from "lenis";
import { useEffect } from "react";
import { registerLenis } from "@/lib/scroll";

/**
 * Inertial smooth scrolling for wheel input. Disabled for users who prefer
 * reduced motion; touch devices keep native scrolling and never download it.
 * Lenis loads after the page is interactive, so it stays off the critical path.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !finePointer) return;

    let lenis: Lenis | null = null;
    let cancelled = false;

    void import("lenis").then(({ default: LenisCtor }) => {
      if (cancelled) return;
      lenis = new LenisCtor({
        autoRaf: true,
        lerp: 0.085,
        wheelMultiplier: 0.95,
        anchors: true,
        autoToggle: true,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        prevent: (node) => node.closest("dialog, [data-lenis-prevent]") !== null,
      });
      registerLenis(lenis);
    });

    return () => {
      cancelled = true;
      if (lenis) {
        registerLenis(null);
        lenis.destroy();
      }
    };
  }, []);

  return null;
}
