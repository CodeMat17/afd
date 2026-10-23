"use client";

import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { SplitText } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export interface HeroImage {
  src: string;
  alt: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({
  images,
  fabrics,
  designCount,
}: {
  images: HeroImage[];
  fabrics: string[];
  designCount: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const reelScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  // Subtle pointer parallax on the desktop reel.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const reelX = useSpring(useTransform(px, [-0.5, 0.5], [-14, 14]), { stiffness: 60, damping: 20 });
  const reelY = useSpring(useTransform(py, [-0.5, 0.5], [-10, 10]), { stiffness: 60, damping: 20 });
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const third = Math.ceil(images.length / 3);
  const columns = [
    images.slice(0, third),
    images.slice(third, third * 2),
    images.slice(third * 2),
  ];

  const facts = [
    { value: String(fabrics.length).padStart(2, "0"), label: "Fabric families" },
    { value: String(designCount), label: "Designs online" },
    { value: site.address.city, label: "Showroom" },
  ];

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      onPointerMove={onPointerMove}
      className="grain relative isolate overflow-hidden bg-band text-band-foreground"
    >
      {/* Ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1/3 -left-1/4 -z-10 size-[60rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--gold)_16%,transparent),transparent)] blur-2xl"
      />

      {/* Large screens: exactly one viewport tall, so the whole hero is visible without scrolling. */}
      <div className="mx-auto grid max-w-360 lg:h-[calc(100svh-var(--header-height))] lg:min-h-[34rem] lg:grid-cols-[1.08fr_1fr]">
        {/* Copy */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-10 flex min-h-0 flex-col px-4 pt-12 pb-10 sm:px-6 sm:pt-16 lg:px-10 lg:py-[clamp(1.5rem,5svh,3.5rem)]"
        >
          <div className="flex flex-1 flex-col justify-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
              className="eyebrow flex items-center gap-3 text-gold"
            >
              <span className="h-px w-10 bg-gold/60" aria-hidden="true" />
              <MapPin className="size-3.5" aria-hidden="true" />
              {site.address.street}, {site.address.city}
            </motion.p>

            <h1
              id="hero-title"
              className="mt-[clamp(1rem,3svh,1.75rem)] font-heading text-[3.25rem] leading-[0.88] font-medium tracking-[-0.02em] sm:text-7xl lg:text-[clamp(3.75rem,min(6.4vw,11.5svh),7.5rem)]"
            >
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
              className="mt-[clamp(1rem,3svh,1.75rem)] max-w-md text-[0.9375rem] leading-relaxed text-pretty text-band-muted sm:text-base"
            >
              Ankara, Woven Kente, Isiagu, sequin prints and luxury lace — printed,
              woven and embellished textiles, brought together in one Nairobi showroom.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.85 }}
              className="mt-[clamp(1.25rem,4svh,2.25rem)] flex flex-wrap items-center gap-3"
            >
              <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "group")}>
                Shop the Collection
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link href="/gallery" className={buttonVariants({ variant: "outline-inverse", size: "lg" })}>
                View the Gallery
              </Link>
            </motion.div>
          </div>

          {/* Facts */}
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease, delay: 1.05 }}
            className="mt-10 grid grid-cols-3 border-t border-band-foreground/12 pt-[clamp(0.875rem,2.5svh,1.5rem)] lg:mt-6"
          >
            {facts.map((fact, i) => (
              <div
                key={fact.label}
                className={cn("flex flex-col-reverse gap-1", i > 0 && "border-l border-band-foreground/12 pl-4 sm:pl-6")}
              >
                <dt className="text-[0.625rem] font-semibold tracking-[0.2em] text-band-muted uppercase sm:text-[0.6875rem]">
                  {fact.label}
                </dt>
                <dd className="font-heading text-2xl leading-none tabular-nums sm:text-3xl">{fact.value}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Reel — decorative, the same products are listed below */}
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease, delay: 0.2 }}
          className="relative h-[17rem] overflow-hidden sm:h-[22rem] lg:h-auto lg:min-h-0 lg:overflow-visible lg:py-[clamp(1rem,3svh,2rem)] lg:pr-10"
        >
          {/* Mobile / tablet: horizontal film strip */}
          <div className="flex h-full items-center mask-x-from-90% mask-x-to-100% lg:hidden">
            <div className="flex h-full w-max animate-marquee-x gap-3 py-2 [--marquee-duration:55s]">
              {[...images, ...images].map((img, i) => (
                <div key={`m-${i}`} className="relative aspect-17/23 h-full shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={img.src}
                    alt=""
                    fill
                    sizes="200px"
                    loading={i < 4 ? "eager" : "lazy"}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: framed, three counter-scrolling columns */}
          <div className="relative hidden h-full overflow-hidden rounded-2xl bg-ink ring-1 ring-band-foreground/10 shadow-[0_40px_80px_-40px_rgb(20_16_13/0.55)] lg:block">
            <motion.div
              style={{ scale: reelScale, x: reelX, y: reelY }}
              className="absolute -inset-6 grid grid-cols-3 gap-3 mask-y-from-85% mask-y-to-100%"
            >
              {columns.map((column, c) => (
                <div key={c} className="relative overflow-hidden">
                  <div
                    className={cn(
                      "flex flex-col gap-3",
                      c === 1 ? "animate-marquee-down" : "animate-marquee-up",
                    )}
                    style={{ "--marquee-duration": `${52 + c * 10}s` } as CSSProperties}
                  >
                    {[...column, ...column].map((img, i) => (
                      <div key={`${c}-${i}`} className="relative aspect-17/23 w-full overflow-hidden rounded-lg">
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

            {/* Vignette + inner hairline */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(120%_80%_at_50%_50%,transparent_55%,rgb(15_12_10/0.45))]" />
            <div className="pointer-events-none absolute inset-3 rounded-xl border border-white/10" />

            <FabricCaption fabrics={fabrics} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** Glass caption that cycles through the fabric families. */
function FabricCaption({ fabrics }: { fabrics: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (fabrics.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % fabrics.length), 3200);
    return () => window.clearInterval(id);
  }, [fabrics.length]);

  if (fabrics.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease, delay: 1.2 }}
      className="absolute bottom-7 left-7 flex items-center gap-4 rounded-xl border border-white/15 bg-ink/45 py-3 pr-6 pl-4 text-ink-foreground shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)] backdrop-blur-xl"
    >
      <span className="relative flex size-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-gold/70" />
        <span className="relative size-2 rounded-full bg-gold" />
      </span>
      <div>
        <p className="text-[0.625rem] font-semibold tracking-[0.22em] text-ink-muted uppercase">
          In the showroom
        </p>
        <div className="relative mt-0.5 h-7 w-40 overflow-hidden">
          {fabrics.map((name, i) => (
            <p
              key={name}
              className={cn(
                "absolute inset-0 font-heading text-2xl leading-7 whitespace-nowrap italic transition-[translate,opacity] duration-700 ease-silk",
                i === index
                  ? "translate-y-0 opacity-100"
                  : i === (index - 1 + fabrics.length) % fabrics.length
                    ? "-translate-y-full opacity-0"
                    : "translate-y-full opacity-0",
              )}
            >
              {name}
            </p>
          ))}
        </div>
      </div>
      <span className="ml-2 font-heading text-sm text-ink-muted tabular-nums">
        {String(index + 1).padStart(2, "0")} / {String(fabrics.length).padStart(2, "0")}
      </span>
    </motion.div>
  );
}
