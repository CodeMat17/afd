"use client";

import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

type RevealVariant = "lift" | "curtain";

/**
 * Scroll reveal that never hides server-rendered content.
 *
 * The markup ships visible, so anything in the first viewport paints straight
 * from the HTML (good for LCP, no JS needed). After hydration, elements that
 * are still below the fold are hidden and revealed once they scroll into view.
 * Styles live in globals.css (`[data-reveal]`).
 */
let sharedObserver: IntersectionObserver | null = null;

/**
 * One observer for every reveal on the page. Its first report per element
 * (computed off the main thread, so no forced layout during hydration) decides
 * whether the element starts on screen (left as rendered) or below the fold
 * (hidden, then revealed when it scrolls in).
 */
function getObserver(): IntersectionObserver {
  sharedObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (el.dataset.reveal === "pending") {
          if (entry.isIntersecting) {
            el.dataset.reveal = "shown";
            sharedObserver?.unobserve(el);
          }
        } else if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
          sharedObserver?.unobserve(el);
        } else {
          el.dataset.reveal = "pending";
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  return sharedObserver;
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = getObserver();
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  return ref;
}

type RevealProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  delay?: number;
  y?: number;
};

/** Fades and lifts content into view once. Respects reduced motion. */
export function Reveal({ children, delay = 0, y = 28, style, ...props }: RevealProps) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-reveal-variant={"lift" satisfies RevealVariant}
      style={{ "--reveal-delay": `${delay}s`, "--reveal-y": `${y}px`, ...style } as CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}

/** Curtain-style clip reveal for imagery. */
export function RevealImage({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      data-reveal-variant={"curtain" satisfies RevealVariant}
      style={{ "--reveal-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * Staggered word-by-word heading reveal. Pure CSS, so it starts with the first
 * paint instead of waiting for JavaScript (see `.split-word` in globals.css).
 */
export function SplitText({
  text,
  className,
  delay = 0,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "span" | "h1" | "h2";
}) {
  const words = text.split(" ");
  return (
    <Tag className={className}>
      <span className="sr-only">{text} </span>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden="true"
          className="inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <span
            className="split-word inline-block"
            style={{ animationDelay: `${delay + i * 0.07}s` }}
          >
            {word}
            {i < words.length - 1 ? <>&nbsp;</> : null}
          </span>
        </span>
      ))}
    </Tag>
  );
}
