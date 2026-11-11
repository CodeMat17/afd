import type Lenis from "lenis";

/**
 * The page's Lenis instance, when smooth scrolling is on. Programmatic scrolls
 * go through it so they animate and Lenis doesn't fight them.
 */
let lenis: Lenis | null = null;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

/** Bring the top of the page back into view, e.g. after a form is saved. */
export function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0);
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}
