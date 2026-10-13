"use client";

import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type CSSProperties } from "react";
import { SplitText } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export interface HeroImage {
  src: string;
  alt: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ images }: { images: HeroImage[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const reelScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  const third = Math.ceil(images.length / 3);
  const columns = [
    images.slice(0, third),
    images.slice(third, third * 2),
    images.slice(third * 2),
  ];

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      className="grain relative isolate overflow-hidden bg-band text-band-foreground"
    >
      <div className="mx-auto grid max-w-360 lg:min-h-[calc(100svh-var(--header-height)-2.25rem)] lg:grid-cols-[1.05fr_1fr]">
        {/* Copy */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-10 flex flex-col justify-center px-4 pt-12 pb-10 sm:px-6 sm:pt-16 lg:px-10 lg:py-20"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="eyebrow flex items-center gap-3 text-gold"
          >
            <MapPin className="size-3.5" aria-hidden="true" />
            {site.address.street}, {site.address.city}
          </motion.p>

          <h1 id="hero-title" className="mt-6 font-heading text-[3.25rem] leading-[0.9] font-medium tracking-tight sm:text-7xl lg:text-[5.75rem] xl:text-[6.5rem]">
            <SplitText text="The language" className="block" delay={0.1} />
            <SplitText text="of African" className="block" delay={0.25} />
            <span className="block">
              <SplitText text="cloth." className="text-gold italic" delay={0.4} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.7 }}
            className="mt-6 max-w-md text-[0.9375rem] leading-relaxed text-band-muted sm:text-base"
          >
            Ankara, Woven Kente, Isiagu, sequin prints and luxury lace — printed,
            woven and embellished textiles, brought together in one Nairobi showroom.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.85 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "group")}>
              Shop the Collection
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link href="/gallery" className={buttonVariants({ variant: "outline-inverse", size: "lg" })}>
              View the Gallery
            </Link>
          </motion.div>
        </motion.div>

        {/* Reel — decorative, the same products are listed below */}
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, ease, delay: 0.2 }}
          className="relative h-[17rem] overflow-hidden sm:h-[22rem] lg:h-auto"
        >
          {/* Mobile / tablet: horizontal film strip */}
          <div className="flex h-full items-center lg:hidden">
            <div className="flex h-full w-max animate-marquee-x gap-3 py-2 [--marquee-duration:55s]">
              {[...images, ...images].map((img, i) => (
                <div key={`m-${i}`} className="relative aspect-17/23 h-full shrink-0 overflow-hidden rounded-sm">
                  <Image
                    src={img.src}
                    alt=""
                    fill
                    sizes="200px"
                    loading={i < 4 ? "eager" : "lazy"}
                    className="object-cover rounded-xl"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: three counter-scrolling columns */}
          <motion.div
            style={{ scale: reelScale }}
            className="absolute inset-0 hidden grid-cols-3 gap-4 px-4 lg:grid"
          >
            {columns.map((column, c) => (
              <div key={c} className="relative overflow-hidden">
                <div
                  className={cn(
                    "flex flex-col gap-4",
                    c === 1 ? "animate-marquee-down" : "animate-marquee-up",
                  )}
                  style={{ "--marquee-duration": `${48 + c * 10}s` } as CSSProperties}
                >
                  {[...column, ...column].map((img, i) => (
                    <div key={`${c}-${i}`} className="relative aspect-17/23 w-full overflow-hidden rounded-sm">
                      <Image
                        src={img.src}
                        alt=""
                        fill
                        sizes="16vw"
                        loading={i < 2 ? "eager" : "lazy"}
                        fetchPriority={c === 0 && i === 0 ? "high" : undefined}
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-band to-transparent lg:inset-x-0 lg:top-0 lg:bottom-auto lg:h-32 lg:w-auto lg:bg-linear-to-b" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-band to-transparent lg:inset-x-0 lg:top-auto lg:bottom-0 lg:h-32 lg:w-auto lg:bg-linear-to-t" />
        </motion.div>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-6 left-10 hidden items-center gap-3 text-[0.6875rem] tracking-[0.2em] text-band-muted uppercase lg:flex" aria-hidden="true">
        <span className="relative block h-10 w-px overflow-hidden bg-band-foreground/15">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-gold"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
        Scroll
      </div>
    </section>
  );
}
