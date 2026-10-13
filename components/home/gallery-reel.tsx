"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/use-media-query";
import type { GalleryImage } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Gallery preview. On large screens with motion allowed, vertical scroll
 * drives a pinned horizontal film reel; elsewhere it is a swipeable rail.
 */
export function GalleryReel({ images }: { images: GalleryImage[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduceMotion = useReducedMotion();
  const pinned = isDesktop && !reduceMotion;
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!pinned || !track) return;
    // ResizeObserver fires once on observe, then whenever the track or viewport changes.
    const observer = new ResizeObserver(() => {
      setDistance(Math.max(0, track.scrollWidth - document.documentElement.clientWidth));
    });
    observer.observe(track);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (v) => -v * distance);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="reel-title"
      className="relative bg-band text-band-foreground"
      style={pinned ? { height: `calc(100svh + ${distance}px)` } : undefined}
    >
      <div className={cn(pinned && "sticky top-0 flex h-svh flex-col justify-center overflow-hidden")}>
        <motion.div
          ref={trackRef}
          style={pinned ? { x } : undefined}
          className={cn(
            "flex gap-4 py-16 sm:gap-6",
            pinned
              ? "w-max items-center px-10"
              : "scrollbar-none snap-x snap-mandatory overflow-x-auto scroll-px-4 px-4 sm:scroll-px-6 sm:px-6",
          )}
        >
          <div className="flex w-[78vw] shrink-0 snap-start flex-col justify-between sm:w-[22rem] lg:h-[70svh] lg:w-[26rem]">
            <div>
              <p className="eyebrow flex items-center gap-3 text-gold">
                <span className="h-px w-8 bg-current" aria-hidden="true" />
                The gallery
              </p>
              <h2 id="reel-title" className="mt-4 font-heading text-5xl leading-[0.92] font-medium tracking-tight lg:text-7xl">
                Through <em className="text-gold">the lens</em>
              </h2>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-band-muted">
                Texture, sheen and scale — the fabrics up close, as photographed in the showroom.
              </p>
            </div>
            <Link
              href="/gallery"
              className="group mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-band-foreground"
            >
              Open the gallery
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          {images.map((image, i) => (
            <figure
              key={image.id}
              className={cn(
                "group w-[64vw] shrink-0 snap-start sm:w-[18rem]",
                pinned && (i % 2 === 0 ? "lg:w-[24rem] lg:-translate-y-6" : "lg:w-[20rem] lg:translate-y-10"),
              )}
            >
              <Link
                href={image.productSlug ? `/products/${image.productSlug}` : "/gallery"}
                className="block overflow-hidden rounded-sm"
              >
                <div className="relative aspect-17/23">
                  <Image
                    src={image.imageUrl}
                    alt={image.altText}
                    fill
                    sizes="(min-width: 1024px) 24rem, 64vw"
                    className="object-cover transition-transform duration-[1.4s] ease-silk group-hover:scale-105"
                  />
                </div>
              </Link>
              <figcaption className="mt-3 flex items-baseline gap-3 text-sm text-band-muted">
                <span className="font-heading text-base text-gold italic tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {image.caption}
              </figcaption>
            </figure>
          ))}

          <Link
            href="/gallery"
            className="group flex aspect-17/23 w-[64vw] shrink-0 snap-start flex-col items-center justify-center gap-4 rounded-sm border border-band-foreground/20 text-center transition-colors hover:border-gold sm:w-[18rem] lg:w-[20rem]"
          >
            <span className="flex size-16 items-center justify-center rounded-full border border-band-foreground/30 transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-band">
              <ArrowRight className="size-5" aria-hidden="true" />
            </span>
            <span className="font-heading text-3xl">View all</span>
          </Link>
        </motion.div>

        {pinned ? (
          <div className="absolute inset-x-10 bottom-10 h-px bg-band-foreground/15" aria-hidden="true">
            <motion.div style={{ width: progress }} className="h-full bg-gold" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
