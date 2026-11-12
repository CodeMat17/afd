"use client";

import { ArrowRight } from "lucide-react";
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

import type { HeroImage } from "@/lib/types";

export type { HeroImage };

export function Hero({
  images,
  categoryNames,
}: {
  images: HeroImage[];
  /** Cycled in the showroom caption. */
  categoryNames: string[];
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

  // Three columns, dealt out in turn. With only a few photos they're
  // repeated so every column still has enough to scroll.
  const pool = images.length === 0 ? [] : Array.from({ length: Math.max(images.length, 9) }, (_, i) => images[i % images.length]);
  const columns = [0, 1, 2].map((c) => pool.filter((_, i) => i % 3 === c));
  const hasReel = images.length > 0;

  const facts = [
    { value: "Fine fabrics", label: "Ankara to luxury lace" },
    { value: "Head to toe", label: "Gele, turbans, ipele & beads" },
    { value: site.address.city, label: "Showroom & online" },
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
        className="pointer-events-none absolute -top-1/3 -left-1/4 -z-10 size-240 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--gold)_16%,transparent),transparent)] blur-2xl"
      />

      {/* Large screens: exactly one viewport tall, so the whole hero is visible without scrolling. */}
      <div className={cn("mx-auto grid max-w-360 lg:h-[calc(100svh-var(--header-height))] lg:min-h-[34rem]", hasReel && "lg:grid-cols-[1.08fr_1fr]")}>
        {/* Copy */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-10 flex min-h-0 flex-col justify-center px-4 pt-10 pb-8 sm:px-6 sm:pt-14 lg:px-10 lg:py-[clamp(1.25rem,4svh,3rem)] xl:pl-20"
        >
          {/* Vertical edition mark — wide screens only */}
          <div
            aria-hidden="true"
            style={{ animationDelay: "1.2s" }}
            className="enter-fade absolute inset-y-0 left-6 hidden flex-col items-center justify-center gap-4 xl:flex"
          >
            <span className="h-16 w-px bg-linear-to-b from-transparent to-gold/50" />
            <span className="text-[0.625rem] font-semibold tracking-[0.4em] whitespace-nowrap text-band-muted uppercase [writing-mode:vertical-rl] rotate-180">
              Fabrics · Fashion · Adornment
            </span>
            <span className="h-16 w-px bg-linear-to-t from-transparent to-gold/50" />
          </div>

          <div className="max-w-xl">
            <p
              style={{ "--enter-y": "12px", animationDuration: "0.8s" } as CSSProperties}
              className="enter-fade-up flex items-center gap-3 text-[0.6875rem] font-semibold tracking-[0.32em] text-gold uppercase"
            >
              <span className="h-px w-10 bg-linear-to-r from-transparent to-gold" aria-hidden="true" />
              {site.address.city} showroom
              <span className="hidden size-1 rotate-45 bg-gold/70 sm:inline-block" aria-hidden="true" />
              <span className="hidden font-medium tracking-[0.2em] text-band-muted normal-case sm:inline">{site.address.street}</span>
            </p>

            <h1
              id="hero-title"
              className="mt-[clamp(0.75rem,2svh,1.25rem)] font-heading text-[clamp(2.75rem,14vw,4rem)] leading-[0.9] font-bold tracking-[-0.03em] text-balance sm:text-8xl lg:text-[clamp(4.25rem,min(7.5vw,13svh),8rem)]"
            >
              <SplitText text="From the fabric" className="block" delay={0.1} />
              <span className="block">
                <SplitText text="to the" className="font-normal text-band-foreground/75 italic" delay={0.25} />{" "}
                <SplitText text="crown." className="text-gold italic" delay={0.4} />
              </span>
            </h1>

            {/* Gold ornament rule */}
            <div
              aria-hidden="true"
              style={{ animationDelay: "0.6s" }}
              className="enter-fade mt-[clamp(1rem,2.5svh,1.5rem)] flex w-28 items-center gap-2 text-gold"
            >
              <span className="h-px flex-1 bg-linear-to-r from-transparent to-gold/70" />
              <span className="size-1.5 rotate-45 border border-gold" />
              <span className="h-px flex-1 bg-linear-to-l from-transparent to-gold/70" />
            </div>

            <p
              style={{ animationDelay: "0.7s" }}
              className="enter-fade-up mt-[clamp(0.875rem,2.25svh,1.25rem)] max-w-108 text-[0.9375rem] leading-[1.75] text-pretty text-band-muted sm:text-base"
            >
              Ankara, Kente, Isiagu and luxury lace, plus ready-to-wear, gele, turbans,
              ipele and beads — everything for the occasion under one roof.
            </p>

            <div
              style={{ animationDelay: "0.85s" }}
              className="enter-fade-up mt-[clamp(1rem,3svh,1.75rem)] flex flex-wrap items-center gap-3"
            >
              <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "group")}>
                Shop the Collection
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href="/gallery"
                className="group/link relative ml-2 inline-flex h-13 items-center gap-2 px-2 text-[0.9375rem] font-semibold tracking-wide text-band-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/40 rounded-sm"
              >
                <span className="relative">
                  View the Gallery
                  <span className="absolute inset-x-0 -bottom-1 h-px origin-left bg-gold transition-transform duration-500 ease-silk group-hover/link:scale-x-0" />
                  <span className="absolute inset-x-0 -bottom-1 h-px origin-right scale-x-0 bg-band-foreground transition-transform delay-150 duration-500 ease-silk group-hover/link:origin-left group-hover/link:scale-x-100" />
                </span>
                <ArrowRight className="size-4 text-gold transition-transform duration-300 group-hover/link:translate-x-1" aria-hidden="true" />
              </Link>
            </div>

          {/* Facts — sit directly under the CTAs so they're visible above the fold */}
          <dl
            style={{ animationDelay: "1.05s" }}
            className="enter-fade mt-[clamp(1.5rem,4svh,2.5rem)] grid grid-cols-3 border-t border-band-foreground/12 pt-[clamp(0.875rem,2svh,1.25rem)]"
          >
            {facts.map((fact, i) => (
              <div
                key={fact.label}
                className={cn("flex flex-col-reverse justify-end gap-1", i > 0 && "border-l border-band-foreground/12 pl-4 sm:pl-6")}
              >
                <dt className="text-[0.625rem] font-semibold tracking-[0.2em] text-band-muted uppercase sm:text-[0.6875rem]">
                  {fact.label}
                </dt>
                <dd className="font-heading text-lg leading-tight font-semibold italic sm:text-2xl">{fact.value}</dd>
                <span aria-hidden="true" className="mb-1 text-[0.625rem] font-semibold tracking-[0.2em] text-gold tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </dl>
          </div>
        </motion.div>

        {/* Reel — decorative photos chosen in /admin/hero */}
        {hasReel ? (
        <div
          aria-hidden="true"
          className="enter-reel relative h-[17rem] overflow-hidden sm:h-[22rem] lg:h-auto lg:min-h-0 lg:overflow-visible lg:py-[clamp(1rem,3svh,2rem)] lg:pr-10"
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
                    loading={i < 3 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : undefined}
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

            <ShowroomCaption names={categoryNames} />
          </div>
        </div>
        ) : null}
      </div>
    </section>
  );
}

/** Glass caption that cycles through the store's categories. */
function ShowroomCaption({ names }: { names: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (names.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % names.length), 3200);
    return () => window.clearInterval(id);
  }, [names.length]);

  if (names.length === 0) return null;

  return (
    <div
      style={{ animationDelay: "1.2s", animationDuration: "1s" }}
      className="enter-fade-up absolute bottom-7 left-7 flex items-center gap-4 rounded-xl border border-white/15 bg-ink/45 py-3 pr-6 pl-4 text-ink-foreground shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)] backdrop-blur-xl"
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
          {names.map((name, i) => (
            <p
              key={name}
              className={cn(
                "absolute inset-0 font-heading text-2xl leading-7 whitespace-nowrap italic transition-[translate,opacity] duration-700 ease-silk",
                i === index
                  ? "translate-y-0 opacity-100"
                  : i === (index - 1 + names.length) % names.length
                    ? "-translate-y-full opacity-0"
                    : "translate-y-full opacity-0",
              )}
            >
              {name}
            </p>
          ))}
        </div>
      </div>
      <span className="ml-2 font-sans text-xs font-medium text-ink-muted tabular-nums lining-nums">
        {String(index + 1).padStart(2, "0")} / {String(names.length).padStart(2, "0")}
      </span>
    </div>
  );
}
